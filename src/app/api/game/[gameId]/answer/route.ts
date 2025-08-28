import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@/lib/kv';
import { PlayerSession, GameRoom, Team } from '@/types/multiplayer';

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

    // Get player session and game room
    const [playerSession, gameRoom] = await Promise.all([
      kv.get<PlayerSession>(`player:${playerId}`),
      kv.get<GameRoom>(`game:${gameId}`)
    ]);

    if (!playerSession || playerSession.gameId !== gameId) {
      return NextResponse.json(
        { error: 'Player not found or not in this game' },
        { status: 404 }
      );
    }

    if (!gameRoom) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    // In team mode, check if another team member already answered
    if (gameRoom.gameMode === 'teams' && playerSession.teamId) {
      const team = await kv.get<Team>(`team:${playerSession.teamId}`);
      if (team) {
        // Check if any team member already answered this question
        const teamMembers = await Promise.all(
          team.playerIds.map(id => kv.get<PlayerSession>(`player:${id}`))
        );
        
        const alreadyAnswered = teamMembers.some(
          member => member && member.answers[questionId] !== undefined
        );
        
        if (alreadyAnswered) {
          return NextResponse.json(
            { error: 'A team member has already answered this question' },
            { status: 400 }
          );
        }
      }
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