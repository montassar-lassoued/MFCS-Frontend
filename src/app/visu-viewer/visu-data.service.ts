import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VisuDataService {
  constructor(private http: HttpClient) {}

  getVisuConfig() {
    return this.http.get<any>('api/visu-config').pipe(
      map(data => {
        // Hier transformieren wir die Daten, falls nötig
        const arrows = data.arrows.map((a: any) => ({
          ...a,
          // Falls waypoints als String "x1,y1;x2,y2" kommen, umwandeln in Array
          waypoints: typeof a.waypoints === 'string' && a.waypoints !== ""
            ? a.waypoints.split(';').map((p: string) => {
                const [x, y] = p.split(',');
                return { x: Number(x), y: Number(y) };
              })
            : (Array.isArray(a.waypoints) ? a.waypoints : [])
        }));

        return { rects: data.rects, arrows: arrows, aisles:data.aisles };
      })
    );
  }
}
