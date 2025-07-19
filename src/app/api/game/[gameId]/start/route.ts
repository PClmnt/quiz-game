import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { GameRoom } from '@/types/multiplayer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    const body = await request.json();
    const { playerId }: { playerId: string } = body;

    // Get game room
    const gameRoom = await kv.get<GameRoom>(`game:${gameId}`);
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Check if player is host
    if (gameRoom.hostId !== playerId) {
      return NextResponse.json(
        { error: 'Only the host can start the game' },
        { status: 403 }
      );
    }

    if (gameRoom.phase !== 'setup') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Start the game
    const updatedGameRoom: GameRoom = {
      ...gameRoom,
      phase: 'playing',
      currentQuestionStartedAt: new Date(),
      updatedAt: new Date()
    };

    await kv.set(`game:${gameId}`, updatedGameRoom);

    return NextResponse.json({
      success: true,
      gameRoom: updatedGameRoom
    });

  } catch (error) {
    console.error('Error starting game:', error);
    return NextResponse.json(
      { error: 'Failed to start game' },
      { status: 500 }
    );
  }
}