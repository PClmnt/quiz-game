'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameRoom, PlayerSession, Team } from '@/types/multiplayer';
import { MultiplayerApiService } from '@/services/multiplayer-api';

interface TeamSetupProps {
  gameRoom: GameRoom;
  currentPlayer: PlayerSession;
  teams: Team[];
  onTeamUpdate: () => void;
}

export function TeamSetup({ gameRoom, currentPlayer, teams, onTeamUpdate }: TeamSetupProps) {
  const [teamName, setTeamName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  const createTeam = async () => {
    if (!teamName.trim() || creating) return;

    setCreating(true);
    try {
      await MultiplayerApiService.createTeam(gameRoom.id, teamName, currentPlayer.id);
      setTeamName('');
      onTeamUpdate();
    } catch (error) {
      console.error('Failed to create team:', error);
    } finally {
      setCreating(false);
    }
  };

  const joinTeam = async (teamId: string) => {
    if (joining || currentPlayer.teamId) return;

    setJoining(teamId);
    try {
      await MultiplayerApiService.joinTeam(gameRoom.id, teamId, currentPlayer.id);
      onTeamUpdate();
    } catch (error) {
      console.error('Failed to join team:', error);
    } finally {
      setJoining(null);
    }
  };

  const playerTeam = teams.find(team => team.playerIds.includes(currentPlayer.id));
  const canCreateTeam = !playerTeam && (!gameRoom.settings.maxTeams || teams.length < gameRoom.settings.maxTeams);

  return (
    <div className="space-y-4">
      {playerTeam ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: playerTeam.color }}
                />
                <span className="font-medium">{playerTeam.name}</span>
                {playerTeam.captainId === currentPlayer.id && (
                  <Badge variant="secondary">Captain</Badge>
                )}
              </div>
              <Badge>{playerTeam.playerIds.length} players</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {canCreateTeam && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create a Team</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); createTeam(); }} className="flex gap-2">
                  <Input
                    placeholder="Team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    maxLength={30}
                    disabled={creating}
                  />
                  <Button type="submit" disabled={!teamName.trim() || creating}>
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Join a Team</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No teams yet. Create one above!</p>
              ) : (
                <div className="space-y-2">
                  {teams.map((team) => {
                    const isFull = gameRoom.settings.maxPlayersPerTeam && 
                                  team.playerIds.length >= gameRoom.settings.maxPlayersPerTeam;
                    
                    return (
                      <div 
                        key={team.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: team.color }}
                          />
                          <span className="font-medium">{team.name}</span>
                          <Badge variant="outline">
                            {team.playerIds.length}
                            {gameRoom.settings.maxPlayersPerTeam && 
                              `/${gameRoom.settings.maxPlayersPerTeam}`} players
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => joinTeam(team.id)}
                          disabled={isFull || joining === team.id}
                        >
                          {joining === team.id ? 'Joining...' : isFull ? 'Full' : 'Join'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}