export interface RBG {
  id: string;
  name: string;
  positionOffset: number; // 0.0 (Start) bis 1.0 (Ende der Gasse)
  controller?: string;
  width: number;
  height: number;
}

export interface Aisle {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  orientation: 'horizontal' | 'vertical';
  rbg?: RBG;
  initialX?: number; // Für Drag & Drop
  initialY?: number;
}
