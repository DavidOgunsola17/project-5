import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { GeneratingContent } from './components/GeneratingContent';
import { TeamNaming } from './components/TeamNaming';
import { GroupPulse } from './components/GroupPulse';
import { TOPIC_SUGGESTIONS, selectContentPack, CONTENT_PACKS } from './lib/contentPacks';
import { sounds, toggleSound, isSoundEnabled } from './lib/sounds';
import { GameService } from './lib/gameService';
import { useGameRoom } from './hooks/useGameRoom';
import PopQuizRally from './PopQuizRally';
import SecretPhrase from './SecretPhrase';
import Sync from './Sync';

export default function App() {
  const [view, setView] = useState('landing');
  const [isHost, setIsHost] = useState(false);
  const [gameMode, setGameMode] = useState(null);
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState([]);
  const [teamSize, setTeamSize] = useState(4);
  const [targetScore, setTargetScore] = useState(5);
  const [assignedTeam, setAssignedTeam] = useState(null);
  const [topicInput, setTopicInput] = useState('');
  const [contentPack, setContentPack] = useState(null);
  const [teamData, setTeamData] = useState([]);
  const [customTeamNames, setCustomTeamNames] = useState({});
  const [soundOn, setSoundOn] = useState(true);
  const [userId, setUserId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [loading, setLoading] = useState(false);

  // Use game room hook when we have room code and user info
  const gameRoom = useGameRoom(roomCode, userId, username, isHost);

  // Sync players from backend
  useEffect(() => {
    if (gameRoom.players && gameRoom.players.length > 0) {
      const playerNames = gameRoom.players
        .filter(p => !p.is_host)
        .map(p => p.username);
      setPlayers(playerNames);
    }
  }, [gameRoom.players]);

  // Sync teams from backend
  useEffect(() => {
    if (gameRoom.teams && gameRoom.teams.length > 0) {
      const formattedTeams = gameRoom.teams.map((team) => {
        const players = team.players || [];
        const playerNames = players.map(p => p.username || p);
        return {
          id: team.id,
          name: team.custom_name || team.original_name,
          originalName: team.original_name,
          players: playerNames,
          color: team.color,
        };
      });
      setTeamData(formattedTeams);
      
      // Update custom team names
      const names = {};
      formattedTeams.forEach(team => {
        if (team.name !== team.originalName) {
          names[team.originalName] = team.name;
        }
      });
      setCustomTeamNames(names);
      
      // Find user's team
      const userTeam = formattedTeams.find(t => 
        t.players.includes(username)
      );
      if (userTeam) {
        setAssignedTeam(userTeam.name);
      }
    }
  }, [gameRoom.teams, username]);

  // Sync room status and navigate accordingly
  useEffect(() => {
    if (!gameRoom.room) return;
    
    const status = gameRoom.room.status;
    
    // Auto-navigate based on room status
    if (status === 'team-assignment' && view === 'lobby') {
      setView('team-assignment');
    } else if (status === 'team-naming' && view === 'team-assignment') {
      setView('team-naming');
    } else if (status === 'group-pulse' && view === 'team-naming') {
      setView('group-pulse');
    } else if (status === 'playing' && view === 'leaderboard') {
      setView('game');
    } else if (status === 'ended' && view === 'game') {
      // Game ended - show winner screen
      setView('game');
    }
  }, [gameRoom.room?.status, view]);

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const generatePlayerNames = (count) => {
    const names = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery',
                   'Quinn', 'Jamie', 'Skyler', 'Dakota', 'Charlie', 'Finley', 'Reese'];
    return names.slice(0, count);
  };

  // Calculate number of teams based on team size and number of players
  const calculateNumTeams = (playerCount, size) => {
    return Math.max(2, Math.ceil(playerCount / size));
  };

  const handleHostGame = async () => {
    sounds.tap();
    setIsHost(true);
    setView('topic-select');
  };

  const handleJoinGame = async () => {
    if (!username.trim() || !roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }
    
    setLoading(true);
    sounds.success();
    setIsHost(false);

    try {
      const result = await GameService.joinRoom({
        roomCode: roomCode.toUpperCase(),
        username: username.trim(),
      });

      if (result.success) {
        setUserId(result.player.id);
        setRoomId(result.room.id);
        setPlayers([result.player]);
        setView('lobby');
      } else {
        alert(result.error || 'Failed to join room');
      }
    } catch (error) {
      alert('Error joining room: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateEvent = async () => {
    sounds.transition();
    const pack = selectContentPack(topicInput);
    setContentPack(pack);
    setView('generating');
  };

  const handleGeneratingComplete = async () => {
    // Create room after content is generated
    if (!username.trim()) {
      setUsername('Host');
    }
    
    setLoading(true);
    try {
      const result = await GameService.createRoom({
        username: username || 'Host',
        topic: topicInput,
        gameMode: null, // Will be set when game mode is selected
        teamSize,
        targetScore,
      });

      if (result.success) {
        setRoomCode(result.room.code);
        setRoomId(result.room.id);
        setUserId(result.hostPlayer.id);
        setPlayers([result.hostPlayer]);
        setView('host-setup');
      } else {
        alert(result.error || 'Failed to create room');
      }
    } catch (error) {
      alert('Error creating room: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMode = async (mode) => {
    sounds.tap();
    setGameMode(mode);
    
    // Update room with game mode
    if (roomId) {
      await GameService.updateRoom({ roomId, updates: { game_mode: mode } });
    }
    
    setView('host-config');
  };

  const handleHostStartSession = async () => {
    if (!roomId || !contentPack) {
      alert('Missing room or content pack');
      return;
    }

    setLoading(true);
    sounds.transition();

    try {
      // Start session and assign teams
      await GameService.startSession({ roomId, contentPack });
      const assignResult = await GameService.assignTeams({ roomId, teamSize });

      if (assignResult.success) {
        // Format teams for UI
        const formattedTeams = assignResult.teams.map((team) => ({
          id: team.id,
          name: team.original_name,
          originalName: team.original_name,
          players: team.players || [],
          color: team.color,
        }));
        setTeamData(formattedTeams);
        setView('host-observing');
      } else {
        alert(assignResult.error || 'Failed to start session');
      }
    } catch (error) {
      alert('Error starting session: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerStartSession = () => {
    // Players wait for host to start - this is handled by real-time sync
    // When host starts, players will automatically see team assignment
    // This function is kept for backward compatibility but shouldn't be called
    sounds.transition();
  };

  const handleTeamAssignmentContinue = () => {
    sounds.tap();
    setView('team-naming');
  };

  const handleTeamNamingComplete = async (finalNames) => {
    sounds.success();
    setCustomTeamNames(finalNames);
    
    // Update team names in backend
    if (gameRoom && gameRoom.teams) {
      for (const team of gameRoom.teams) {
        const customName = finalNames[team.original_name];
        if (customName) {
          await gameRoom.updateTeamName(team.id, customName);
        }
      }
    }
    
    // Update room status to group-pulse
    if (roomId) {
      await GameService.startGroupPulse({ roomId });
    }
    
    setView('group-pulse');
  };

  const handleGroupPulseComplete = async () => {
    sounds.success();
    
    // Start the game
    if (roomId) {
      await GameService.startGame({ roomId });
    }
    
    setView('leaderboard');
  };

  const handleLeaderboardContinue = () => {
    sounds.gameStart();
    // Ensure gameMode and contentPack are set before starting game
    // (in real app, these would be synced from host)
    if (!gameMode) {
      setGameMode('pop-quiz'); // Default game mode
    }
    if (!contentPack) {
      const pack = selectContentPack('');
      setContentPack(pack);
    }
    setView('game');
  };

  const handleEndGame = async () => {
    sounds.gameEnd();
    
    // End game in backend
    if (roomId) {
      await GameService.endGame({ roomId });
    }
    
    // Reset state
    setView('landing');
    setGameMode(null);
    setIsHost(false);
    setUsername('');
    setRoomCode('');
    setPlayers([]);
    setAssignedTeam(null);
    setTopicInput('');
    setContentPack(null);
    setTeamData([]);
    setCustomTeamNames({});
    setUserId(null);
    setRoomId(null);
  };

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    sounds.tap();
  };

  const renderGame = () => {
    if (!gameMode || !contentPack) return null;

    // Calculate numTeams based on team size and current player count
    const calculatedNumTeams = calculateNumTeams(players.length, teamSize);

    const props = {
      isHost,
      numPlayers: players.length,
      numTeams: calculatedNumTeams,
      targetScore,
      username,
      roomCode,
      contentPack,
      topicName: contentPack.name,
      onEnd: handleEndGame,
      customTeamNames,
      gameSync: gameRoom.getGameSync(),
      userId,
      roomId,
      teams: teamData,
      scores: gameRoom.scores || scores,
    };

    switch (gameMode) {
      case 'pop-quiz':
        return <PopQuizRally {...props} />;
      case 'secret-phrase':
        return <SecretPhrase {...props} />;
      case 'sync':
        return <Sync {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {view !== 'landing' && (
        <button
          onClick={handleSoundToggle}
          className="fixed top-6 right-6 z-50 w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-gray-100 transition"
          aria-label="Toggle sound"
        >
          <span className="text-xl">{soundOn ? '🔊' : '🔇'}</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-6"
          >
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-6xl md:text-7xl font-black text-gray-900 mb-4 tracking-tight"
            >
              Icebreakr
            </motion.h1>
            <p className="text-lg text-gray-600 mb-12 text-center max-w-lg font-medium">
              Real-time social games for groups
            </p>
            <div className="flex flex-col gap-3 w-full max-w-sm">
              <Button size="lg" onClick={handleHostGame} className="w-full">
                Host a Game
              </Button>
              <Button size="lg" variant="secondary" onClick={() => { sounds.tap(); setView('join'); }} className="w-full">
                Join a Game
              </Button>
            </div>
          </motion.div>
        )}

        {view === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-md w-full">
              <h2 className="text-3xl font-black mb-6 text-center tracking-tight">Join Game</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Room Code
                  </label>
                  <Input
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    Your Name
                  </label>
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <Button
                  size="lg"
                  onClick={handleJoinGame}
                  className="w-full"
                  disabled={!roomCode || !username}
                >
                  Join Room
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { sounds.tap(); setView('landing'); }}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {view === 'lobby' && (
          <motion.div
            key="lobby"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-2xl w-full" variant="green">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-4 tracking-tight">Waiting Room</h2>
                <div className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xl mb-3">
                  Room {roomCode}
                </div>
                <p className="text-gray-700 font-medium">You've joined the game!</p>
              </div>

              <div className="mb-6">
                <h3 className="font-bold mb-3 text-gray-900 text-sm uppercase tracking-wide">Players in Room ({gameRoom.players?.filter(p => !p.is_host).length || players.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {(gameRoom.players?.filter(p => !p.is_host) || players).map((player, idx) => {
                    const playerName = typeof player === 'string' ? player : player.username;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl text-sm font-medium ${
                          playerName === username
                            ? 'bg-gray-900 text-white'
                            : 'bg-white text-gray-700'
                        }`}
                      >
                        {playerName}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="text-center p-4 bg-yellow-200 rounded-xl mb-6">
                <p className="text-gray-900 font-bold">Waiting for host to start the session...</p>
                <div className="flex justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-gray-900 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {view === 'topic-select' && (
          <motion.div
            key="topic-select"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 relative"
          >
            <button
              onClick={() => { sounds.tap(); setView('landing'); }}
              className="absolute top-6 left-6 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </button>

            <div className="max-w-4xl w-full">
              <h1 className="text-5xl md:text-6xl font-bold text-center mb-12 text-gray-900">
                Choose a Topic
              </h1>

              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') { sounds.transition(); handleGenerateEvent(); } }}
                    placeholder="Enter a topic for your event..."
                    autoFocus
                    className="w-full px-6 py-5 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-600 focus:outline-none transition bg-white shadow-sm"
                  />
                  <button
                    onClick={handleGenerateEvent}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Generate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Leave blank for general icebreaker content
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2 mt-8">
                {TOPIC_SUGGESTIONS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => { sounds.tap(); setTopicInput(topic.label); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                      topicInput.toLowerCase() === topic.label.toLowerCase()
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="mr-1.5">{topic.icon}</span>
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'generating' && (
          <GeneratingContent
            key="generating"
            onComplete={handleGeneratingComplete}
          />
        )}

        {view === 'host-setup' && (
          <motion.div
            key="host-setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen p-6"
          >
            <button
              onClick={() => { sounds.tap(); setView('topic-select'); }}
              className="mb-8 text-gray-600 hover:text-gray-900 transition font-semibold"
            >
              ← Back
            </button>
            <div className="max-w-5xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black text-center mb-3 tracking-tight text-gray-900">Choose Your Game</h2>
              <p className="text-center text-gray-600 mb-12 font-medium">Pick a game mode for your group</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card
                  onClick={() => handleSelectMode('pop-quiz')}
                  variant="blue"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Pop Quiz Rally</h3>
                  <p className="text-gray-700 text-sm font-medium">
                    Fast-paced team trivia. Answer quick, score points, win!
                  </p>
                </Card>
                <Card
                  onClick={() => handleSelectMode('secret-phrase')}
                  variant="yellow"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Secret Phrase</h3>
                  <p className="text-gray-800 text-sm font-medium">
                    Rotating clues, hidden phrase. Guess it before it vanishes!
                  </p>
                </Card>
                <Card
                  onClick={() => handleSelectMode('sync')}
                  variant="purple"
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-xl mb-4">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">Sync</h3>
                  <p className="text-gray-700 text-sm font-medium">
                    Match your team's opinions. Alignment wins!
                  </p>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {view === 'host-config' && (
          <motion.div
            key="host-config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-2xl w-full">
              <h2 className="text-3xl font-black mb-6 text-center tracking-tight">Lobby</h2>
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl mb-4">
                    <span className="text-sm font-medium">Room Code: </span>
                    <span className="text-2xl font-black">{roomCode}</span>
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Share this code with players to join</p>
                </div>

                <Card variant="blue" className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Players Joining</h3>
                    <div className="flex gap-1 items-center">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700 font-semibold">Live</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto mb-3">
                    {(gameRoom.players?.filter(p => !p.is_host) || []).map((player, idx) => (
                      <motion.div
                        key={player.id || idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-2 bg-white rounded-xl text-sm text-gray-700 font-medium"
                      >
                        {player.username}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-800 text-center font-bold">
                    {gameRoom.players?.filter(p => !p.is_host).length || 0} players connected
                  </p>
                </Card>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Team Size: {teamSize} players per team
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    value={teamSize}
                    onChange={(e) => setTeamSize(parseInt(e.target.value))}
                    className="w-full accent-gray-900"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-semibold">
                    <span>Small (2)</span>
                    <span>Large (8)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center font-medium">
                    Teams will be formed automatically based on team size
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    Winning Score: {targetScore}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={targetScore}
                    onChange={(e) => setTargetScore(parseInt(e.target.value))}
                    className="w-full accent-gray-900"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-2 font-semibold">
                    <span>Quick (3)</span>
                    <span>Long (10)</span>
                  </div>
                </div>

                <Button size="lg" onClick={handleHostStartSession} className="w-full">
                  Start Session
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => { sounds.tap(); setView('host-setup'); }}
                  className="w-full"
                >
                  Change Game Mode
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {view === 'host-observing' && (
          <motion.div
            key="host-observing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-3xl w-full">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-3 tracking-tight">Session in Progress</h2>
                <div className="inline-block px-6 py-3 bg-gray-900 text-white rounded-xl font-black text-xl mb-4">
                  Room {roomCode}
                </div>
                <p className="text-gray-600 font-medium">Players are going through team setup</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-green-100 rounded-xl">
                  <div className="text-2xl">✓</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Team Assignment</p>
                    <p className="text-sm text-gray-600">Players assigned to teams</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-yellow-100 rounded-xl">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">Team Naming</p>
                    <p className="text-sm text-gray-600">Teams choosing their names...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                  <div className="text-2xl opacity-30">⏳</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 opacity-50">Group Pulse</p>
                    <p className="text-sm text-gray-600 opacity-50">Upcoming</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                  <div className="text-2xl opacity-30">⏳</div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 opacity-50">Game Start</p>
                    <p className="text-sm text-gray-600 opacity-50">Upcoming</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {teamData.map((team, idx) => (
                  <Card key={team.name} className="text-center">
                    <div className={`w-full h-2 ${team.color} rounded-full mb-3`}></div>
                    <h3 className="font-bold text-lg mb-2">{team.name}</h3>
                    <div className="text-xs text-gray-500">
                      {team.players.length} players
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-center text-sm text-gray-600 mb-4 font-medium">
                <p>Demo: Skip to game control panel</p>
              </div>

              <Button size="lg" onClick={handleLeaderboardContinue} className="w-full mb-2">
                Skip to Game
              </Button>
              <Button
                size="lg"
                variant="danger"
                onClick={handleEndGame}
                className="w-full"
              >
                End Session
              </Button>
            </Card>
          </motion.div>
        )}

        {view === 'team-assignment' && (
          <motion.div
            key="team-assignment"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-2xl w-full text-center" variant="green">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="text-6xl mb-6"
              >
                🎯
              </motion.div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">You're on a Team!</h2>
              <div className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-black text-2xl mb-6">
                {assignedTeam}
              </div>
              <p className="text-gray-700 text-lg font-medium mb-8">
                Find your teammates and get ready to play
              </p>
              <Button size="lg" onClick={handleTeamAssignmentContinue} className="w-full">
                Find My Teammates
              </Button>
            </Card>
          </motion.div>
        )}

        {view === 'team-naming' && teamData.length > 0 && (
          <TeamNaming teams={teamData} onComplete={handleTeamNamingComplete} username={username} isHost={isHost} existingTeamNames={customTeamNames} />
        )}

        {view === 'group-pulse' && (
          <GroupPulse 
            onComplete={handleGroupPulseComplete}
            gameSync={gameRoom.getGameSync()}
            userId={userId}
          />
        )}

        {view === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center p-6 bg-slate-50"
          >
            <Card className="max-w-2xl w-full text-center">
              <h2 className="text-4xl font-black mb-3 tracking-tight">Ready to Play!</h2>
              <p className="text-gray-600 text-lg font-medium mb-8">
                {contentPack?.name || 'Game'} - First to {targetScore} points wins
              </p>

              <div className="space-y-3 mb-8">
                {teamData.map((team, idx) => (
                  <motion.div
                    key={team.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center justify-between p-4 bg-gray-100 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-4 h-4 rounded-full ${team.color}`}></span>
                      <span className="font-bold text-gray-900">
                        {customTeamNames[team.name] || team.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-gray-400">0</span>
                      <span className="text-sm text-gray-500">pts</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button size="lg" onClick={handleLeaderboardContinue} className="w-full">
                Start Game
              </Button>
            </Card>
          </motion.div>
        )}

        {view === 'game' && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {renderGame()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
