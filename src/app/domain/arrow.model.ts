export type ConveyorType = 'roller' | 'belt' | 'chain';
export interface Arrow {
  waypoints: { x: number, y: number }[];
  id: string;
  from: string;
  to: string;
  type: ConveyorType; // Neu: Typ des Förderers
  speed: number;      // Neu: Laufgeschwindigkeit (für Animation)
  cost: number;
  direction: 'R' | 'L' | 'S';
  fromSide: 'top' | 'bottom' | 'left' | 'right';
    toSide: 'top' | 'bottom' | 'left' | 'right';
}

