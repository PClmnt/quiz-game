import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { GameRoom, PlayerSession } from '@/types/multiplayer';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;
    
    const gameRoom = await kv.get<GameRoom>(`game:${gameId}`);
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // Get all player sessions
    const players = await Promise.all(
      gameRoom.players.map(async (playerId) => {
        const player = await kv.get<PlayerSession>(`player:${playerId}`);
        return player;
      })
    );

    const validPlayers = players.filter(Boolean) as PlayerSession[];

    return NextResponse.json({
      gameRoom,
      players: validPlayers
    });

  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    );
  }
}