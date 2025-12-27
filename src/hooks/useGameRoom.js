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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const gameSyncRef = useRef(null);

  // Initialize game sync
  useEffect(() => {
    if (!roomCode || !userId || !username) return;

    const sync = new GameSync(roomCode, userId, username);
    gameSyncRef.current = sync;

    sync.initialize().then((result) => {
      if (result.success) {
        loadInitialData();
      } else {
        setError(result.error);
        setLoading(false);
      }
    });

    return () => {
      if (gameSyncRef.current) {
        gameSyncRef.current.disconnect();
      }
    };
  }, [roomCode, userId, username]);

  // Load initial data
  const loadInitialData = async () => {
    try {
      const sync = gameSyncRef.current;
      if (!sync) return;

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
      setError(err.message);
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  useEffect(() => {
    const sync = gameSyncRef.current;
    if (!sync) return;

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

    // Update presence periodically
    const presenceInterval = setInterval(() => {
      sync.updatePresence();
    }, 30000); // Every 30 seconds

    return () => {
      unsubscribePlayers();
      unsubscribeTeams();
      unsubscribeGameState();
      unsubscribeRoom();
      clearInterval(presenceInterval);
    };
  }, []);

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

