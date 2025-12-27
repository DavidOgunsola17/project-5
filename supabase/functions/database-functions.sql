-- Database functions for game logic
-- Run these in your Supabase SQL Editor

-- Function to increment team score
CREATE OR REPLACE FUNCTION increment_team_score(team_id UUID, points INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE teams
  SET score = score + points
  WHERE id = team_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if secret phrase guess is correct
CREATE OR REPLACE FUNCTION check_secret_phrase_guess(
  p_room_id UUID,
  p_round_number INTEGER,
  p_guess TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_phrase TEXT;
  v_correct BOOLEAN;
BEGIN
  -- Get the current phrase from game_state
  SELECT (current_question->>'phrase')::TEXT INTO v_phrase
  FROM game_state
  WHERE room_id = p_room_id;

  -- Check if guess matches (case-insensitive)
  v_correct = UPPER(TRIM(p_guess)) = UPPER(TRIM(v_phrase));

  -- Update the guess record
  UPDATE secret_phrase_guesses
  SET is_correct = v_correct
  WHERE room_id = p_room_id
    AND round_number = p_round_number
    AND guess = p_guess;

  RETURN v_correct;
END;
$$ LANGUAGE plpgsql;

-- Function to get winning team
CREATE OR REPLACE FUNCTION get_winning_team(p_room_id UUID)
RETURNS TABLE(team_id UUID, team_name TEXT, score INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, COALESCE(t.custom_name, t.original_name) as team_name, t.score
  FROM teams t
  WHERE t.room_id = p_room_id
  ORDER BY t.score DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

