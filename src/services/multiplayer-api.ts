import { QuizSettings } from '@/types/multiplayer';

export class MultiplayerApiService {
  static async createGame(playerName: string, settings: QuizSettings) {
    const response = await fetch('/api/game/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, settings }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create game');
    }

    return response.json();
  }

  static async joinGame(gameId: string, playerName: string) {
    const response = await fetch('/api/game/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ gameId, playerName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to join game');
    }

    return response.json();
  }

  static async getGameState(gameId: string) {
    const response = await fetch(`/api/game/${gameId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch game state');
    }

    return response.json();
  }

  static async submitAnswer(gameId: string, playerId: string, questionId: string, answerIndex: number) {
    const response = await fetch(`/api/game/${gameId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId, questionId, answerIndex }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit answer');
    }

    return response.json();
  }

  static async startGame(gameId: string, playerId: string) {
    const response = await fetch(`/api/game/${gameId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start game');
    }

    return response.json();
  }

  static async nextQuestion(gameId: string, playerId: string) {
    const response = await fetch(`/api/game/${gameId}/next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to advance game');
    }

    return response.json();
  }

  static generateGameUrl(gameId: string): string {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/game/${gameId}`;
    }
    return `https://quiz-game.vercel.app/game/${gameId}`;
  }

  static generateShareableLink(gameId: string): string {
    return this.generateGameUrl(gameId);
  }
}