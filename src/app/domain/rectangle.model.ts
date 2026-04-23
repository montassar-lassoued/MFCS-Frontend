export interface RectShape {
  id: string;
  name?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  controller?: string;
  initialX?: number; initialY?: number; // Hilfsvariablen für Drag
}
