import { Round } from './quiz';

export interface PlayerSession {
  id: string;
  name: string;
  gameId: string;
  answers: Record<string, number>;
  score: number;
  isHost: boolean;
  joinedAt: Date;
}

export interface GameRoom {
  id: string;
  hostId: string;
  name: string;
  settings: QuizSettings;
  rounds: Round[];
  currentRound: number;
  currentQuestion: number;
  phase: 'setup' | 'playing' | 'waiting' | 'results' | 'finished';
  players: string[]; // Player IDs
  createdAt: Date;
  updatedAt: Date;
  currentQuestionStartedAt?: Date;
  questionTimeLimit?: number; // seconds
}

export interface QuizSettings {
  amount: number;
  category?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  includeLogos: boolean;
  includeSounds: boolean;
  questionTimeLimit: number; // seconds per question
}

export interface PlayerAnswer {
  playerId: string;
  questionId: string;
  answerIndex: number;
  answeredAt: Date;
}

export interface QuestionResult {
  questionId: string;
  correctAnswer: number;
  playerResults: {
    playerId: string;
    answerIndex?: number;
    isCorrect: boolean;
    points: number;
  }[];
}

export interface GameEvent {
  type: 'player_joined' | 'player_answered' | 'question_started' | 'question_ended' | 'game_finished';
  data: unknown;
  timestamp: Date;
}