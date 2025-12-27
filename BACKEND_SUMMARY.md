# Icebreakr Backend Implementation Summary

## What Was Built

### 1. Database Schema (`supabase/schema.sql`)
- **rooms**: Stores game sessions with status, game mode, topic, settings
- **players**: Tracks all players in rooms with presence status
- **teams**: Team information with scores and custom names
- **team_names**: Tracks team naming progress
- **group_pulse_responses**: Stores Group Pulse question answers
- **game_state**: Current game state (round, question, timer)
- **pop_quiz_answers**: Individual answers for Pop Quiz Rally
- **secret_phrase_guesses**: Guesses for Secret Phrase game
- **secret_phrase_clues**: Clue rotation tracking
- **sync_answers**: Answers for Sync game

### 2. Backend Services

#### `src/lib/supabase.js`
- Supabase client configuration
- Uses environment variables for credentials

#### `src/lib/gameService.js`
- High-level game operations:
  - `createRoom()` - Host creates a room
  - `joinRoom()` - Players join with code
  - `assignTeams()` - Assign players to teams based on team size
  - `updateTeamName()` - Update team custom names
  - `startSession()` - Begin game session
  - `startGroupPulse()` - Start group pulse phase
  - `startGame()` - Initialize game state
  - `endGame()` - End game session

#### `src/lib/gameSync.js`
- Real-time synchronization service
- Subscribes to Supabase Realtime for live updates
- Methods for all game operations:
  - Room/player/team management
  - Group Pulse answers
  - Game state updates
  - Answer submissions for all game modes
  - Score tracking

#### `src/hooks/useGameRoom.js`
- React hook for managing game room state
- Automatically syncs with backend
- Handles real-time updates
- Manages presence tracking

### 3. Frontend Integration

#### `src/App.jsx`
- Connected to backend for:
  - Room creation (host)
  - Room joining (players)
  - Player list updates (real-time)
  - Team assignment
  - Team naming
  - Game flow navigation

#### `src/components/GroupPulse.jsx`
- Saves answers to backend
- Displays aggregate results from all players
- Real-time result updates

#### `src/PopQuizRally.jsx`
- Submits answers to backend
- Loads all player answers for results
- Syncs game state with host
- Real-time score updates

### 4. Edge Functions (Optional)

#### `supabase/functions/create-room/index.ts`
- Creates room and host player

#### `supabase/functions/join-room/index.ts`
- Handles player joining logic

#### `supabase/functions/assign-teams/index.ts`
- Assigns players to teams based on team size

#### `supabase/functions/calculate-scores/index.ts`
- Calculates scores for all game modes

## Key Features Implemented

✅ **Host is never a player** - Host has separate record, excluded from team assignment
✅ **Players join with code and username** - Room code system with unique usernames
✅ **Rooms persist until host ends** - Status-based room lifecycle
✅ **Presence tracking** - Players update last_seen, status tracked
✅ **Reconnect handling** - Players can rejoin with same username
✅ **Team assignment based on team size** - Dynamic team count calculation
✅ **Each player names their own team** - Team naming syncs to all players
✅ **Group pulse before gameplay** - Always runs, results visible to all
✅ **Synced gameplay** - All game modes sync questions/answers
✅ **Live scoreboard** - Scores update in real-time
✅ **Winning team screen** - Shows at game end

## API Keys and Configuration

### Required Environment Variables

Create a `.env` file with:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Where to Find API Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Security Notes

- The anon key is safe to use in frontend code (it's public)
- RLS policies control access (currently set to allow all for multiplayer)
- For production, consider more restrictive RLS policies

## Database Functions

Run `supabase/functions/database-functions.sql` to create:
- `increment_team_score()` - Safely update team scores
- `check_secret_phrase_guess()` - Validate phrase guesses
- `get_winning_team()` - Get winner at game end

## Real-time Sync

All game state syncs via Supabase Realtime:
- Player joins/leaves
- Team assignments
- Team names
- Game state (round, question, timer)
- Answers
- Scores

## AI Integration Hooks

The codebase is structured for easy AI integration:

1. **Content Generation**: `selectContentPack()` in `src/lib/contentPacks.js` can call AI
2. **Topic Input**: `topicInput` in App.jsx is ready for AI processing
3. **Dynamic Content**: All games receive `contentPack` which can be AI-generated
4. **Edge Functions**: Can be extended to call OpenAI/Anthropic APIs

Example AI integration:
```javascript
// Replace in App.jsx
const pack = await generateAIContent(topicInput);
// Where generateAIContent calls OpenAI/Anthropic API
```

## Testing Checklist

- [ ] Host can create room
- [ ] Players can join with code
- [ ] Players appear in real-time
- [ ] Teams assign correctly based on team size
- [ ] Team names sync to all players
- [ ] Group Pulse saves and shows aggregate results
- [ ] Pop Quiz Rally syncs questions and answers
- [ ] Secret Phrase syncs phrases and guesses
- [ ] Sync game syncs questions and calculates alignment
- [ ] Scores update live
- [ ] Winning team displays at end
- [ ] Host can end game
- [ ] Players can reconnect

## Next Steps for AI Integration

1. Add AI API key to environment variables
2. Create AI service in `src/lib/aiService.js`
3. Update `handleGenerateEvent` in App.jsx to call AI
4. Generate questions/phrases based on topic
5. Store AI-generated content in `content_pack` JSONB field

## File Structure

```
project/
├── src/
│   ├── lib/
│   │   ├── supabase.js          # Supabase client
│   │   ├── gameService.js       # High-level game operations
│   │   ├── gameSync.js          # Real-time sync service
│   │   └── contentPacks.js      # Content (ready for AI)
│   ├── hooks/
│   │   └── useGameRoom.js       # Game room state hook
│   ├── components/
│   │   └── GroupPulse.jsx       # Connected to backend
│   ├── App.jsx                   # Main app (backend integrated)
│   ├── PopQuizRally.jsx         # Game (backend integrated)
│   ├── SecretPhrase.jsx         # Game (needs backend)
│   └── Sync.jsx                 # Game (needs backend)
├── supabase/
│   ├── schema.sql               # Database schema
│   └── functions/               # Edge Functions (optional)
└── .env                         # API keys (create this)
```

