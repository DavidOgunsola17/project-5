import { supabase } from './supabase';

/**
 * Game Sync Service
 * Handles all real-time synchronization for multiplayer gameplay
 */
export class GameSync {
  constructor(roomCode, userId, username) {
    this.roomCode = roomCode;
    this.userId = userId;
    this.username = username;
    this.roomId = null;
    this.channel = null;
    this.listeners = new Map();
  }

  /**
   * Initialize connection and subscribe to room updates
   */
  async initialize() {
    try {
      // Get room ID from code
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', this.roomCode)
        .single();

      if (roomError || !room) {
        throw new Error('Room not found');
      }

      this.roomId = room.id;

      // Subscribe to real-time updates
      this.channel = supabase
        .channel(`room:${this.roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            filter: `room_id=eq.${this.roomId}`,
          },
          (payload) => {
            this.handleRealtimeUpdate(payload);
          }
        )
        .subscribe();

      return { success: true, roomId: this.roomId };
    } catch (error) {
      console.error('GameSync initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Handle real-time updates from Supabase
   */
  handleRealtimeUpdate(payload) {
    const { table, eventType, new: newRecord, old: oldRecord } = payload;

    // Notify all listeners for this table
    const tableListeners = this.listeners.get(table) || [];
    tableListeners.forEach((callback) => {
      callback({ eventType, newRecord, oldRecord, table });
    });
  }

  /**
   * Subscribe to changes on a specific table
   */
  onTableChange(table, callback) {
    if (!this.listeners.has(table)) {
      this.listeners.set(table, []);
    }
    this.listeners.get(table).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(table);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup and disconnect
   */
  async disconnect() {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
  }

  // Room operations
  async getRoom() {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', this.roomCode)
      .single();
    return { data, error };
  }

  async updateRoomStatus(status, updates = {}) {
    const { data, error } = await supabase
      .from('rooms')
      .update({ status, ...updates, updated_at: new Date().toISOString() })
      .eq('id', this.roomId);
    return { data, error };
  }

  // Player operations
  async getPlayers() {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', this.roomId)
      .order('created_at', { ascending: true });
    return { data, error };
  }

  async updatePresence() {
    const { error } = await supabase
      .from('players')
      .update({
        presence_status: 'online',
        last_seen: new Date().toISOString(),
      })
      .eq('id', this.userId);
    return { error };
  }

  // Team operations
  async getTeams() {
    const { data, error } = await supabase
      .from('teams')
      .select('*, players(*)')
      .eq('room_id', this.roomId)
      .order('created_at', { ascending: true });
    return { data, error };
  }

  async updateTeamName(teamId, customName) {
    const { data, error } = await supabase
      .from('teams')
      .update({ custom_name: customName })
      .eq('id', teamId);
    return { data, error };
  }

  // Group Pulse operations
  async submitGroupPulseAnswer(questionIndex, answerIndex) {
    const { data, error } = await supabase
      .from('group_pulse_responses')
      .upsert({
        room_id: this.roomId,
        player_id: this.userId,
        question_index: questionIndex,
        answer_index: answerIndex,
      }, {
        onConflict: 'room_id,player_id,question_index',
      });
    return { data, error };
  }

  async getGroupPulseResults() {
    const { data, error } = await supabase
      .from('group_pulse_responses')
      .select('*')
      .eq('room_id', this.roomId);
    return { data, error };
  }

  // Game state operations
  async getGameState() {
    const { data, error } = await supabase
      .from('game_state')
      .select('*')
      .eq('room_id', this.roomId)
      .single();
    return { data, error };
  }

  async updateGameState(updates) {
    const { data, error } = await supabase
      .from('game_state')
      .upsert({
        room_id: this.roomId,
        ...updates,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'room_id',
      });
    return { data, error };
  }

  // Pop Quiz Rally operations
  async submitPopQuizAnswer(roundNumber, questionIndex, selectedAnswer, isCorrect) {
    const { data: player } = await supabase
      .from('players')
      .select('team_id')
      .eq('id', this.userId)
      .single();

    const { data, error } = await supabase
      .from('pop_quiz_answers')
      .upsert({
        room_id: this.roomId,
        player_id: this.userId,
        team_id: player?.team_id,
        round_number: roundNumber,
        question_index: questionIndex,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
      }, {
        onConflict: 'room_id,player_id,round_number',
      });
    return { data, error };
  }

  async getPopQuizAnswers(roundNumber) {
    const { data, error } = await supabase
      .from('pop_quiz_answers')
      .select('*, players(username), teams(custom_name, original_name)')
      .eq('room_id', this.roomId)
      .eq('round_number', roundNumber);
    return { data, error };
  }

  // Secret Phrase operations
  async submitSecretPhraseGuess(roundNumber, phraseId, guess) {
    const { data: player } = await supabase
      .from('players')
      .select('team_id')
      .eq('id', this.userId)
      .single();

    const { data, error } = await supabase
      .from('secret_phrase_guesses')
      .insert({
        room_id: this.roomId,
        player_id: this.userId,
        team_id: player?.team_id,
        round_number: roundNumber,
        phrase_id: phraseId,
        guess: guess,
        is_correct: false, // Will be updated by backend function
      });
    return { data, error };
  }

  async getSecretPhraseGuesses(roundNumber) {
    const { data, error } = await supabase
      .from('secret_phrase_guesses')
      .select('*, players(username)')
      .eq('room_id', this.roomId)
      .eq('round_number', roundNumber)
      .order('guessed_at', { ascending: false });
    return { data, error };
  }

  async getCurrentClue(roundNumber) {
    const { data, error } = await supabase
      .from('secret_phrase_clues')
      .select('*')
      .eq('room_id', this.roomId)
      .eq('round_number', roundNumber)
      .order('clue_index', { ascending: false })
      .limit(1)
      .single();
    return { data, error };
  }

  // Sync game operations
  async submitSyncAnswer(roundNumber, questionIndex, selectedAnswer) {
    const { data: player } = await supabase
      .from('players')
      .select('team_id')
      .eq('id', this.userId)
      .single();

    const { data, error } = await supabase
      .from('sync_answers')
      .upsert({
        room_id: this.roomId,
        player_id: this.userId,
        team_id: player?.team_id,
        round_number: roundNumber,
        question_index: questionIndex,
        selected_answer: selectedAnswer,
      }, {
        onConflict: 'room_id,player_id,round_number',
      });
    return { data, error };
  }

  async getSyncAnswers(roundNumber) {
    const { data, error } = await supabase
      .from('sync_answers')
      .select('*, players(username), teams(custom_name, original_name)')
      .eq('room_id', this.roomId)
      .eq('round_number', roundNumber);
    return { data, error };
  }

  // Score operations
  async getScores() {
    const { data, error } = await supabase
      .from('teams')
      .select('id, custom_name, original_name, score, color')
      .eq('room_id', this.roomId)
      .order('score', { ascending: false });
    return { data, error };
  }

  async updateTeamScore(teamId, scoreDelta) {
    // Use RPC if available, otherwise direct update
    try {
      const { data, error } = await supabase.rpc('increment_team_score', {
        team_id: teamId,
        points: scoreDelta,
      });
      if (error && error.code === '42883') {
        // Function doesn't exist, use direct update
        const { data: team } = await supabase
          .from('teams')
          .select('score')
          .eq('id', teamId)
          .single();
        
        if (team) {
          const { data: updated, error: updateError } = await supabase
            .from('teams')
            .update({ score: (team.score || 0) + scoreDelta })
            .eq('id', teamId);
          return { data: updated, error: updateError };
        }
      }
      return { data, error };
    } catch (error) {
      // Fallback to direct update
      const { data: team } = await supabase
        .from('teams')
        .select('score')
        .eq('id', teamId)
        .single();
      
      if (team) {
        const { data: updated, error: updateError } = await supabase
          .from('teams')
          .update({ score: (team.score || 0) + scoreDelta })
          .eq('id', teamId);
        return { data: updated, error: updateError };
      }
      return { data: null, error };
    }
  }
}

