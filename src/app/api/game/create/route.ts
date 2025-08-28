import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';
import { GameRoom, PlayerSession, QuizSettings } from '@/types/multiplayer';
import { TriviaApiService } from '@/services/trivia-api';
import { logoQuestions, soundQuestions } from '@/data/questions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { playerName, settings, gameMode = 'individual' }: { playerName: string; settings: QuizSettings; gameMode?: 'individual' | 'teams' } = body;

    if (!playerName?.trim()) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    // Generate IDs
    const gameId = uuidv4();
    const playerId = uuidv4();

    // Fetch trivia questions
    const apiQuestions = await TriviaApiService.getQuestions({
      amount: settings.amount,
      category: settings.category,
      difficulty: settings.difficulty,
      type: 'multiple'
    });

    const triviaQuestions = TriviaApiService.convertToQuizFormat(apiQuestions);
    
    // Create rounds
    const rounds = [];
    
    if (triviaQuestions.length > 0) {
      rounds.push({
        id: 'trivia',
        name: `Trivia Questions (${settings.difficulty || 'mixed'})`,
        type: 'general' as const,
        questions: triviaQuestions
      });
    }
    
    if (settings.includeLogos) {
      rounds.push(logoQuestions);
    }
    
    if (settings.includeSounds) {
      rounds.push(soundQuestions);
    }

    // Create game room
    const gameRoom: GameRoom = {
      id: gameId,
      hostId: playerId,
      name: `${playerName}'s Quiz`,
      settings,
      rounds,
      currentRound: 0,
      currentQuestion: 0,
      phase: 'setup',
      players: [playerId],
      teams: [],
      gameMode,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Create player session
    const playerSession: PlayerSession = {
      id: playerId,
      name: playerName.trim(),
      gameId,
      answers: {},
      score: 0,
      isHost: true,
      joinedAt: new Date()
    };

    // Store in KV
    await Promise.all([
      kv.set(`game:${gameId}`, gameRoom),
      kv.set(`player:${playerId}`, playerSession),
      kv.expire(`game:${gameId}`, 3600), // 1 hour expiry
      kv.expire(`player:${playerId}`, 3600)
    ]);

    return NextResponse.json({
      gameId,
      playerId,
      gameRoom,
      playerSession
    });

  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json(
      { error: 'Failed to create game' },
      { status: 500 }
    );
  }
}