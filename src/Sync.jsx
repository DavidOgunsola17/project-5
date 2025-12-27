import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Card } from './components/Card';

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

export default function Sync({ isHost, numPlayers, numTeams, targetScore, username, roomCode, contentPack, topicName, onEnd, customTeamNames = {} }) {
  const [gameState, setGameState] = useState('starting');
  const [currentRound, setCurrentRound] = useState(0);
  const [teams, setTeams] = useState([]);
  const [scores, setScores] = useState({});
  const [myTeam, setMyTeam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasLocked, setHasLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showResults, setShowResults] = useState(false);
  const [roundResults, setRoundResults] = useState(null);

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
      startRound(teamAssignments);
    }, 2000);
  }, []);

  const startRound = (teamList = teams) => {
    const questions = contentPack?.syncQuestions || [];
    const question = questions[currentRound % questions.length];
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setHasLocked(false);
    setShowResults(false);
    setTimeLeft(15);
  };

  useEffect(() => {
    if (gameState === 'playing' && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      lockAnswer();
    }
  }, [timeLeft, gameState, showResults]);

  const lockAnswer = () => {
    if (hasLocked) return;
    setHasLocked(true);

    const simulatedAnswers = teams.flatMap(team =>
      team.players.map(player => {
        if (player === username) {
          return { player, team: team.name, answer: selectedAnswer !== null ? selectedAnswer : Math.floor(Math.random() * 4) };
        }
        const teamBias = Math.floor(Math.random() * 4);
        const answer = Math.random() > 0.3 ? teamBias : Math.floor(Math.random() * 4);
        return { player, team: team.name, answer };
      })
    );

    const teamResults = teams.map(team => {
      const teamAnswers = simulatedAnswers.filter(a => a.team === team.name);
      const answerCounts = [0, 0, 0, 0];
      teamAnswers.forEach(a => answerCounts[a.answer]++);
      const majorityAnswer = answerCounts.indexOf(Math.max(...answerCounts));
      const majorityCount = Math.max(...answerCounts);
      const alignmentScore = Math.floor((majorityCount / teamAnswers.length) * 100);
      const pointsEarned = alignmentScore >= 50 ? 1 : 0;

      return {
        team: team.name,
        answers: answerCounts,
        majorityAnswer,
        majorityCount,
        totalPlayers: teamAnswers.length,
        alignmentScore,
        pointsEarned,
      };
    });

    setRoundResults(teamResults);

    const newScores = { ...scores };
    teamResults.forEach(result => {
      newScores[result.team] += result.pointsEarned;
    });
    setScores(newScores);

    setShowResults(true);

    setTimeout(() => {
      const maxScore = Math.max(...Object.values(newScores));
      if (maxScore >= targetScore) {
        setGameState('ended');
      } else {
        setCurrentRound(prev => prev + 1);
        startRound();
      }
    }, 5000);
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
        <Card className="max-w-2xl w-full text-center" variant="purple">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6 mx-auto">
            <span className="text-3xl">🤝</span>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Sync</h1>
          <p className="text-sm text-gray-700 mb-8 font-semibold uppercase tracking-wide">{topicName}</p>
          <div className="space-y-4">
            <div className={`inline-block px-6 py-3 ${myTeam?.color} text-white rounded-xl font-black text-xl`}>
              You are on {myTeam?.name}
            </div>
            <p className="text-gray-800 max-w-md mx-auto font-medium">
              Answer opinion questions and try to match your team. Higher alignment scores earn points!
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
        <Card className="max-w-2xl w-full text-center" variant="purple">
          <div className="text-6xl mb-6">🏆</div>
          <h1 className="text-5xl font-black mb-4 tracking-tight">{winner} Wins!</h1>
          <p className="text-gray-800 mb-6 font-semibold">Best team alignment</p>

          <div className="space-y-3 mb-8">
            {teams
              .sort((a, b) => scores[b.name] - scores[a.name])
              .map((team, idx) => (
                <div
                  key={team.name}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    idx === 0 ? 'bg-teal-100 border-2 border-teal-400' : 'bg-gray-100'
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

  return (
    <div className="min-h-screen bg-slate-50">
      {isHost ? (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Sync</h1>
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

          {!showResults ? (
            <Card>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Round {currentRound + 1}</div>
                <h2 className="text-3xl font-bold mb-6">{currentQuestion?.question}</h2>
                <div className="text-5xl font-bold text-teal-600 mb-4">{timeLeft}s</div>
                <p className="text-gray-600">Players are voting...</p>
              </div>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <h3 className="text-2xl font-bold text-center mb-6">Results</h3>
                <div className="space-y-4">
                  {roundResults?.map(result => {
                    const team = teams.find(t => t.name === result.team);
                    return (
                      <div key={result.team} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ${team.color}`}></div>
                            <span className="font-bold">{result.team}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{result.alignmentScore}%</div>
                            <div className="text-xs text-gray-600">alignment</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 mb-2">
                          Majority answer: <span className="font-semibold">{currentQuestion?.options[result.majorityAnswer]}</span>
                          {' '}({result.majorityCount}/{result.totalPlayers})
                        </div>
                        <div className="flex gap-2">
                          {result.answers.map((count, idx) => (
                            <div
                              key={idx}
                              className="flex-1 h-8 bg-gray-200 rounded flex items-center justify-center text-sm font-semibold"
                              style={{
                                backgroundColor: count > 0 ? 'rgb(20, 184, 166, 0.2)' : 'rgb(229, 231, 235)',
                              }}
                            >
                              {count}
                            </div>
                          ))}
                        </div>
                        {result.pointsEarned > 0 && (
                          <div className="mt-2 text-center text-sm font-semibold text-green-600">
                            +{result.pointsEarned} point
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
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
                <div className="text-sm text-gray-600 mb-2 font-semibold">Round {currentRound + 1}</div>
              <h2 className="text-2xl font-bold mb-4">{currentQuestion?.question}</h2>

              {!showResults && !hasLocked && (
                <div className="mb-6">
                  <div className="text-5xl font-bold text-teal-600 mb-2">{timeLeft}s</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-teal-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 15) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {!showResults && !hasLocked ? (
              <div>
                <div className="space-y-3 mb-4">
                  {currentQuestion?.options.map((option, idx) => (
                    <motion.button
                      key={idx}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedAnswer(idx)}
                      className={`w-full p-4 rounded-lg font-semibold text-lg transition ${
                        selectedAnswer === idx
                          ? 'bg-teal-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
                <Button
                  size="lg"
                  onClick={lockAnswer}
                  disabled={selectedAnswer === null}
                  className="w-full"
                >
                  Lock In
                </Button>
              </div>
            ) : !showResults && hasLocked ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✓</div>
                <div className="text-xl font-semibold text-gray-700">Answer Locked!</div>
                <p className="text-gray-600 mt-2">Waiting for others...</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {roundResults && (
                  <div>
                    <div className="mb-6">
                      {roundResults.map(result => {
                        if (result.team !== myTeam?.name) return null;
                        const team = teams.find(t => t.name === result.team);
                        return (
                          <div key={result.team} className="text-center">
                            <div className="text-5xl font-bold text-teal-600 mb-2">
                              {result.alignmentScore}%
                            </div>
                            <div className="text-gray-600 mb-4">Team Alignment</div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-700 mb-3">
                                Your team mostly chose:{' '}
                                <span className="font-bold">{currentQuestion?.options[result.majorityAnswer]}</span>
                              </div>
                              <div className="flex gap-2 mb-3">
                                {result.answers.map((count, idx) => (
                                  <div key={idx} className="flex-1 text-center">
                                    <div
                                      className="h-16 bg-gray-200 rounded flex items-end justify-center pb-2 font-bold text-lg"
                                      style={{
                                        height: `${Math.max(16, (count / result.totalPlayers) * 80)}px`,
                                        backgroundColor: idx === result.majorityAnswer ? 'rgb(20, 184, 166)' : 'rgb(209, 213, 219)',
                                        color: idx === result.majorityAnswer ? 'white' : 'rgb(75, 85, 99)',
                                      }}
                                    >
                                      {count}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {currentQuestion?.options[idx]}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              {result.pointsEarned > 0 && (
                                <div className="text-center font-semibold text-green-600">
                                  +{result.pointsEarned} point
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-6 border-t space-y-2">
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
                  </div>
                )}
              </motion.div>
            )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
