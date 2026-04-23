import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RectShape } from '../domain/rectangle.model';
import { Arrow } from '../domain/arrow.model';
import { DataService } from '../services/data.service';
import { Subscription } from 'rxjs';
import { VisuStateService } from './visu-state-service.service';
import { Subject, takeUntil } from 'rxjs';


export interface LoadUnit {
  id: string;
  status: 'WAITING' | 'DRIVING';
  currentRectName?: string;
  currentArrow?: Arrow;
  progress: number; // 0.0 bis 1.0
}

@Component({
  selector: 'app-visu-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './visu-viewer.component.html',
  styleUrls: ['./visu-viewer.component.scss']
})
export class VisuViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('conveyorPath') pathRefs!: QueryList<ElementRef<SVGPathElement>>;

  private destroy$ = new Subject<void>();
private dataSubscription: Subscription = new Subscription();
  private animationId?: number; // Speichert die ID der Animation für den Stopp
  private isDestroyed = false; // Flag für die Schleife
  data: any = { visu: [] };
  rects: RectShape[] = [];
  arrows: Arrow[] = [];
  loadUnits: LoadUnit[] = [];

  private pathLengths: { [key: string]: number } = {};
  private lastFrameTime: number = Date.now();

// Zoom & Pan Status
  scale: number = 1.0;
  translateX: number = 0;
  translateY: number = 0;

  // Für Panning (Verschieben mit der Maus)
  isPanning = false;
  startX = 0;
  startY = 0;
  // Stationen (rechteck- Aktiv oder inaktiv)
  stationStates: Map<string, boolean> = new Map(); // Speichert id -> isActive

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private visuService: VisuStateService
  ) {}

ngOnInit() {
    // 1. Horche auf URL Änderungen
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const menuName = params.get('menuName');
      if (menuName) {
        this.resetVisu(); // WICHTIG: Alles auf Null setzen beim Wechsel
        this.loadVisuData();
      }
    });
  }

  private resetVisu() {
    this.isDestroyed = false;
    this.loadUnits = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    // Wir trennen die Live-Events kurz, um sie gleich neu zu binden
    // (Oder du lässt sie global, aber hier räumen wir intern auf)
  }

  private loadVisuData() {
    this.dataService.data$.pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
      if (res && res.visu) {
        this.data = res;
        this.rects = res.visu.rects || [];
        this.arrows = res.visu.arrows || [];

        // Das setTimeout ist okay für SVG, aber wir müssen die Subscriptions darin schützen
        setTimeout(() => {
          if (this.isDestroyed) return;

          this.calculateAllLengths();
          this.visuService.connect();

          // LIVE EVENTS: Nur EINE Subscription, die wir vorher beenden
          this.visuService.luEvent$.pipe(takeUntil(this.destroy$)).subscribe(ev => {
            this.onBackendEvent(ev.type, ev.stationName, ev.luId, ev.direction);
          });

          this.startAnimationLoop();
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.destroy$.next(); // Stoppt alle RxJS Subscriptions sofort
    this.destroy$.complete();

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.visuService.disconnect();
  }


  /*ngOnInit() {
    const menuName = this.route.snapshot.paramMap.get('menuName');

    if (menuName) {
      // SCHRITT 1: Statische Visu-Daten (Landkarte) via HTTP laden
      this.dataService.data$?.subscribe((res: any) => {
        if (res) {
           this.data = res;
          // Daten zuweisen (dein JSON-Format aus dem ersten Prompt)
          this.rects = res.visu?.rects || [];
          this.arrows = res.visu?.arrows || [];

          console.log('Landkarte geladen:', this.rects.length, 'Stationen');

          // SCHRITT 2: Längen der Pfade berechnen (wichtig für Animation)
          // Wir nutzen setTimeout, damit das DOM (SVG) Zeit hat zu rendern
          setTimeout(() => {
            this.calculateAllLengths();

            // SCHRITT 3: Jetzt erst die Live-Verbindung öffnen
            this.visuService.connect();

            // SCHRITT 4: Auf Live-Events (LUs) reagieren
            this.visuService.luEvent$.subscribe(ev => {
              console.log('visuService', JSON.stringify(ev));
              this.onBackendEvent(ev.type, ev.stationName, ev.luId, ev.direction);
            });

            // SCHRITT 5: Animation starten
            this.startAnimationLoop();
          }, 100);
        }
      });
    }
  }

    ngOnDestroy() {
      // 1. Flag setzen, um Berechnungen sofort zu stoppen
      this.isDestroyed = true;

      // 2. Browser-Animation hart stoppen
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }

      // 3. WebSocket-Leitung kappen (spart Server-Ressourcen)
      this.visuService.disconnect();
    }*/

  ngAfterViewInit() {
    this.calculateAllLengths();
  }

  /** Längenmessung für exakte Geschwindigkeit */
calculateAllLengths() {
  this.pathRefs.forEach(ref => {
    const id = ref.nativeElement.id;
    try {
      const length = ref.nativeElement.getTotalLength();
      this.pathLengths[id] = length > 0 ? length : 1; // Vermeidung von Division durch 0
    } catch (e) {
      this.pathLengths[id] = 1;
    }
  });
}

  /** Zentrale Animationsschleife */
 private lastTimestamp: number = 0;

 private startAnimationLoop() {
   const animate = (timestamp: number) => {
     if (this.isDestroyed) return;

     if (!this.lastTimestamp) this.lastTimestamp = timestamp;
     const deltaTime = (timestamp - this.lastTimestamp) / 1000; // Zeit in Sekunden
     this.lastTimestamp = timestamp;

     this.loadUnits.forEach(lu => {
       if (lu.status === 'DRIVING' && lu.currentArrow) {
         // 1. Hol dir den Speed vom Pfeil (Default 1, falls nicht gesetzt)
         const arrowSpeed = lu.currentArrow.speed || 1;

         // 2. Basis-Geschwindigkeit definieren (z.B. 100 Pixel pro Sekunde bei Speed 1)
         const basePixelsPerSecond = 100;

         // 3. Gesamtlänge des Pfades in Pixeln
         const pathLength = this.pathLengths[lu.currentArrow.id] || 0;

         if (pathLength > 0) {
           // 4. Den Fortschritt berechnen:
           // Fortschritt += (Zeit * PixelProSekunde * SpeedFaktor) / Gesamtlänge
           const step = (deltaTime * basePixelsPerSecond * arrowSpeed) / pathLength;
           lu.progress += step;

           if (lu.progress >= 1) {
             lu.progress = 1;
             // Optionale Logik: lu.status = 'WAITING' wenn am Ende angekommen
           }
         }
       }
     });

     this.animationId = requestAnimationFrame(animate);
   };
   this.animationId = requestAnimationFrame(animate);
 }

  /** Reagiert auf Backend-Events */
 onBackendEvent(eventName: 'LEFT' | 'ARRIVED', rectName: string, luId: string, targetDirection?: 'R' | 'L' | 'S') {
   // 1. Sicherheitscheck: Sind die Basisdaten überhaupt da?
   if (this.rects.length === 0 || this.arrows.length === 0) {
     console.warn(`Event ${eventName} ignoriert: Visu-Daten noch nicht geladen.`);
     return;
   }

   let lu = this.loadUnits.find(l => l.id === luId);

   // 2. Fall: LU kommt an einem Rechteck an
   if (eventName === 'ARRIVED') {
     const targetRect = this.rects.find(r => r.name === rectName);
     if (!targetRect) return;

     if (!lu) {
       lu = { id: luId, status: 'WAITING', currentRectName: rectName, progress: 1 };
       this.loadUnits.push(lu);
     } else {
       lu.status = 'WAITING';
       lu.currentRectName = rectName;
       lu.currentArrow = undefined;
       lu.progress = 1;
     }
   }

   // 3. Fall: LU verlässt ein Rechteck
   else if (eventName === 'LEFT') {
     // PRÜFUNG: Wenn wir losfahren wollen, MÜSSEN wir wissen, wohin (targetDirection)
       if (!targetDirection) {
         console.error(`Event LEFT für ${rectName} ohne targetDirection empfangen!`);
         return; // Wir brechen ab, weil wir ohne Richtung keinen Pfeil finden können
       }

     const arrow = this.getArrowFromRectAndDirection(rectName, targetDirection);

     if (arrow) {
       if (!lu) {
         // Falls die LU plötzlich aus dem Nichts startet (z.B. nach Systemstart)
         lu = { id: luId, status: 'DRIVING', currentArrow: arrow, progress: 0 };
         this.loadUnits.push(lu);
       } else {
         lu.status = 'DRIVING';
         lu.currentArrow = arrow;
         lu.progress = 0;
         lu.currentRectName = undefined;
       }
     } else {
       console.error(`Kein passender Abzweig von ${rectName} in Richtung ${targetDirection} gefunden!`);
     }
   }
 }

generatePath(a: Arrow): string {
  // Finde Start- und Ziel-Rechteck
  const startRect = this.rects.find(r => r.id === (a as any).from);
  const endRect = this.rects.find(r => r.id === (a as any).to);

  if (!startRect || !endRect) return '';

  // Berechne Mittelpunkte
  const startX = startRect.x + startRect.width / 2;
  const startY = startRect.y + startRect.height / 2;
  const endX = endRect.x + endRect.width / 2;
  const endY = endRect.y + endRect.height / 2;

  // Baue den Pfad: Start -> Waypoints (falls vorhanden) -> Ende
  let path = `M ${startX},${startY}`;

  if (a.waypoints && a.waypoints.length > 0) {
    a.waypoints.forEach(p => {
      path += ` L ${p.x},${p.y}`;
    });
  }

  path += ` L ${endX},${endY}`;
  return path;
}

private getArrowFromRectAndDirection(rectName: string, direction: string): Arrow | undefined {
  const rect = this.rects.find(r => r.name === rectName);
  if (!rect) return undefined;

  const arr = this.arrows.find(a => (a as Arrow).from === rect.id &&
                               (a.direction === direction));

console.log('Arrows:', this.arrows);
  console.log('Von Station:', rectName,'Arrow:', arr);
  return arr;
}

  /** Hilfsmethode für die Anzeige im HTML */
getLUPosition(lu: LoadUnit): { x: number, y: number } {
  if (lu.status === 'WAITING' && lu.currentRectName) {
    const rect = this.rects.find(r => r.name === lu.currentRectName);
    return rect ? { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 } : { x: 0, y: 0 };
  }

  if (lu.currentArrow) {
    const pathElement = document.getElementById(lu.currentArrow.id) as unknown as SVGPathElement;
    if (pathElement) {
      const point = pathElement.getPointAtLength(lu.progress * pathElement.getTotalLength());
      return { x: point.x, y: point.y };
    }
  }
  return { x: 0, y: 0 };
}
 /*********************ZOOM-IN/OUT****************************** */


  /** Mausrad-Zoom */
  public transformStyle: string = 'translate(0px, 0px) scale(1)';

onWheel(event: WheelEvent) {
  event.preventDefault();

  const zoomSpeed = 0.001;
  const delta = -event.deltaY;

  // 1. Aktuelle Mausposition im Browser-Fenster
  const mouseX = event.clientX;
  const mouseY = event.clientY;

  // 2. Den Container finden, um die relative Position zu bestimmen
  const container = (event.currentTarget as HTMLElement).getBoundingClientRect();

  // Relative Mausposition innerhalb des Containers
  const relativeX = mouseX - container.left;
  const relativeY = mouseY - container.top;

  // 3. Alten Scale speichern für die Berechnung
  const oldScale = this.scale;

  // 4. Neuen Scale berechnen
  const newScale = Math.min(Math.max(0.1, this.scale + delta * zoomSpeed), 5);

  if (newScale !== oldScale) {
    // 5. Den Versatz berechnen (Zoom-to-Mouse Logik)
    // Wir verschieben den Ursprung so, dass der Punkt unter der Maus fix bleibt
    this.translateX -= (relativeX - this.translateX) * (newScale / oldScale - 1);
    this.translateY -= (relativeY - this.translateY) * (newScale / oldScale - 1);

    this.scale = newScale;
    this.updateTransform();
  }
}

  // Hilfsmethode für das Update
  private updateTransform() {
    this.transformStyle = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
  }

  // Panning anpassen
  doPan(event: MouseEvent) {
    if (this.isPanning) {
      this.translateX = event.clientX - this.startX;
      this.translateY = event.clientY - this.startY;
      this.updateTransform(); // Update aufrufen!
    }
  }

  /** Start Panning */
  startPan(event: MouseEvent) {
    if (event.button === 0) { // Linksklick oder Mausrad-Klick
      this.isPanning = true;
      this.startX = event.clientX - this.translateX;
      this.startY = event.clientY - this.translateY;
    }
  }


  /** Ende Panning */
  endPan() {
    this.isPanning = false;
  }

/** Hilfsmethode für das HTML-Binding der Farbe */
getStationColor(rectId: string): string {
  const active = this.stationStates.get(rectId);
  if (active === undefined) return 'white'; // Initialzustand
  return active ? 'white' : '#ff4d4d'; // Rot wenn inaktiv
}

}
