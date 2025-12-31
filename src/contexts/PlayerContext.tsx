import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as playerAPI from '../api/players';
import type { Player } from '../api/players';

interface PlayerContextType {
  playerId: string | null;
  playerName: string | null;
  isHost: boolean;
  teamId: string | null;
  players: Player[];
  createOrJoinPlayer: (roomId: string, username: string, isHost: boolean) => Promise<Player | null>;
  joinPlayer: (roomId: string, username: string) => Promise<Player | null>;
  fetchPlayers: (roomId: string) => Promise<void>;
  updatePlayerTeam: (playerId: string, teamId: string | null) => Promise<boolean>;
  fetchPlayersByTeam: (roomId: string, teamId: string) => Promise<Player[]>;
  clearPlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

  const createOrJoinPlayer = useCallback(
    async (roomId: string, username: string, isHostPlayer: boolean): Promise<Player | null> => {
      const player = await playerAPI.createPlayer(roomId, username, isHostPlayer);
      if (player) {
        setPlayerId(player.id);
        setPlayerName(player.username);
        setIsHost(player.is_host);
        setTeamId(player.team_id);
      }
      return player;
    },
    []
  );

  const joinPlayer = useCallback(
    async (roomId: string, username: string): Promise<Player | null> => {
      const player = await playerAPI.joinPlayer(roomId, username);
      if (player) {
        setPlayerId(player.id);
        setPlayerName(player.username);
        setIsHost(player.is_host);
        setTeamId(player.team_id);
      }
      return player;
    },
    []
  );

  const fetchPlayers = useCallback(async (roomId: string) => {
    const playerList = await playerAPI.fetchPlayers(roomId);
    setPlayers(playerList);
    // Update current player info if we're in the list
    const currentPlayer = playerList.find((p) => p.id === playerId);
    if (currentPlayer) {
      setTeamId(currentPlayer.team_id);
    }
  }, [playerId]);

  const updatePlayerTeam = useCallback(
    async (targetPlayerId: string, newTeamId: string | null): Promise<boolean> => {
      const success = await playerAPI.updatePlayerTeam(targetPlayerId, newTeamId);
      if (success && targetPlayerId === playerId) {
        setTeamId(newTeamId);
      }
      // Refresh players list
      if (players.length > 0 && players[0].room_id) {
        await fetchPlayers(players[0].room_id);
      }
      return success;
    },
    [playerId, players, fetchPlayers]
  );

  const fetchPlayersByTeam = useCallback(
    async (roomId: string, teamId: string): Promise<Player[]> => {
      return await playerAPI.fetchPlayersByTeam(roomId, teamId);
    },
    []
  );

  const clearPlayer = useCallback(() => {
    setPlayerId(null);
    setPlayerName(null);
    setIsHost(false);
    setTeamId(null);
    setPlayers([]);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        playerId,
        playerName,
        isHost,
        teamId,
        players,
        createOrJoinPlayer,
        joinPlayer,
        fetchPlayers,
        updatePlayerTeam,
        fetchPlayersByTeam,
        clearPlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

// TODO Phase 2: Add Supabase channel subscription for player list updates
// Example:
// useEffect(() => {
//   if (!roomId) return;
//   const channel = supabase
//     .channel(`players:${roomId}`)
//     .on('postgres_changes', { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` }, (payload) => {
//       // Update players list from realtime changes
//       fetchPlayers(roomId);
//     })
//     .subscribe();
//   return () => {
//     supabase.removeChannel(channel);
//   };
// }, [roomId, fetchPlayers]);

