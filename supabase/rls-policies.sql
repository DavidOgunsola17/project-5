-- RLS Policies for Icebreakr
-- This script adds missing SELECT and INSERT policies for anon and authenticated roles
-- It only creates policies that don't already exist, preserving any custom policies you may have

-- ============================================================================
-- ROOMS TABLE
-- Operations: SELECT, INSERT, UPDATE
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'anon_select_rooms'
  ) THEN
    CREATE POLICY "anon_select_rooms" ON rooms
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'authenticated_select_rooms'
  ) THEN
    CREATE POLICY "authenticated_select_rooms" ON rooms
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'anon_insert_rooms'
  ) THEN
    CREATE POLICY "anon_insert_rooms" ON rooms
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'authenticated_insert_rooms'
  ) THEN
    CREATE POLICY "authenticated_insert_rooms" ON rooms
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'anon_update_rooms'
  ) THEN
    CREATE POLICY "anon_update_rooms" ON rooms
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'rooms' 
    AND policyname = 'authenticated_update_rooms'
  ) THEN
    CREATE POLICY "authenticated_update_rooms" ON rooms
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- PLAYERS TABLE
-- Operations: SELECT, INSERT, UPDATE
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'anon_select_players'
  ) THEN
    CREATE POLICY "anon_select_players" ON players
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'authenticated_select_players'
  ) THEN
    CREATE POLICY "authenticated_select_players" ON players
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'anon_insert_players'
  ) THEN
    CREATE POLICY "anon_insert_players" ON players
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'authenticated_insert_players'
  ) THEN
    CREATE POLICY "authenticated_insert_players" ON players
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'anon_update_players'
  ) THEN
    CREATE POLICY "anon_update_players" ON players
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'players' 
    AND policyname = 'authenticated_update_players'
  ) THEN
    CREATE POLICY "authenticated_update_players" ON players
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- TEAMS TABLE
-- Operations: SELECT, INSERT, UPDATE, DELETE
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'anon_select_teams'
  ) THEN
    CREATE POLICY "anon_select_teams" ON teams
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'authenticated_select_teams'
  ) THEN
    CREATE POLICY "authenticated_select_teams" ON teams
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'anon_insert_teams'
  ) THEN
    CREATE POLICY "anon_insert_teams" ON teams
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'authenticated_insert_teams'
  ) THEN
    CREATE POLICY "authenticated_insert_teams" ON teams
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'anon_update_teams'
  ) THEN
    CREATE POLICY "anon_update_teams" ON teams
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'authenticated_update_teams'
  ) THEN
    CREATE POLICY "authenticated_update_teams" ON teams
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create DELETE policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'anon_delete_teams'
  ) THEN
    CREATE POLICY "anon_delete_teams" ON teams
      FOR DELETE
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create DELETE policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND policyname = 'authenticated_delete_teams'
  ) THEN
    CREATE POLICY "authenticated_delete_teams" ON teams
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- GROUP_PULSE_RESPONSES TABLE
-- Operations: SELECT, INSERT (via upsert)
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'anon_select_group_pulse_responses'
  ) THEN
    CREATE POLICY "anon_select_group_pulse_responses" ON group_pulse_responses
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'authenticated_select_group_pulse_responses'
  ) THEN
    CREATE POLICY "authenticated_select_group_pulse_responses" ON group_pulse_responses
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'anon_insert_group_pulse_responses'
  ) THEN
    CREATE POLICY "anon_insert_group_pulse_responses" ON group_pulse_responses
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'authenticated_insert_group_pulse_responses'
  ) THEN
    CREATE POLICY "authenticated_insert_group_pulse_responses" ON group_pulse_responses
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'anon_update_group_pulse_responses'
  ) THEN
    CREATE POLICY "anon_update_group_pulse_responses" ON group_pulse_responses
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'group_pulse_responses' 
    AND policyname = 'authenticated_update_group_pulse_responses'
  ) THEN
    CREATE POLICY "authenticated_update_group_pulse_responses" ON group_pulse_responses
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- GAME_STATE TABLE
-- Operations: SELECT, INSERT, UPDATE (via upsert)
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'anon_select_game_state'
  ) THEN
    CREATE POLICY "anon_select_game_state" ON game_state
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'authenticated_select_game_state'
  ) THEN
    CREATE POLICY "authenticated_select_game_state" ON game_state
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'anon_insert_game_state'
  ) THEN
    CREATE POLICY "anon_insert_game_state" ON game_state
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'authenticated_insert_game_state'
  ) THEN
    CREATE POLICY "authenticated_insert_game_state" ON game_state
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'anon_update_game_state'
  ) THEN
    CREATE POLICY "anon_update_game_state" ON game_state
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'game_state' 
    AND policyname = 'authenticated_update_game_state'
  ) THEN
    CREATE POLICY "authenticated_update_game_state" ON game_state
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- POP_QUIZ_ANSWERS TABLE
-- Operations: SELECT, INSERT (via upsert)
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'anon_select_pop_quiz_answers'
  ) THEN
    CREATE POLICY "anon_select_pop_quiz_answers" ON pop_quiz_answers
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'authenticated_select_pop_quiz_answers'
  ) THEN
    CREATE POLICY "authenticated_select_pop_quiz_answers" ON pop_quiz_answers
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'anon_insert_pop_quiz_answers'
  ) THEN
    CREATE POLICY "anon_insert_pop_quiz_answers" ON pop_quiz_answers
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'authenticated_insert_pop_quiz_answers'
  ) THEN
    CREATE POLICY "authenticated_insert_pop_quiz_answers" ON pop_quiz_answers
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'anon_update_pop_quiz_answers'
  ) THEN
    CREATE POLICY "anon_update_pop_quiz_answers" ON pop_quiz_answers
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'pop_quiz_answers' 
    AND policyname = 'authenticated_update_pop_quiz_answers'
  ) THEN
    CREATE POLICY "authenticated_update_pop_quiz_answers" ON pop_quiz_answers
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- SECRET_PHRASE_GUESSES TABLE
-- Operations: SELECT, INSERT
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_guesses' 
    AND policyname = 'anon_select_secret_phrase_guesses'
  ) THEN
    CREATE POLICY "anon_select_secret_phrase_guesses" ON secret_phrase_guesses
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_guesses' 
    AND policyname = 'authenticated_select_secret_phrase_guesses'
  ) THEN
    CREATE POLICY "authenticated_select_secret_phrase_guesses" ON secret_phrase_guesses
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_guesses' 
    AND policyname = 'anon_insert_secret_phrase_guesses'
  ) THEN
    CREATE POLICY "anon_insert_secret_phrase_guesses" ON secret_phrase_guesses
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_guesses' 
    AND policyname = 'authenticated_insert_secret_phrase_guesses'
  ) THEN
    CREATE POLICY "authenticated_insert_secret_phrase_guesses" ON secret_phrase_guesses
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- ============================================================================
-- SECRET_PHRASE_CLUES TABLE
-- Operations: SELECT
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_clues' 
    AND policyname = 'anon_select_secret_phrase_clues'
  ) THEN
    CREATE POLICY "anon_select_secret_phrase_clues" ON secret_phrase_clues
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'secret_phrase_clues' 
    AND policyname = 'authenticated_select_secret_phrase_clues'
  ) THEN
    CREATE POLICY "authenticated_select_secret_phrase_clues" ON secret_phrase_clues
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- ============================================================================
-- SYNC_ANSWERS TABLE
-- Operations: SELECT, INSERT (via upsert)
-- ============================================================================

-- Check and create SELECT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'anon_select_sync_answers'
  ) THEN
    CREATE POLICY "anon_select_sync_answers" ON sync_answers
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;

-- Check and create SELECT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'authenticated_select_sync_answers'
  ) THEN
    CREATE POLICY "authenticated_select_sync_answers" ON sync_answers
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Check and create INSERT policy for anon
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'anon_insert_sync_answers'
  ) THEN
    CREATE POLICY "anon_insert_sync_answers" ON sync_answers
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create INSERT policy for authenticated
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'authenticated_insert_sync_answers'
  ) THEN
    CREATE POLICY "authenticated_insert_sync_answers" ON sync_answers
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for anon (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'anon_update_sync_answers'
  ) THEN
    CREATE POLICY "anon_update_sync_answers" ON sync_answers
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Check and create UPDATE policy for authenticated (needed for upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sync_answers' 
    AND policyname = 'authenticated_update_sync_answers'
  ) THEN
    CREATE POLICY "authenticated_update_sync_answers" ON sync_answers
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

