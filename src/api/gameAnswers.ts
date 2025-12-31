import { supabase } from '../lib/supabaseClient';

// TODO Phase 2: Realtime will auto-update via subscriptions, manual fetch only for initial load

/**
 * Saves a pop quiz answer
 */
export async function savePopQuizAnswer(
  roomId: string,
  playerId: string,
  teamId: string,
  roundNumber: number,
  questionIndex: number,
  selectedAnswer: number,
  isCorrect: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase.from('pop_quiz_answers').upsert(
      {
        room_id: roomId,
        player_id: playerId,
        team_id: teamId,
        round_number: roundNumber,
        question_index: questionIndex,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
      },
      {
        onConflict: 'room_id,player_id,round_number',
      }
    );

    if (error) {
      console.error('Error saving pop quiz answer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving pop quiz answer:', error);
    return false;
  }
}

/**
 * Fetches pop quiz answers for a room
 */
export async function fetchPopQuizAnswers(
  roomId: string,
  roundNumber?: number
): Promise<any[]> {
  try {
    let query = supabase
      .from('pop_quiz_answers')
      .select('*')
      .eq('room_id', roomId);

    if (roundNumber !== undefined) {
      query = query.eq('round_number', roundNumber);
    }

    const { data, error } = await query.order('answered_at', { ascending: true });

    if (error) {
      console.error('Error fetching pop quiz answers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching pop quiz answers:', error);
    return [];
  }
}

/**
 * Saves a secret phrase guess
 */
export async function saveSecretPhraseGuess(
  roomId: string,
  playerId: string,
  teamId: string,
  roundNumber: number,
  phraseId: string,
  guess: string,
  isCorrect: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase.from('secret_phrase_guesses').insert({
      room_id: roomId,
      player_id: playerId,
      team_id: teamId,
      round_number: roundNumber,
      phrase_id: phraseId,
      guess: guess.trim(),
      is_correct: isCorrect,
    });

    if (error) {
      console.error('Error saving secret phrase guess:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving secret phrase guess:', error);
    return false;
  }
}

/**
 * Fetches secret phrase guesses for a room
 */
export async function fetchSecretPhraseGuesses(
  roomId: string,
  roundNumber?: number
): Promise<any[]> {
  try {
    let query = supabase
      .from('secret_phrase_guesses')
      .select('*')
      .eq('room_id', roomId);

    if (roundNumber !== undefined) {
      query = query.eq('round_number', roundNumber);
    }

    const { data, error } = await query.order('guessed_at', { ascending: true });

    if (error) {
      console.error('Error fetching secret phrase guesses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching secret phrase guesses:', error);
    return [];
  }
}

/**
 * Saves secret phrase clue state
 */
export async function saveSecretPhraseClue(
  roomId: string,
  roundNumber: number,
  clueIndex: number,
  recipientPlayerId: string | null,
  clueText: string,
  timeLeft: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('secret_phrase_clues').upsert(
      {
        room_id: roomId,
        round_number: roundNumber,
        clue_index: clueIndex,
        recipient_player_id: recipientPlayerId,
        clue_text: clueText,
        time_left: timeLeft,
      },
      {
        onConflict: 'room_id,round_number,clue_index',
      }
    );

    if (error) {
      console.error('Error saving secret phrase clue:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving secret phrase clue:', error);
    return false;
  }
}

/**
 * Fetches secret phrase clues for a round
 */
export async function fetchSecretPhraseClues(
  roomId: string,
  roundNumber: number
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('secret_phrase_clues')
      .select('*')
      .eq('room_id', roomId)
      .eq('round_number', roundNumber)
      .order('clue_index', { ascending: true });

    if (error) {
      console.error('Error fetching secret phrase clues:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching secret phrase clues:', error);
    return [];
  }
}

/**
 * Saves a sync answer
 */
export async function saveSyncAnswer(
  roomId: string,
  playerId: string,
  teamId: string,
  roundNumber: number,
  questionIndex: number,
  selectedAnswer: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('sync_answers').upsert(
      {
        room_id: roomId,
        player_id: playerId,
        team_id: teamId,
        round_number: roundNumber,
        question_index: questionIndex,
        selected_answer: selectedAnswer,
      },
      {
        onConflict: 'room_id,player_id,round_number',
      }
    );

    if (error) {
      console.error('Error saving sync answer:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving sync answer:', error);
    return false;
  }
}

/**
 * Fetches sync answers for a room
 */
export async function fetchSyncAnswers(
  roomId: string,
  roundNumber?: number
): Promise<any[]> {
  try {
    let query = supabase
      .from('sync_answers')
      .select('*')
      .eq('room_id', roomId);

    if (roundNumber !== undefined) {
      query = query.eq('round_number', roundNumber);
    }

    const { data, error } = await query.order('locked_at', { ascending: true });

    if (error) {
      console.error('Error fetching sync answers:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching sync answers:', error);
    return [];
  }
}

/**
 * Saves a group pulse response
 */
export async function saveGroupPulseResponse(
  roomId: string,
  playerId: string,
  questionIndex: number,
  answerIndex: number
): Promise<boolean> {
  try {
    const { error } = await supabase.from('group_pulse_responses').upsert(
      {
        room_id: roomId,
        player_id: playerId,
        question_index: questionIndex,
        answer_index: answerIndex,
      },
      {
        onConflict: 'room_id,player_id,question_index',
      }
    );

    if (error) {
      console.error('Error saving group pulse response:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving group pulse response:', error);
    return false;
  }
}

/**
 * Fetches all group pulse responses for a room
 */
export async function fetchGroupPulseResponses(roomId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('group_pulse_responses')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching group pulse responses:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching group pulse responses:', error);
    return [];
  }
}

