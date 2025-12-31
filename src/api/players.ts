import { supabase } from '../lib/supabaseClient';

export interface Player {
  id: string;
  room_id: string;
  username: string;
  is_host: boolean;
  team_id: string | null;
  presence_status: string;
  last_seen: string;
  created_at: string;
}

/**
 * Creates a new player in a room
 */
export async function createPlayer(
  roomId: string,
  username: string,
  isHost: boolean = false
): Promise<Player | null> {
  try {
    const { data, error } = await supabase
      .from('players')
      .insert({
        room_id: roomId,
        username: username.trim(),
        is_host: isHost,
        presence_status: 'online',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating player:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating player:', error);
    return null;
  }
}

/**
 * Joins a player to an existing room (non-host)
 */
export async function joinPlayer(
  roomId: string,
  username: string
): Promise<Player | null> {
  try {
    // Check if player already exists (handles unique constraint)
    const { data: existing } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('username', username.trim())
      .single();

    if (existing) {
      return existing;
    }

    // Create new player
    return await createPlayer(roomId, username, false);
  } catch (error) {
    console.error('Error joining player:', error);
    return null;
  }
}

/**
 * Fetches all players for a room
 */
export async function fetchPlayers(roomId: string): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching players:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

/**
 * Updates a player's team assignment
 */
export async function updatePlayerTeam(
  playerId: string,
  teamId: string | null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('players')
      .update({ team_id: teamId })
      .eq('id', playerId);

    if (error) {
      console.error('Error updating player team:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating player team:', error);
    return false;
  }
}

/**
 * Fetches all players in a specific team
 */
export async function fetchPlayersByTeam(
  roomId: string,
  teamId: string
): Promise<Player[]> {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching players by team:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching players by team:', error);
    return [];
  }
}

