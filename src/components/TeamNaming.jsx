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

export function TeamNaming({ teams, onComplete }) {
  const [teamNames, setTeamNames] = useState(
    teams.reduce((acc, team) => ({ ...acc, [team.name]: '' }), {})
  );

  const handleNameChange = (teamName, newName) => {
    setTeamNames(prev => ({ ...prev, [teamName]: newName }));
  };

  const generateRandomName = (teamName) => {
    sounds.tap();
    const randomName = TEAM_NAME_SUGGESTIONS[Math.floor(Math.random() * TEAM_NAME_SUGGESTIONS.length)];
    setTeamNames(prev => ({ ...prev, [teamName]: randomName }));
  };

  const handleContinue = () => {
    sounds.success();
    const finalNames = {};
    teams.forEach(team => {
      finalNames[team.name] = teamNames[team.name] ||
        TEAM_NAME_SUGGESTIONS[teams.indexOf(team) % TEAM_NAME_SUGGESTIONS.length];
    });
    onComplete(finalNames);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
    >
      <Card className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black mb-3 tracking-tight">Find your teammates</h1>
          <p className="text-gray-600 text-lg font-medium">
            Get together and give your team a name.
          </p>
        </div>

        <div className="space-y-6">
          {teams.map((team, idx) => (
            <Card key={team.name} variant={['blue', 'yellow', 'purple', 'orange'][idx % 4]} className="p-5">
              <div className="mb-4">
                <h3 className="font-black text-lg mb-2 text-gray-900">{team.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {team.players.map((player, pIdx) => (
                    <div
                      key={pIdx}
                      className="flex items-center justify-center w-10 h-10 bg-gray-900 text-white rounded-full font-bold text-sm"
                    >
                      {player.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {team.players.map((player, pIdx) => (
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
                    value={teamNames[team.name]}
                    onChange={(e) => handleNameChange(team.name, e.target.value)}
                    placeholder="Enter team name..."
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => generateRandomName(team.name)}
                  >
                    Random
                  </Button>
                </div>
                <p className="text-xs text-gray-600 font-medium italic">
                  Or let Icebreakr pick one
                </p>
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
