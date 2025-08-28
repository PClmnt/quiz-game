import { Badge } from '@/components/ui/badge';
import { Team, PlayerSession } from '@/types/multiplayer';

interface TeamScoreboardProps {
  teams: Team[];
  players: PlayerSession[];
  currentPlayerId: string;
}

export function TeamScoreboard({ teams, players, currentPlayerId }: TeamScoreboardProps) {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const currentPlayerTeam = teams.find(team => 
    team.playerIds.includes(currentPlayerId)
  );

  return (
    <div className="space-y-3">
      {sortedTeams.map((team, index) => {
        const teamPlayers = players.filter(p => p.teamId === team.id);
        const isMyTeam = team.id === currentPlayerTeam?.id;
        
        return (
          <div 
            key={team.id} 
            className={`p-4 rounded-lg border-2 ${
              isMyTeam ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">
                  {index === 0 ? '🏆' : `${index + 1}.`}
                </span>
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: team.color }}
                />
                <span className="font-semibold text-lg">{team.name}</span>
                {isMyTeam && <Badge variant="outline">Your Team</Badge>}
              </div>
              <Badge variant={index === 0 ? "default" : "secondary"} className="text-lg">
                {team.score} pts
              </Badge>
            </div>
            
            <div className="ml-8 space-y-1">
              {teamPlayers.map(player => (
                <div key={player.id} className="flex justify-between text-sm text-gray-600">
                  <span>
                    {player.name}
                    {player.id === currentPlayerId && ' (You)'}
                    {player.id === team.captainId && ' ⭐'}
                  </span>
                  <span>{player.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}