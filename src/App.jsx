import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './components/Button';
import { Card } from './components/Card';
import { Input } from './components/Input';
import { GeneratingContent } from './components/GeneratingContent';
import { TeamNaming } from './components/TeamNaming';
import { GroupPulse } from './components/GroupPulse';
import { TOPIC_SUGGESTIONS, selectContentPack, CONTENT_PACKS } from './lib/contentPacks';
import { sounds, toggleSound, isSoundEnabled } from './lib/sounds';
import PopQuizRally from './PopQuizRally';
import SecretPhrase from './SecretPhrase';
import Sync from './Sync';
import { RoomProvider, useRoom } from './contexts/RoomContext';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { generateRoomCode } from './lib/utils';
import * as teamsAPI from './api/teams';
import * as playersAPI from './api/players';
import { getSupabaseClient } from './lib/supabaseClient';

function AppContent() {
  const { roomId, roomCode: contextRoomCode, roomStatus, roomConfig, createOrJoinRoom, joinRoom, updateRoomStatus, updateRoomConfig, fetchRoom, clearRoom } = useRoom();
  const { playerId, playerName, isHost: contextIsHost, teamId, players: contextPlayers, createOrJoinPlayer, joinPlayer, fetchPlayers, clearPlayer } = usePlayer();

  const [view, setView] = useState('landing');
  // Derive isHost from room ownership - authoritative source
  const isHost = useMemo(() => {
    return playerId !== null && roomConfig.hostId !== null && playerId === roomConfig.hostId;
  }, [playerId, roomConfig.hostId]);
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

  // Single source of truth: filter host once, use everywhere
  // uiPlayers = all players EXCEPT host (for UI and team logic)
  const uiPlayers = useMemo(() => {
    return contextPlayers.filter(p => !p.is_host && p.id !== roomConfig.hostId);
  }, [contextPlayers, roomConfig.hostId]);

  // Sync context values to local state for UI compatibility
  useEffect(() => {
    if (contextRoomCode) {
      setRoomCode(contextRoomCode);
    }
    // isHost is now derived from roomConfig.hostId, not synced from contextIsHost
    if (roomConfig.gameMode) {
      setGameMode(roomConfig.gameMode);
    }
    if (roomConfig.contentPack) {
      setContentPack(roomConfig.contentPack);
    }
    if (roomConfig.teamSize) {
      setTeamSize(roomConfig.teamSize);
    }
    if (roomConfig.targetScore) {
      setTargetScore(roomConfig.targetScore);
    }
    // Always sync, even if empty (clears stale data)
    setPlayers(uiPlayers.map(p => p.username));
  }, [contextRoomCode, roomConfig, uiPlayers]);

  // Fetch players when roomId changes and we're in lobby/host-config views
  useEffect(() => {
    if (roomId && (view === 'lobby' || view === 'host-config')) {
      fetchPlayers(roomId).catch(err => {
        console.error('Error fetching players:', err);
      });
    }
  }, [roomId, view, fetchPlayers]);

  // Subscribe to player list changes via Supabase realtime
  useEffect(() => {
    if (!roomId) return;

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel(`players:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'players',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          // Refetch player list to get latest state
          fetchPlayers(roomId).catch(err => {
            console.error('Error fetching players after realtime update:', err);
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchPlayers]);

  // Navigation effect: respond to roomStatus changes with readiness guards
  useEffect(() => {
    if (!roomId || !roomStatus) return;

    // Don't navigate away from game screens
    if (view === 'game') return;

    // Navigation logic based on status
    if (roomStatus === 'waiting') {
      // Only navigate if we're not already in the correct view
      if (view !== 'lobby' && view !== 'host-config') {
        setView(isHost ? 'host-config' : 'lobby');
      }
    } else if (roomStatus === 'group_pulse') {
      // For group_pulse, we need teams + players (no game content required)
      if (teamData.length > 0 && players.length > 0) {
        if (view !== 'group-pulse') {
          setView('group-pulse');
        }
      } else {
        // Fetch room and teams if needed
        fetchRoom().then(() => {
          fetchPlayers(roomId);
        });
      }
    } else if (roomStatus === 'playing') {
      // For playing, we need gameMode + contentPack + teams
      if (!gameMode || !contentPack || teamData.length === 0) {
        // Fetch room to get latest config
        fetchRoom().then(() => {
          // After fetch, check again - this will re-trigger the effect
        });
        return;
      }
      if (view !== 'game') {
        setView('game');
      }
    } else if (roomStatus === 'finished') {
      // Game finished - the game component handles showing results
      // When user clicks "Return Home", handleEndGame is called which clears state
      // No action needed here - game component is already showing results
    }
  }, [roomStatus, roomId, isHost, gameMode, contentPack, view, fetchRoom, teamData, players, fetchPlayers]);

  // Keep generatePlayerNames for demo/fallback purposes
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
    // isHost will be derived once room is created with host_id
    const code = generateRoomCode();
    setRoomCode(code);
    // Room and host player will be created after topic selection
    setView('topic-select');
  };

  const handleJoinGame = async () => {
    if (!username.trim()) {
      alert('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    
    sounds.success();
    // isHost will be derived from roomConfig.hostId (will be false for non-host players)

    // Join room by code
    const room = await joinRoom(roomCode.toUpperCase());
    if (!room) {
      alert('Room not found. Please check the room code.');
      return;
    }

    // Create/join player
    const player = await joinPlayer(room.id, username.trim());
    if (!player) {
      alert('Failed to join room. Please try again.');
      return;
    }

    // Fetch players list
    await fetchPlayers(room.id);
    setView('lobby');
  };

  const handleGenerateEvent = async () => {
    sounds.transition();
    const pack = selectContentPack(topicInput);
    setContentPack(pack);
    
    // Create room and host player after topic is selected
    if (isHost && roomCode && !roomId) {
      const code = roomCode.toUpperCase();
      // Generate a temporary host ID (will be replaced when player is created)
      // Use a simple UUID-like string generator for compatibility
      const tempHostId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
      const room = await createOrJoinRoom(code, tempHostId, null, topicInput || null, pack);
      if (room) {
        // Create host player with a default name if username not set
        const hostName = username || 'Host';
        const hostPlayer = await createOrJoinPlayer(room.id, hostName, true);
        if (hostPlayer) {
          // Update room with actual host_id
          await updateRoomConfig({ host_id: hostPlayer.id, topic: topicInput || null, content_pack: pack });
          // Refresh room config to ensure roomConfig.hostId is updated in context
          await fetchRoom();
        }
      }
    }
    
    setView('generating');
  };

  const handleGeneratingComplete = () => {
    setView('host-setup');
  };

  const handleSelectMode = async (mode) => {
    sounds.tap();
    setGameMode(mode);
    if (roomId) {
      await updateRoomConfig({ game_mode: mode });
    }
    setView('host-config');
  };

  const handleHostStartSession = async () => {
    sounds.transition();
    
    if (!roomId) return;

    // Update room config and status
    await updateRoomConfig({ team_size: teamSize, target_score: targetScore });
    await updateRoomStatus('group_pulse', playerId);

    // Fetch current players directly from API to get fresh data
    const allPlayers = await playersAPI.fetchPlayers(roomId);
    // Filter out host - host is not a participant (same filter as uiPlayers)
    const currentPlayers = allPlayers.filter(p => !p.is_host && p.id !== roomConfig.hostId);
    
    // Also update context for UI (will update uiPlayers via useMemo)
    await fetchPlayers(roomId);

    // Create teams
    const calculatedNumTeams = calculateNumTeams(currentPlayers.length || 12, teamSize);
    const createdTeams = await teamsAPI.createTeams(roomId, calculatedNumTeams, teamSize);
    
    // Assign players to teams (only non-host players)
    const assignments = {};
    currentPlayers.forEach((player, idx) => {
      if (createdTeams[idx % createdTeams.length]) {
        assignments[player.id] = createdTeams[idx % createdTeams.length].id;
      }
    });
    await teamsAPI.assignPlayersToTeams(roomId, assignments);

    // Fetch teams and players again
    const teams = await teamsAPI.fetchTeams(roomId);
    const updatedPlayers = await playersAPI.fetchPlayers(roomId);
    // Filter out host from updated players list
    const nonHostPlayers = updatedPlayers.filter(p => !p.is_host && p.id !== roomConfig.hostId);
    await fetchPlayers(roomId); // Update context

    // Format team data for UI
    const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
    const formattedTeams = teams.map((team, idx) => {
      const teamPlayers = nonHostPlayers.filter(p => p.team_id === team.id);
      return {
        name: team.custom_name || team.original_name,
        originalName: team.original_name,
        players: teamPlayers.map(p => p.username),
        color: TEAM_COLORS[idx % TEAM_COLORS.length],
        id: team.id,
      };
    });

    setTeamData(formattedTeams);
    // Navigation will happen via roomStatus effect
  };

  const handleTeamAssignmentContinue = () => {
    sounds.tap();
    setView('team-naming');
  };

  const handleTeamNamingComplete = (finalNames) => {
    sounds.success();
    setCustomTeamNames(finalNames);
    setView('group-pulse');
  };

  const handleGroupPulseComplete = () => {
    sounds.success();
    // Host only: advance room status to playing
    if (isHost && roomId) {
      updateRoomStatus('playing', playerId);
    }
    // Players will react to status change via navigation effect
  };


  const handleEndGame = () => {
    sounds.gameEnd();
    if (roomId && isHost) {
      updateRoomStatus('finished', playerId);
    }
    clearRoom();
    clearPlayer();
    setView('landing');
    setGameMode(null);
    // isHost will be derived from roomConfig.hostId (will be false when room/player cleared)
    setUsername('');
    setRoomCode('');
    setPlayers([]);
    setAssignedTeam(null);
    setTopicInput('');
    setContentPack(null);
    setTeamData([]);
    setCustomTeamNames({});
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
                <h3 className="font-bold mb-3 text-gray-900 text-sm uppercase tracking-wide">Players in Room ({players.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {players.length > 0 ? players.map((player, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl text-sm font-medium ${
                        player === username
                          ? 'bg-gray-900 text-white'
                          : 'bg-white text-gray-700'
                      }`}
                    >
                      {player}
                    </div>
                  )) : (
                    <div className="p-3 rounded-xl text-sm font-medium bg-white text-gray-700">
                      Loading players...
                    </div>
                  )}
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
                    {players.length > 0 ? players.map((player, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-2 bg-white rounded-xl text-sm text-gray-700 font-medium"
                      >
                        {player}
                      </motion.div>
                    )) : (
                      <div className="col-span-full p-4 text-center text-gray-500 text-sm font-medium">
                        Waiting for players to join...
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-800 text-center font-bold">{players.length} players connected</p>
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
          <GroupPulse onComplete={handleGroupPulseComplete} isHost={isHost} />
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

export default function App() {
  return (
    <RoomProvider>
      <PlayerProvider>
        <AppContent />
      </PlayerProvider>
    </RoomProvider>
  );
}
