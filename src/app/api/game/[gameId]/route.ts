import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { GameRoom, PlayerSession, Team } from "@/types/multiplayer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> }
) {
  try {
    const { gameId } = await params;

    // Get player ID from query params to determine if this is the host
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    const gameRoom = await kv.get<GameRoom>(`game:${gameId}`);
    if (!gameRoom) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // Get all player sessions
    const players = await Promise.all(
      gameRoom.players.map(async (playerId) => {
        const player = await kv.get<PlayerSession>(`player:${playerId}`);
        return player;
      })
    );

    const validPlayers = players.filter(Boolean) as PlayerSession[];

    // Get teams if in team mode
    let teams: Team[] = [];
    if (gameRoom.gameMode === "teams") {
      const teamData = await Promise.all(
        gameRoom.teams.map(async (teamId) => {
          const team = await kv.get<Team>(`team:${teamId}`);
          return team;
        })
      );
      teams = teamData.filter(Boolean) as Team[];
    }

    // Create a copy of gameRoom for the response
    let responseGameRoom: unknown = { ...gameRoom };

    // If the requester is NOT the host, remove correct answer indexes from questions
    const isHost = playerId && gameRoom.hostId === playerId;
    if (!isHost) {
      responseGameRoom = {
        ...gameRoom,
        rounds: gameRoom.rounds.map((round) => ({
          ...round,
          questions: round.questions.map((question) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { correctAnswer, ...questionWithoutAnswer } = question;
            return questionWithoutAnswer;
          }),
        })),
      };
    }

    return NextResponse.json({
      gameRoom: responseGameRoom,
      players: validPlayers,
      teams,
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    return NextResponse.json(
      { error: "Failed to fetch game" },
      { status: 500 }
    );
  }
}
