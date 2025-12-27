import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Card } from './components/Card';

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

export default function SecretPhrase({ isHost, numPlayers, numTeams, targetScore, username, roomCode, contentPack, topicName, onEnd, customTeamNames = {} }) {
  const [gameState, setGameState] = useState('starting');
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [myTeam, setMyTeam] = useState(null);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [currentClueIndex, setCurrentClueIndex] = useState(0);
  const [clueRecipient, setClueRecipient] = useState(null);
  const [guessInput, setGuessInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(8);
  const [roundNumber, setRoundNumber] = useState(0);
  const [recentGuesses, setRecentGuesses] = useState([]);

  useEffect(() => {
    const teamNames = Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`);
    const playerNames = Array.from({ length: numPlayers }, (_, i) =>
      i === 0 && username ? username : `Player ${i + 1}`
    );

    const teamAssignments = teamNames.map((team, idx) => ({
      name: customTeamNames[team] || team,
      originalName: team,
      players: playerNames.filter((_, i) => i % numTeams === idx),
      color: TEAM_COLORS[idx % TEAM_COLORS.length],
    }));

    setTeams(teamAssignments);

    const initialScores = {};
    teamAssignments.forEach(team => initialScores[team.name] = 0);
    setScores(initialScores);

    const userTeam = teamAssignments.find(t => t.players.includes(username || 'Player 1'));
    setMyTeam(userTeam);

    setTimeout(() => {
      setGameState('playing');
      startNewRound(teamAssignments);
    }, 2000);
  }, []);

  const startNewRound = (teamList = teams) => {
    const phrases = contentPack?.secretPhrases || [];
    const phrase = phrases[roundNumber % phrases.length];
    setCurrentPhrase(phrase);
    setCurrentClueIndex(0);
    setRecentGuesses([]);
    setTimeLeft(8);
    rotateClue(0, phrase, teamList);
  };

  const rotateClue = (clueIdx, phrase, teamList = teams) => {
    if (clueIdx >= phrase.clues.length) {
      setTimeout(() => endRound(false), 500);
      return;
    }

    const allPlayers = teamList.flatMap(t => t.players);
    const recipient = allPlayers[clueIdx % allPlayers.length];
    setClueRecipient(recipient);
    setCurrentClueIndex(clueIdx);
    setTimeLeft(8);
  };

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && currentPhrase) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing' && currentPhrase) {
      const nextClueIdx = currentClueIndex + 1;
      if (nextClueIdx >= currentPhrase.clues.length) {
        endRound(false);
      } else {
        rotateClue(nextClueIdx, currentPhrase);
      }
    }
  }, [timeLeft, gameState, currentClueIndex, currentPhrase]);

  const handleGuess = () => {
    if (!guessInput.trim()) return;

    const guess = guessInput.trim().toUpperCase();
    const correct = guess === currentPhrase.phrase.toUpperCase();

    if (correct) {
      const newScores = { ...scores };
      newScores[myTeam.name]++;
      setScores(newScores);
      endRound(true);
    } else {
      setRecentGuesses([...recentGuesses, { player: username, guess }]);
      setGuessInput('');
    }
  };

  const endRound = (won) => {
    setGameState(won ? 'round-won' : 'round-lost');

    setTimeout(() => {
      const maxScore = Math.max(...Object.values(scores));
      if (maxScore >= targetScore) {
        setGameState('ended');
      } else {
        setRoundNumber(prev => prev + 1);
        setGameState('playing');
        startNewRound();
      }
    }, 3000);
  };

  const getWinningTeam = () => {
    return Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
  };

  if (gameState === 'starting') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
      >
        <Card className="max-w-2xl w-full text-center" variant="yellow">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6 mx-auto">
            <span className="text-3xl">🔍</span>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Secret Phrase</h1>
          <p className="text-sm text-gray-700 mb-8 font-semibold uppercase tracking-wide">{topicName}</p>
          <div className="space-y-4">
            <div className={`inline-block px-6 py-3 ${myTeam?.color} text-white rounded-xl font-black text-xl`}>
              You are on {myTeam?.name}
            </div>
            <p className="text-gray-800 max-w-md mx-auto font-medium">
              Clues will rotate to different players. Work together to guess the phrase before time runs out!
            </p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (gameState === 'ended') {
    const winner = getWinningTeam();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
      >
        <Card className="max-w-2xl w-full text-center" variant="yellow">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">{winner} Wins!</h1>

          <div className="space-y-3 mb-8">
            {teams
              .sort((a, b) => scores[b.name] - scores[a.name])
              .map((team, idx) => (
                <div
                  key={team.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    idx === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                    <span className={`w-4 h-4 rounded-full ${team.color}`}></span>
                    <span className="font-semibold">{team.name}</span>
                  </div>
                  <span className="text-2xl font-bold">{scores[team.name]}</span>
                </div>
              ))}
          </div>

          <div className="flex gap-3">
            <Button size="lg" onClick={onEnd} className="flex-1">
              Return Home
            </Button>
            <Button size="lg" variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Play Again
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (gameState === 'round-won' || gameState === 'round-lost') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <Card className="max-w-2xl w-full text-center">
          <div className={`text-6xl mb-4 ${gameState === 'round-won' ? '' : ''}`}>
            {gameState === 'round-won' ? '🎉' : '⏱️'}
          </div>
          <h2 className={`text-4xl font-bold mb-4 ${gameState === 'round-won' ? 'text-green-600' : 'text-red-600'}`}>
            {gameState === 'round-won' ? 'Correct!' : 'Time Expired'}
          </h2>
          <div className="text-2xl mb-6">
            The phrase was: <span className="font-bold">{currentPhrase?.phrase}</span>
          </div>
          <p className="text-gray-600">Next round starting...</p>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {isHost ? (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Secret Phrase</h1>
              <p className="text-sm text-gray-600 font-medium">{topicName}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 font-semibold">Room: {roomCode}</div>
              <Button variant="danger" size="sm" onClick={onEnd}>
                End Game
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {teams.map(team => (
              <Card key={team.name} className="text-center">
                <div className={`w-full h-2 ${team.color} rounded-full mb-3`}></div>
                <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                <div className="text-3xl font-bold mb-2">{scores[team.name]}</div>
                <div className="text-xs text-gray-500">
                  {team.players.length} players
                </div>
              </Card>
            ))}
          </div>

          <Card className="mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Round {roundNumber + 1}</div>
              <div className="text-5xl font-bold mb-6 tracking-wider">{currentPhrase?.phrase}</div>
              <div className="text-lg text-gray-700 mb-2">
                Current Clue: <span className="font-semibold">{currentPhrase?.clues[currentClueIndex]}</span>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Shown to: <span className="font-semibold">{clueRecipient}</span>
              </div>
              <div className="text-4xl font-bold text-yellow-600">{timeLeft}s</div>
            </div>
          </Card>

          {recentGuesses.length > 0 && (
            <Card>
              <h3 className="font-semibold mb-3">Recent Guesses</h3>
              <div className="space-y-2">
                {recentGuesses.slice(-5).reverse().map((g, idx) => (
                  <div key={idx} className="p-2 bg-red-50 rounded text-sm">
                    <span className="font-semibold">{g.player}:</span> {g.guess}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="min-h-screen flex flex-col p-6">
          <div className="flex justify-between items-center mb-6">
            <div className={`px-4 py-2 ${myTeam?.color} text-white rounded-lg font-bold text-sm`}>
              {myTeam?.name}
            </div>
            <Button variant="danger" size="sm" onClick={onEnd}>
              Leave
            </Button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <Card className="max-w-2xl w-full">
              <div className="text-center mb-6">
                <div className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">{topicName}</div>
                <div className="text-sm text-gray-600 mb-2 font-semibold">Round {roundNumber + 1}</div>
            </div>

            {clueRecipient === username ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center mb-6"
              >
                <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-8 mb-4">
                  <div className="text-sm text-yellow-800 mb-2">Your Clue:</div>
                  <div className="text-3xl font-bold text-yellow-900">
                    {currentPhrase?.clues[currentClueIndex]}
                  </div>
                </div>
                <div className="text-5xl font-bold text-yellow-600 mb-2">{timeLeft}s</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 8) * 100}%` }}
                  ></div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center mb-6">
                <div className="text-gray-600 mb-4">
                  Clue shown to: <span className="font-semibold">{clueRecipient}</span>
                </div>
                <div className="text-5xl font-bold text-gray-400 mb-2">{timeLeft}s</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 8) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Guess the Phrase
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={guessInput}
                  onChange={(e) => setGuessInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
                  placeholder="Type your guess..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-yellow-600 focus:outline-none text-lg"
                />
                <Button onClick={handleGuess} disabled={!guessInput.trim()}>
                  Submit
                </Button>
              </div>
            </div>

            {recentGuesses.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Guesses</h4>
                <div className="space-y-1">
                  {recentGuesses.slice(-3).reverse().map((g, idx) => (
                    <div key={idx} className="p-2 bg-red-50 rounded text-sm text-red-800">
                      {g.guess}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t space-y-2">
              {teams.map(team => (
                <div key={team.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                    <span className="font-semibold text-sm">{team.name}</span>
                  </div>
                  <span className="font-bold">{scores[team.name]}</span>
                </div>
              ))}
            </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
