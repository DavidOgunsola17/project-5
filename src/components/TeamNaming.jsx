import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { sounds } from '../lib/sounds';

const TEAM_NAME_SUGGESTIONS = [
  'The Lightning Bolts',
  'Dream Team',
  'The Thinkers',
  'Victory Squad',
  'Brainwave',
  'The Masterminds',
  'Team Awesome',
  'The Champions',
  'Thunder Squad',
  'The Winners',
];

export function TeamNaming({ teams, onComplete, username, isHost, existingTeamNames = {} }) {
  // Find the player's team
  const myTeam = teams.find(team => team.players.includes(username || 'Player 1'));
  
  // Initialize with existing name if available, or empty
  const [teamName, setTeamName] = useState(existingTeamNames[myTeam?.name] || '');

  const handleNameChange = (newName) => {
    setTeamName(newName);
  };

  const generateRandomName = () => {
    sounds.tap();
    const randomName = TEAM_NAME_SUGGESTIONS[Math.floor(Math.random() * TEAM_NAME_SUGGESTIONS.length)];
    setTeamName(randomName);
  };

  const handleContinue = () => {
    sounds.success();
    const finalNames = { ...existingTeamNames }; // Preserve existing names
    teams.forEach(team => {
      // Use the player's input if it's their team, otherwise keep existing or use default
      if (team === myTeam && teamName.trim()) {
        finalNames[team.name] = teamName.trim();
      } else if (!finalNames[team.name]) {
        // For other teams, keep existing name or use default
        finalNames[team.name] = team.name;
      }
    });
    onComplete(finalNames);
  };

  // Host sees all teams (for observation), players only see their own team
  if (isHost) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
      >
        <Card className="max-w-3xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-3 tracking-tight">Team Naming</h1>
            <p className="text-gray-600 text-lg font-medium">
              Players are naming their teams...
            </p>
          </div>
          <div className="space-y-4">
            {teams.map((team, idx) => (
              <Card key={team.name} variant={['blue', 'yellow', 'purple', 'orange'][idx % 4]} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{team.name}</h3>
                    <p className="text-sm text-gray-600">{team.players.length} players</p>
                  </div>
                  <div className="text-sm text-gray-500 italic">Waiting for team name...</div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-8">
            <Button size="lg" onClick={handleContinue} className="w-full">
              Continue
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Player view - only show their own team
  if (!myTeam) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
      >
        <Card className="max-w-2xl w-full text-center">
          <p className="text-gray-600">Loading your team...</p>
        </Card>
      </motion.div>
    );
  }

  const teamIndex = teams.indexOf(myTeam);
  const teamColor = ['blue', 'yellow', 'purple', 'orange'][teamIndex % 4];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <Card className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3 tracking-tight">Name Your Team</h1>
          <p className="text-gray-600 text-lg font-medium">
            Give your team a name
          </p>
        </div>

        <Card variant={teamColor} className="p-6 mb-6">
          <div className="mb-6">
            <h3 className="font-black text-lg mb-4 text-gray-900">Your Team</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {myTeam.players.map((player, pIdx) => (
                <div
                  key={pIdx}
                  className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-full font-bold text-sm"
                >
                  {player.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {myTeam.players.map((player, pIdx) => (
                <span key={pIdx} className="text-sm text-gray-700 font-medium">
                  {player}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900 uppercase tracking-wide">
              Team Name
            </label>
            <div className="flex gap-2">
              <Input
                value={teamName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter team name..."
                className="flex-1"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={generateRandomName}
              >
                Random
              </Button>
            </div>
            <p className="text-xs text-gray-600 font-medium italic">
              Or let Icebreakr pick one
            </p>
          </div>
        </Card>

        <div className="mt-8">
          <Button size="lg" onClick={handleContinue} className="w-full">
            Continue
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
