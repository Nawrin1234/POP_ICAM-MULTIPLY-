
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameState {
  score: number;
  level: number;
  targetSum: number;
  currentSum: number;
  selectedBubbles: number[];
  bubbles: BubbleData[];
  status: 'start' | 'playing' | 'reward' | 'victory';
}

export interface BubbleData {
  id: string;
  value: number;
  x: number;
  y: number;
  color: string;
  size: number;
  speed: number;
}
