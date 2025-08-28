import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';
import { GameRoom, PlayerSession, Team } from '@/types/multiplayer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gameId, playerName }: { gameId: string; playerName: string } = body;

    if (!gameId || !playerName?.trim()) {
      return NextResponse.json(
        { error: 'Game ID and player name are required' },
        { status: 400 }
      );
    }

    // Get game room
    const gameRoom = await kv.get<GameRoom>(`game:${gameId}`);
    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    if (gameRoom.phase !== 'setup') {
      return NextResponse.json(
        { error: 'Game has already started' },
        { status: 400 }
      );
    }

    // Check if player name already exists
    const existingPlayers = await Promise.all(
      gameRoom.players.map(id => kv.get<PlayerSession>(`player:${id}`))
    );

    const nameExists = existingPlayers.some(
      player => player?.name.toLowerCase() === playerName.trim().toLowerCase()
    );

    if (nameExists) {
      return NextResponse.json(
        { error: 'Player name already taken' },
        { status: 400 }
      );
    }

    // Create new player
    const playerId = uuidv4();
    const playerSession: PlayerSession = {
      id: playerId,
      name: playerName.trim(),
      gameId,
      answers: {},
      score: 0,
      isHost: false,
      joinedAt: new Date()
    };

    // Update game room
    const updatedGameRoom: GameRoom = {
      ...gameRoom,
      players: [...gameRoom.players, playerId],
      updatedAt: new Date()
    };

    // Store updates
    await Promise.all([
      kv.set(`game:${gameId}`, updatedGameRoom),
      kv.set(`player:${playerId}`, playerSession),
      kv.expire(`player:${playerId}`, 3600)
    ]);

    // In team mode, fetch teams for the response
    let teams: Team[] = [];
    if (gameRoom.gameMode === 'teams') {
      const teamData = await Promise.all(
        gameRoom.teams.map(teamId => kv.get<Team>(`team:${teamId}`))
      );
      teams = teamData.filter(Boolean) as Team[];
    }

    return NextResponse.json({
      playerId,
      gameRoom: updatedGameRoom,
      playerSession,
      teams
    });

  } catch (error) {
    console.error('Error joining game:', error);
    return NextResponse.json(
      { error: 'Failed to join game' },
      { status: 500 }
    );
  }
}