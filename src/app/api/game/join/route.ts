import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { kv } from '@/lib/kv';
import { GameRoom, PlayerSession, Team } from '@/types/multiplayer';
import { createAccessCode, getGameRoomByIdentifier } from '@/lib/game-room';

function toPublicPlayerSession(playerSession: PlayerSession): PlayerSession {
  const publicPlayerSession = { ...playerSession };
  delete publicPlayerSession.accessCode;
  return publicPlayerSession;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      gameId,
      playerName,
      accessCode,
    }: { gameId: string; playerName?: string; accessCode?: string } = body;

    if (!gameId) {
      return NextResponse.json(
        { error: 'Game ID or room code is required' },
        { status: 400 }
      );
    }

    const { gameId: resolvedGameId, gameRoom } = await getGameRoomByIdentifier(gameId);
    if (!resolvedGameId || !gameRoom) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const existingPlayers = await Promise.all(
      gameRoom.players.map(id => kv.get<PlayerSession>(`player:${id}`))
    );
    const validExistingPlayers = existingPlayers.filter(Boolean) as PlayerSession[];

    const normalizedAccessCode = accessCode?.trim().toUpperCase();
    const matchingPlayer = normalizedAccessCode
      ? validExistingPlayers.find((player) => player.accessCode === normalizedAccessCode)
      : null;

    if (matchingPlayer) {
      if (playerName?.trim() && matchingPlayer.name.toLowerCase() !== playerName.trim().toLowerCase()) {
        return NextResponse.json(
          { error: 'Recovery code does not match that player name' },
          { status: 400 }
        );
      }

      let teams: Team[] = [];
      if (gameRoom.gameMode === 'teams') {
        const teamData = await Promise.all(
          gameRoom.teams.map(teamId => kv.get<Team>(`team:${teamId}`))
        );
        teams = teamData.filter(Boolean) as Team[];
      }

      return NextResponse.json({
        playerId: matchingPlayer.id,
        roomCode: gameRoom.roomCode,
        gameRoom,
        playerSession: toPublicPlayerSession(matchingPlayer),
        playerAccessCode: matchingPlayer.accessCode,
        teams,
        rejoined: true,
      });
    }

    if (gameRoom.phase !== 'setup') {
      return NextResponse.json(
        { error: 'Game has already started. Use your recovery code to rejoin.' },
        { status: 400 }
      );
    }

    if (!playerName?.trim()) {
      return NextResponse.json(
        { error: 'Player name is required to join a new seat' },
        { status: 400 }
      );
    }

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
    const playerAccessCode = createAccessCode();
    const playerSession: PlayerSession = {
      id: playerId,
      name: playerName.trim(),
      gameId: resolvedGameId,
      accessCode: playerAccessCode,
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
      kv.set(`game:${resolvedGameId}`, updatedGameRoom),
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
      roomCode: gameRoom.roomCode,
      gameRoom: updatedGameRoom,
      playerSession: toPublicPlayerSession(playerSession),
      playerAccessCode,
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
