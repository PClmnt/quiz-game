import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { PlayerSession } from '@/types/multiplayer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId, questionId, answerIndex }: {
      playerId: string;
      questionId: string;
      answerIndex: number;
    } = body;

    if (!playerId || !questionId || answerIndex === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get player session
    const playerSession = await kv.get<PlayerSession>(`player:${playerId}`);
    if (!playerSession || playerSession.gameId !== gameId) {
      return NextResponse.json(
        { error: 'Player not found or not in this game' },
        { status: 404 }
      );
    }

    // Update player's answer
    const updatedPlayer: PlayerSession = {
      ...playerSession,
      answers: {
        ...playerSession.answers,
        [questionId]: answerIndex
      }
    };

    await kv.set(`player:${playerId}`, updatedPlayer);

    return NextResponse.json({
      success: true,
      playerSession: updatedPlayer
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}