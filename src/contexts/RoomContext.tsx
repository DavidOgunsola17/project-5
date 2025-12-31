import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as roomAPI from '../api/rooms';
import type { Room, GameState } from '../api/rooms';

interface RoomContextType {
  roomId: string | null;
  roomCode: string | null;
  roomStatus: string | null;
  roomConfig: {
    gameMode: string | null;
    topic: string | null;
    contentPack: any | null;
    teamSize: number;
    targetScore: number;
    hostId: string | null;
  };
  gameState: GameState | null;
  createOrJoinRoom: (
    roomCode: string,
    hostId: string,
    gameMode?: string,
    topic?: string,
    contentPack?: any
  ) => Promise<Room | null>;
  joinRoom: (roomCode: string) => Promise<Room | null>;
  fetchRoom: () => Promise<void>;
  updateRoomStatus: (status: string) => Promise<boolean>;
  updateRoomConfig: (config: {
    team_size?: number;
    target_score?: number;
    game_mode?: string;
    topic?: string;
    content_pack?: any;
  }) => Promise<boolean>;
  fetchGameState: () => Promise<void>;
  updateGameState: (state: {
    game_mode?: string;
    current_round?: number;
    current_question_index?: number | null;
    current_question?: any | null;
    time_left?: number | null;
    round_started_at?: string | null;
    status?: string;
  }) => Promise<boolean>;
  clearRoom: () => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export function RoomProvider({ children }: { children: ReactNode }) {
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<string | null>(null);
  const [roomConfig, setRoomConfig] = useState({
    gameMode: null as string | null,
    topic: null as string | null,
    contentPack: null as any | null,
    teamSize: 4,
    targetScore: 5,
    hostId: null as string | null,
  });
  const [gameState, setGameState] = useState<GameState | null>(null);

  const createOrJoinRoom = useCallback(
    async (
      code: string,
      hostId: string,
      gameMode?: string,
      topic?: string,
      contentPack?: any
    ): Promise<Room | null> => {
      const room = await roomAPI.createRoom(code, hostId, gameMode, topic, contentPack);
      if (room) {
        setRoomId(room.id);
        setRoomCode(room.code);
        setRoomStatus(room.status);
        setRoomConfig({
          gameMode: room.game_mode,
          topic: room.topic,
          contentPack: room.content_pack,
          teamSize: room.team_size,
          targetScore: room.target_score,
          hostId: room.host_id,
        });
      }
      return room;
    },
    []
  );

  const joinRoom = useCallback(async (code: string): Promise<Room | null> => {
    const room = await roomAPI.joinRoom(code);
    if (room) {
      setRoomId(room.id);
      setRoomCode(room.code);
      setRoomStatus(room.status);
      setRoomConfig({
        gameMode: room.game_mode,
        topic: room.topic,
        contentPack: room.content_pack,
        teamSize: room.team_size,
        targetScore: room.target_score,
        hostId: room.host_id,
      });
    }
    return room;
  }, []);

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    const room = await roomAPI.fetchRoom(roomId);
    if (room) {
      setRoomCode(room.code);
      setRoomStatus(room.status);
      setRoomConfig({
        gameMode: room.game_mode,
        topic: room.topic,
        contentPack: room.content_pack,
        teamSize: room.team_size,
        targetScore: room.target_score,
        hostId: room.host_id,
      });
    }
  }, [roomId]);

  const updateRoomStatus = useCallback(
    async (status: string): Promise<boolean> => {
      if (!roomId) return false;
      const success = await roomAPI.updateRoomStatus(roomId, status);
      if (success) {
        setRoomStatus(status);
      }
      return success;
    },
    [roomId]
  );

  const updateRoomConfig = useCallback(
    async (config: {
      team_size?: number;
      target_score?: number;
      game_mode?: string;
      topic?: string;
      content_pack?: any;
    }): Promise<boolean> => {
      if (!roomId) return false;
      const success = await roomAPI.updateRoomConfig(roomId, config);
      if (success) {
        // Update local state
        if (config.team_size !== undefined) {
          setRoomConfig((prev) => ({ ...prev, teamSize: config.team_size! }));
        }
        if (config.target_score !== undefined) {
          setRoomConfig((prev) => ({ ...prev, targetScore: config.target_score! }));
        }
        if (config.game_mode !== undefined) {
          setRoomConfig((prev) => ({ ...prev, gameMode: config.game_mode! }));
        }
        if (config.topic !== undefined) {
          setRoomConfig((prev) => ({ ...prev, topic: config.topic! }));
        }
        if (config.content_pack !== undefined) {
          setRoomConfig((prev) => ({ ...prev, contentPack: config.content_pack }));
        }
      }
      return success;
    },
    [roomId]
  );

  const fetchGameState = useCallback(async () => {
    if (!roomId) return;
    const state = await roomAPI.fetchGameState(roomId);
    setGameState(state);
  }, [roomId]);

  const updateGameState = useCallback(
    async (state: {
      game_mode?: string;
      current_round?: number;
      current_question_index?: number | null;
      current_question?: any | null;
      time_left?: number | null;
      round_started_at?: string | null;
      status?: string;
    }): Promise<boolean> => {
      if (!roomId) return false;
      const success = await roomAPI.updateGameState(roomId, state);
      if (success) {
        // Refresh game state
        await fetchGameState();
      }
      return success;
    },
    [roomId, fetchGameState]
  );

  const clearRoom = useCallback(() => {
    setRoomId(null);
    setRoomCode(null);
    setRoomStatus(null);
    setRoomConfig({
      gameMode: null,
      topic: null,
      contentPack: null,
      teamSize: 4,
      targetScore: 5,
      hostId: null,
    });
    setGameState(null);
  }, []);

  return (
    <RoomContext.Provider
      value={{
        roomId,
        roomCode,
        roomStatus,
        roomConfig,
        gameState,
        createOrJoinRoom,
        joinRoom,
        fetchRoom,
        updateRoomStatus,
        updateRoomConfig,
        fetchGameState,
        updateGameState,
        clearRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (context === undefined) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
}

// TODO Phase 2: Add Supabase channel subscription for room updates
// Example:
// useEffect(() => {
//   if (!roomId) return;
//   const channel = supabase
//     .channel(`room:${roomId}`)
//     .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` }, (payload) => {
//       // Update room state from realtime changes
//     })
//     .subscribe();
//   return () => {
//     supabase.removeChannel(channel);
//   };
// }, [roomId]);

