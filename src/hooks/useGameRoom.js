import { useState, useEffect, useCallback, useRef } from 'react';
import { GameService } from '../lib/gameService';
import { GameSync } from '../lib/gameSync';

/**
 * Custom hook for managing game room state and real-time sync
 */
export function useGameRoom(roomCode, userId, username, isHost) {
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [gameState, setGameState] = useState(null);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(false); // Start as false since we only load when we have room info
  const [error, setError] = useState(null);

  const gameSyncRef = useRef(null);

  // Load initial data function
  const loadInitialData = useCallback(async () => {
    try {
      const sync = gameSyncRef.current;
      if (!sync) return;

      setLoading(true);

      // Load room
      const { data: roomData } = await sync.getRoom();
      setRoom(roomData);

      // Load players
      const { data: playersData } = await sync.getPlayers();
      setPlayers(playersData || []);

      // Load teams
      const { data: teamsData } = await sync.getTeams();
      if (teamsData) {
        setTeams(teamsData);
        // Calculate scores
        const scoreMap = {};
        teamsData.forEach((team) => {
          scoreMap[team.custom_name || team.original_name] = team.score || 0;
        });
        setScores(scoreMap);
      }

      // Load game state if playing
      if (roomData?.status === 'playing') {
        const { data: stateData } = await sync.getGameState();
        setGameState(stateData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Initialize game sync
  useEffect(() => {
    if (!roomCode || !userId || !username) {
      // Reset state when room info is cleared
      setRoom(null);
      setPlayers([]);
      setTeams([]);
      setGameState(null);
      setScores({});
      setError(null);
      setLoading(false);
      if (gameSyncRef.current) {
        gameSyncRef.current.disconnect();
        gameSyncRef.current = null;
      }
      return;
    }

    setLoading(true);
    const sync = new GameSync(roomCode, userId, username);
    gameSyncRef.current = sync;

    sync.initialize().then((result) => {
      if (result.success) {
        loadInitialData();
      } else {
        setError(result.error);
        setLoading(false);
      }
    }).catch((err) => {
      console.error('Error initializing game sync:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => {
      if (gameSyncRef.current) {
        gameSyncRef.current.disconnect();
        gameSyncRef.current = null;
      }
    };
  }, [roomCode, userId, username, loadInitialData]);

  // Track when sync is ready (has roomId)
  const [syncReady, setSyncReady] = useState(false);

  // Mark sync as ready after initialization
  useEffect(() => {
    const sync = gameSyncRef.current;
    if (sync && sync.roomId) {
      setSyncReady(true);
    } else {
      setSyncReady(false);
    }
  }, [gameSyncRef.current?.roomId]);

  // Subscribe to real-time updates - only after sync is initialized
  useEffect(() => {
    const sync = gameSyncRef.current;
    if (!sync || !sync.roomId || !syncReady) return;

    // Subscribe to players changes
    const unsubscribePlayers = sync.onTableChange('players', async () => {
      const { data } = await sync.getPlayers();
      setPlayers(data || []);
    });

    // Subscribe to teams changes
    const unsubscribeTeams = sync.onTableChange('teams', async () => {
      const { data } = await sync.getTeams();
      if (data) {
        setTeams(data);
        const scoreMap = {};
        data.forEach((team) => {
          scoreMap[team.custom_name || team.original_name] = team.score || 0;
        });
        setScores(scoreMap);
      }
    });

    // Subscribe to game state changes
    const unsubscribeGameState = sync.onTableChange('game_state', async () => {
      const { data } = await sync.getGameState();
      setGameState(data);
    });

    // Subscribe to room changes
    const unsubscribeRoom = sync.onTableChange('rooms', async () => {
      const { data } = await sync.getRoom();
      setRoom(data);
    });

    // Subscribe to gameplay table changes
    const unsubscribePopQuizAnswers = sync.onTableChange('pop_quiz_answers', async () => {
      // Trigger score recalculation if needed
      const { data: teamsData } = await sync.getTeams();
      if (teamsData) {
        const scoreMap = {};
        teamsData.forEach((team) => {
          scoreMap[team.custom_name || team.original_name] = team.score || 0;
        });
        setScores(scoreMap);
      }
    });

    const unsubscribeSecretPhraseGuesses = sync.onTableChange('secret_phrase_guesses', async () => {
      // Updates will be handled by game components
    });

    const unsubscribeSecretPhraseClues = sync.onTableChange('secret_phrase_clues', async () => {
      // Updates will be handled by game components
    });

    const unsubscribeSyncAnswers = sync.onTableChange('sync_answers', async () => {
      // Updates will be handled by game components
    });

    const unsubscribeGroupPulseResponses = sync.onTableChange('group_pulse_responses', async () => {
      // Updates will be handled by game components
    });

    // Update presence periodically
    const presenceInterval = setInterval(() => {
      sync.updatePresence();
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribePlayers();
      unsubscribeTeams();
      unsubscribeGameState();
      unsubscribeRoom();
      unsubscribePopQuizAnswers();
      unsubscribeSecretPhraseGuesses();
      unsubscribeSecretPhraseClues();
      unsubscribeSyncAnswers();
      unsubscribeGroupPulseResponses();
      clearInterval(presenceInterval);
    };
  }, [syncReady]);

  // Helper functions
  const updateRoomStatus = useCallback(async (status, updates = {}) => {
    const sync = gameSyncRef.current;
    if (!sync) return { success: false };

    const result = await sync.updateRoomStatus(status, updates);
    return result;
  }, []);

  const assignTeams = useCallback(async (teamSize) => {
    if (!room?.id) return { success: false };
    return await GameService.assignTeams({ roomId: room.id, teamSize });
  }, [room]);

  const updateTeamName = useCallback(async (teamId, customName) => {
    const sync = gameSyncRef.current;
    if (!sync) return { success: false };
    return await sync.updateTeamName(teamId, customName);
  }, []);

  const startGame = useCallback(async () => {
    if (!room?.id) return { success: false };
    return await GameService.startGame({ roomId: room.id });
  }, [room]);

  const endGame = useCallback(async () => {
    if (!room?.id) return { success: false };
    return await GameService.endGame({ roomId: room.id });
  }, [room]);

  const getGameSync = useCallback(() => {
    return gameSyncRef.current;
  }, []);

  return {
    room,
    players,
    teams,
    gameState,
    scores,
    loading,
    error,
    updateRoomStatus,
    assignTeams,
    updateTeamName,
    startGame,
    endGame,
    getGameSync,
  };
}

