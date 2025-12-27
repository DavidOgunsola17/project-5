import { supabase } from './supabase';

/**
 * Game Service
 * High-level API for game operations
 */
export class GameService {
  /**
   * Create a new room (host)
   */
  static async createRoom({ username, topic, gameMode, teamSize, targetScore }) {
    try {
      // Generate room code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          code,
          host_id: crypto.randomUUID(), // In production, use authenticated user ID
          topic,
          game_mode: gameMode,
          team_size: teamSize || 4,
          target_score: targetScore || 5,
          status: 'waiting',
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Create host player record (host is not a player, but we track them)
      const { data: hostPlayer, error: hostError } = await supabase
        .from('players')
        .insert({
          room_id: room.id,
          username: username || 'Host',
          is_host: true,
        })
        .select()
        .single();

      if (hostError) throw hostError;

      return { success: true, room, hostPlayer };
    } catch (error) {
      console.error('Create room error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Join an existing room
   */
  static async joinRoom({ roomCode, username }) {
    try {
      // Find room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('code', roomCode.toUpperCase())
        .single();

      if (roomError || !room) {
        throw new Error('Room not found');
      }

      if (room.status === 'ended') {
        throw new Error('This game has ended');
      }

      // Check if player already exists
      const { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('room_id', room.id)
        .eq('username', username)
        .single();

      let player;
      if (existingPlayer) {
        // Update existing player
        const { data: updatedPlayer, error: updateError } = await supabase
          .from('players')
          .update({
            presence_status: 'online',
            last_seen: new Date().toISOString(),
          })
          .eq('id', existingPlayer.id)
          .select()
          .single();

        if (updateError) throw updateError;
        player = updatedPlayer;
      } else {
        // Create new player
        const { data: newPlayer, error: playerError } = await supabase
          .from('players')
          .insert({
            room_id: room.id,
            username,
            is_host: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;
        player = newPlayer;
      }

      return { success: true, room, player };
    } catch (error) {
      console.error('Join room error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Assign teams based on team size
   */
  static async assignTeams({ roomId, teamSize }) {
    try {
      // Get all players (excluding host)
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('*')
        .eq('room_id', roomId)
        .eq('is_host', false)
        .order('created_at', { ascending: true });

      if (playersError) throw playersError;

      if (!players || players.length === 0) {
        throw new Error('No players to assign');
      }

      // Calculate number of teams
      const numTeams = Math.max(2, Math.ceil(players.length / teamSize));

      // Delete existing teams
      await supabase.from('teams').delete().eq('room_id', roomId);

      const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

      // Create teams and assign players
      const teams = [];
      for (let i = 0; i < numTeams; i++) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .insert({
            room_id: roomId,
            original_name: `Team ${i + 1}`,
            color: TEAM_COLORS[i % TEAM_COLORS.length],
            score: 0,
          })
          .select()
          .single();

        if (teamError) throw teamError;

        // Assign players to this team (round-robin)
        const teamPlayers = players.filter((_, idx) => idx % numTeams === i);
        for (const player of teamPlayers) {
          await supabase
            .from('players')
            .update({ team_id: team.id })
            .eq('id', player.id);
        }

        teams.push({
          ...team,
          players: teamPlayers,
        });
      }

      // Update room status
      await supabase
        .from('rooms')
        .update({ status: 'team-assignment' })
        .eq('id', roomId);

      return { success: true, teams };
    } catch (error) {
      console.error('Assign teams error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update room
   */
  static async updateRoom({ roomId, updates }) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', roomId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update room error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update team name
   */
  static async updateTeamName({ teamId, customName }) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ custom_name: customName })
        .eq('id', teamId);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Update team name error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start game session
   */
  static async startSession({ roomId, contentPack }) {
    try {
      // Update room with content pack and status
      const { data, error } = await supabase
        .from('rooms')
        .update({
          content_pack: contentPack,
          status: 'team-naming',
        })
        .eq('id', roomId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Start session error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Start group pulse
   */
  static async startGroupPulse({ roomId }) {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ status: 'group-pulse' })
        .eq('id', roomId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Start group pulse error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete group pulse and start game
   */
  static async startGame({ roomId }) {
    try {
      // Initialize game state
      const { data: room } = await supabase
        .from('rooms')
        .select('game_mode, content_pack')
        .eq('id', roomId)
        .single();

      const { data: gameState, error: gameStateError } = await supabase
        .from('game_state')
        .upsert({
          room_id: roomId,
          game_mode: room.game_mode,
          current_round: 0,
          status: 'starting',
        }, {
          onConflict: 'room_id',
        })
        .select()
        .single();

      if (gameStateError) throw gameStateError;

      // Update room status
      const { error: roomError } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', roomId);

      if (roomError) throw roomError;

      return { success: true, gameState };
    } catch (error) {
      console.error('Start game error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * End game
   */
  static async endGame({ roomId }) {
    try {
      const { error } = await supabase
        .from('rooms')
        .update({ status: 'ended' })
        .eq('id', roomId);

      if (error) throw error;

      const { error: gameStateError } = await supabase
        .from('game_state')
        .update({ status: 'ended' })
        .eq('room_id', roomId);

      if (gameStateError) throw gameStateError;

      return { success: true };
    } catch (error) {
      console.error('End game error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get winning team
   */
  static async getWinningTeam({ roomId }) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('room_id', roomId)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { success: true, team: data };
    } catch (error) {
      console.error('Get winning team error:', error);
      return { success: false, error: error.message };
    }
  }
}

