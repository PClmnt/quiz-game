import { randomInt } from 'crypto';
import { kv } from '@/lib/kv';
import { GameRoom } from '@/types/multiplayer';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const ROOM_CODE_LENGTH = 6;

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function createCode(length: number): string {
  return Array.from({ length }, () => ROOM_CODE_CHARS[randomInt(ROOM_CODE_CHARS.length)]).join('');
}

export function normalizeGameIdentifier(identifier: string): string {
  return identifier.trim();
}

export async function createUniqueRoomCode(): Promise<string> {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const roomCode = createCode(ROOM_CODE_LENGTH);
    const existingGameId = await kv.get<string>(`room-code:${roomCode}`);

    if (!existingGameId) {
      return roomCode;
    }
  }

  throw new Error('Failed to generate a unique room code');
}

export function createAccessCode(): string {
  return createCode(ROOM_CODE_LENGTH);
}

export async function resolveGameId(identifier: string): Promise<string | null> {
  const normalizedIdentifier = normalizeGameIdentifier(identifier);
  const directGame = await kv.get<GameRoom>(`game:${normalizedIdentifier}`);

  if (directGame) {
    return directGame.id;
  }

  return kv.get<string>(`room-code:${normalizeCode(normalizedIdentifier)}`);
}

export async function getGameRoomByIdentifier(identifier: string): Promise<{
  gameId: string | null;
  gameRoom: GameRoom | null;
}> {
  const gameId = await resolveGameId(identifier);

  if (!gameId) {
    return { gameId: null, gameRoom: null };
  }

  const gameRoom = await kv.get<GameRoom>(`game:${gameId}`);
  return {
    gameId,
    gameRoom,
  };
}
