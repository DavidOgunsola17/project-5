import { getSupabaseClient } from '../lib/supabaseClient';

export interface Room {
  id: string;
  code: string;
  host_id: string;
  game_mode: string | null;
  topic: string | null;
  content_pack: any | null;
  team_size: number;
  target_score: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface GameState {
  id: string;
  room_id: string;
  game_mode: string;
  current_round: number;
  current_question_index: number | null;
  current_question: any | null;
  time_left: number | null;
  round_started_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * Creates a new room with the given code and host ID
 */
export async function createRoom(
  roomCode: string,
  hostId: string,
  gameMode?: string,
  topic?: string,
  contentPack?: any
): Promise<Room | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code: roomCode,
        host_id: hostId,
        game_mode: gameMode || null,
        topic: topic || null,
        content_pack: contentPack || null,
        status: 'waiting',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating room:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating room:', error);
    return null;
  }
}

/**
 * Finds a room by its code
 */
export async function joinRoom(roomCode: string): Promise<Room | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', roomCode.toUpperCase())
      .single();

    if (error) {
      console.error('Error joining room:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error joining room:', error);
    return null;
  }
}

/**
 * Fetches a room by its ID
 */
export async function fetchRoom(roomId: string): Promise<Room | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
}

/**
 * Updates the room status
 */
export async function updateRoomStatus(
  roomId: string,
  status: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('rooms')
      .update({ status })
      .eq('id', roomId);

    if (error) {
      console.error('Error updating room status:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating room status:', error);
    return false;
  }
}

/**
 * Updates room configuration (team_size, target_score, game_mode, topic, content_pack, host_id)
 */
export async function updateRoomConfig(
  roomId: string,
  config: {
    team_size?: number;
    target_score?: number;
    game_mode?: string;
    topic?: string;
    content_pack?: any;
    host_id?: string;
  }
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('rooms')
      .update(config)
      .eq('id', roomId);

    if (error) {
      console.error('Error updating room config:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating room config:', error);
    return false;
  }
}

/**
 * Fetches game state for a room
 */
export async function fetchGameState(roomId: string): Promise<GameState | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', roomId)
      .single();

    if (error) {
      // If no game state exists, that's okay
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching game state:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching game state:', error);
    return null;
  }
}

/**
 * Updates or creates game state for a room
 */
export async function updateGameState(
  roomId: string,
  state: {
    game_mode?: string;
    current_round?: number;
    current_question_index?: number | null;
    current_question?: any | null;
    time_left?: number | null;
    round_started_at?: string | null;
    status?: string;
  }
): Promise<boolean> {
  try {
    // First check if game state exists
    const existing = await fetchGameState(roomId);

    const supabase = getSupabaseClient();
    if (!supabase) return false;

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('game_state')
        .update(state)
        .eq('room_id', roomId);

      if (error) {
        console.error('Error updating game state:', error);
        return false;
      }
    } else {
      // Create new
      const { error } = await supabase.from('game_state').insert({
        room_id: roomId,
        ...state,
      });

      if (error) {
        console.error('Error creating game state:', error);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating game state:', error);
    return false;
  }
}

