-- Icebreakr Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Rooms table: stores game sessions
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  game_mode TEXT, -- 'pop-quiz', 'secret-phrase', 'sync'
  topic TEXT,
  content_pack JSONB, -- stores the selected content pack
  team_size INTEGER DEFAULT 4,
  target_score INTEGER DEFAULT 5,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'team-assignment', 'team-naming', 'group-pulse', 'playing', 'ended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table: tracks all players in rooms
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  is_host BOOLEAN DEFAULT FALSE,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  presence_status TEXT DEFAULT 'online', -- 'online', 'away', 'offline'
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, username)
);

-- Teams table: stores team information
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL, -- 'Team 1', 'Team 2', etc.
  custom_name TEXT, -- user-provided name
  color TEXT, -- 'bg-blue-500', etc.
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team names table: tracks team naming progress
CREATE TABLE IF NOT EXISTS team_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  suggested_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, player_id)
);

-- Group pulse responses
CREATE TABLE IF NOT EXISTS group_pulse_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  answer_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id, question_index)
);

-- Game state: tracks current game state
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE UNIQUE,
  game_mode TEXT NOT NULL,
  current_round INTEGER DEFAULT 0,
  current_question_index INTEGER,
  current_question JSONB, -- stores the current question/phrase
  time_left INTEGER,
  round_started_at TIMESTAMPTZ,
  status TEXT DEFAULT 'starting', -- 'starting', 'playing', 'results', 'ended'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pop Quiz Rally answers
CREATE TABLE IF NOT EXISTS pop_quiz_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  is_correct BOOLEAN,
  answered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id, round_number)
);

-- Secret Phrase guesses
CREATE TABLE IF NOT EXISTS secret_phrase_guesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  phrase_id TEXT NOT NULL,
  guess TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  guessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Secret Phrase clue rotation
CREATE TABLE IF NOT EXISTS secret_phrase_clues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  clue_index INTEGER NOT NULL,
  recipient_player_id UUID REFERENCES players(id) ON DELETE SET NULL,
  clue_text TEXT NOT NULL,
  time_left INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, round_number, clue_index)
);

-- Sync game answers
CREATE TABLE IF NOT EXISTS sync_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  selected_answer INTEGER NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, player_id, round_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_players_room ON players(room_id);
CREATE INDEX IF NOT EXISTS idx_teams_room ON teams(room_id);
CREATE INDEX IF NOT EXISTS idx_game_state_room ON game_state(room_id);
CREATE INDEX IF NOT EXISTS idx_pop_quiz_answers_room_round ON pop_quiz_answers(room_id, round_number);
CREATE INDEX IF NOT EXISTS idx_secret_phrase_guesses_room_round ON secret_phrase_guesses(room_id, round_number);
CREATE INDEX IF NOT EXISTS idx_sync_answers_room_round ON sync_answers(room_id, round_number);

-- Row Level Security (RLS) policies
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_pulse_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE pop_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_phrase_guesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE secret_phrase_clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_answers ENABLE ROW LEVEL SECURITY;

-- Policies: Allow anyone to read/write (for multiplayer game)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on team_names" ON team_names FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on group_pulse_responses" ON group_pulse_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on game_state" ON game_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pop_quiz_answers" ON pop_quiz_answers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on secret_phrase_guesses" ON secret_phrase_guesses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on secret_phrase_clues" ON secret_phrase_clues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sync_answers" ON sync_answers FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_state_updated_at BEFORE UPDATE ON game_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

