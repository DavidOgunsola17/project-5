import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Card } from './components/Card';

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

export default function PopQuizRally({ isHost, numPlayers, numTeams, targetScore, username, roomCode, contentPack, topicName, onEnd, customTeamNames = {}, gameSync, userId, roomId, teams: propTeams, scores: propScores }) {
  const [gameState, setGameState] = useState('starting');
  const [currentRound, setCurrentRound] = useState(0);
  const [teams, setTeams] = useState(propTeams || []);
  const [scores, setScores] = useState(propScores || {});
  const [myTeam, setMyTeam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(null);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showResults, setShowResults] = useState(false);
  const [roundAnswers, setRoundAnswers] = useState([]);

  useEffect(() => {
    // Use teams from props if available (from backend), otherwise create mock teams
    if (propTeams && propTeams.length > 0) {
      setTeams(propTeams);
      const userTeam = propTeams.find(t => t.players.includes(username));
      setMyTeam(userTeam);
    } else {
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
      const userTeam = teamAssignments.find(t => t.players.includes(username || 'Player 1'));
      setMyTeam(userTeam);
    }

    if (propScores) {
      setScores(propScores);
    } else {
      const initialScores = {};
      teams.forEach(team => initialScores[team.name] = 0);
      setScores(initialScores);
    }

    // Load game state from backend if available
    if (gameSync && roomId) {
      loadGameState();
    } else {
      setTimeout(() => {
        setGameState('playing');
        startRound();
      }, 2000);
    }
  }, [propTeams, propScores]);

  const loadGameState = async () => {
    if (!gameSync) return;
    
    const { data: state } = await gameSync.getGameState();
    if (state) {
      setCurrentRound(state.current_round || 0);
      if (state.current_question) {
        setCurrentQuestion(state.current_question);
      }
      setGameState(state.status || 'starting');
      
      if (state.status === 'playing') {
        startRound();
      }
    } else {
      setTimeout(() => {
        setGameState('playing');
        startRound();
      }, 2000);
    }
  };

  const startRound = async () => {
    if (currentRound >= targetScore * 2) {
      endGame();
      return;
    }

    const questions = contentPack?.popQuizQuestions || [];
    const question = questions[currentRound % questions.length];
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setAnsweredCorrectly(null);
    setShowResults(false);
    setTimeLeft(10);
    setRoundAnswers([]);

    // Update game state in backend (host only)
    if (isHost && gameSync && roomId) {
      await gameSync.updateGameState({
        current_round: currentRound,
        current_question_index: currentRound % questions.length,
        current_question: question,
        time_left: 10,
        status: 'playing',
        round_started_at: new Date().toISOString(),
      });
    }
  };

  useEffect(() => {
    if (gameState === 'playing' && !showResults && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      submitAnswer();
    }
  }, [timeLeft, gameState, showResults]);

  const submitAnswer = async () => {
    if (!currentQuestion || showResults) return;

    const correct = selectedAnswer === currentQuestion.correct;
    setAnsweredCorrectly(correct);

    // Submit answer to backend
    if (gameSync && userId && currentQuestion) {
      await gameSync.submitPopQuizAnswer(
        currentRound,
        currentRound % (contentPack?.popQuizQuestions?.length || 1),
        selectedAnswer !== null ? selectedAnswer : -1,
        correct
      );
    }

    // Load all answers from backend (for results display)
    if (gameSync) {
      const { data: allAnswers } = await gameSync.getPopQuizAnswers(currentRound);
      if (allAnswers) {
        const formattedAnswers = allAnswers.map(a => ({
          player: a.players?.username || 'Unknown',
          team: a.teams?.custom_name || a.teams?.original_name || 'Unknown',
          correct: a.is_correct,
        }));
        setRoundAnswers(formattedAnswers);

        // Calculate scores from backend answers
        const newScores = { ...scores };
        formattedAnswers.forEach(ans => {
          if (ans.correct) {
            newScores[ans.team] = (newScores[ans.team] || 0) + 1;
          }
        });
        setScores(newScores);
      }
    } else {
      // Fallback to simulated answers
      const simulatedAnswers = teams.flatMap(team =>
        team.players.map(player => ({
          player,
          team: team.name,
          correct: player === username ? correct : Math.random() > 0.4,
        }))
      );
      setRoundAnswers(simulatedAnswers);

      const newScores = { ...scores };
      simulatedAnswers.forEach(ans => {
        if (ans.correct) {
          newScores[ans.team] = (newScores[ans.team] || 0) + 1;
        }
      });
      setScores(newScores);
    }

    setShowResults(true);

    setTimeout(async () => {
      setCurrentRound(prev => prev + 1);
      const hasWinner = Object.values(scores).some(score => score >= targetScore);
      if (hasWinner || currentRound >= targetScore * 2) {
        setTimeout(() => endGame(), 1000);
      } else {
        await startRound();
      }
    }, 3000);
  };

  const endGame = async () => {
    setGameState('ended');
    // Update game state in backend
    if (gameSync && roomId) {
      await gameSync.updateGameState({ status: 'ended' });
    }
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
        <Card className="max-w-2xl w-full text-center" variant="blue">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-900 rounded-2xl mb-6 mx-auto">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Pop Quiz Rally</h1>
          <p className="text-sm text-gray-700 mb-8 font-semibold uppercase tracking-wide">{topicName}</p>
          <div className="space-y-4">
            <div className={`inline-block px-6 py-3 ${myTeam?.color} text-white rounded-xl font-black text-xl`}>
              You are on {myTeam?.name}
            </div>
            <p className="text-gray-800 font-medium">Get ready! First question coming up...</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (gameState === 'ended') {
    const winner = getWinningTeam();
    const winningTeam = teams.find(t => t.name === winner);

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

  return (
    <div className="min-h-screen bg-slate-50">
      {isHost ? (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Pop Quiz Rally</h1>
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

          {currentQuestion && !showResults && (
            <Card className="mb-6">
              <div className="text-center mb-6">
                <div className="text-sm text-gray-600 mb-2">Question {currentRound + 1}</div>
                <h2 className="text-2xl font-bold mb-4">{currentQuestion.question}</h2>
                <div className="text-5xl font-bold text-blue-600">{timeLeft}s</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentQuestion.options.map((option, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-100 rounded-lg text-center font-semibold"
                  >
                    {option}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <div className="text-center mb-6">
                  <div className="text-lg font-semibold mb-2">
                    Correct Answer: {currentQuestion.options[currentQuestion.correct]}
                  </div>
                  <div className="text-sm text-gray-600">
                    {roundAnswers.filter(a => a.correct).length} / {roundAnswers.length} answered correctly
                  </div>
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
                <div className="text-sm text-gray-600 mb-2 font-semibold">Question {currentRound + 1}</div>
              <h2 className="text-2xl font-bold mb-4">{currentQuestion?.question}</h2>

              {!showResults && (
                <div className="mb-6">
                  <div className="text-5xl font-bold text-blue-600 mb-2">{timeLeft}s</div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(timeLeft / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {!showResults ? (
              <div className="space-y-3">
                {currentQuestion?.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedAnswer(idx)}
                    className={`w-full p-4 rounded-lg font-semibold text-lg transition ${
                      selectedAnswer === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className={`text-6xl mb-4 ${answeredCorrectly ? '' : ''}`}>
                  {answeredCorrectly ? '✓' : '✗'}
                </div>
                <div className={`text-2xl font-bold mb-2 ${answeredCorrectly ? 'text-green-600' : 'text-red-600'}`}>
                  {answeredCorrectly ? 'Correct!' : 'Incorrect'}
                </div>
                <div className="text-gray-600">
                  {!answeredCorrectly && `Correct answer: ${currentQuestion?.options[currentQuestion?.correct]}`}
                </div>
                <div className="mt-6 space-y-2">
                  {teams.map(team => (
                    <div key={team.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${team.color}`}></div>
                        <span className="font-semibold">{team.name}</span>
                      </div>
                      <span className="text-xl font-bold">{scores[team.name]}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
