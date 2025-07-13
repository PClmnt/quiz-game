export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'general' | 'logo' | 'sound';
  mediaUrl?: string;
}

export interface Round {
  id: string;
  name: string;
  type: 'general' | 'logo' | 'sound';
  questions: Question[];
}

export interface GameState {
  players: Player[];
  rounds: Round[];
  currentRound: number;
  currentQuestion: number;
  gamePhase: 'setup' | 'playing' | 'results' | 'finished';
  answers: Record<string, number>;
}