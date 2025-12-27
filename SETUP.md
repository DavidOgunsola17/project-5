# Icebreakr Backend Setup Guide

This guide will help you set up the Supabase backend for Icebreakr.

## Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Supabase CLI (optional, for local development)

## Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note down your project URL and anon key from Settings > API

## Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to SQL Editor
2. Run the SQL from `supabase/schema.sql` to create all tables
3. Run the SQL from `supabase/functions/database-functions.sql` to create helper functions

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Replace the placeholders with your actual Supabase credentials

## Step 4: Install Dependencies

```bash
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client library
- Other existing dependencies

## Step 5: Deploy Edge Functions (Optional)

If you want to use Edge Functions instead of direct database calls:

1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Deploy functions: `supabase functions deploy`

Note: The current implementation uses direct database calls, so Edge Functions are optional.

## Step 6: Enable Realtime

1. In Supabase dashboard, go to Database > Replication
2. Enable replication for these tables:
   - `rooms`
   - `players`
   - `teams`
   - `game_state`
   - `pop_quiz_answers`
   - `secret_phrase_guesses`
   - `sync_answers`
   - `group_pulse_responses`

## Step 7: Test the Setup

1. Start the dev server: `npm run dev`
2. Try hosting a game
3. Try joining a game from another browser/device
4. Verify that players appear in real-time

## API Keys Location

Your Supabase credentials are stored in:
- `.env` file (for local development)
- Environment variables (for production)

**IMPORTANT**: Never commit your `.env` file to version control. The `.env.example` file shows the required variables without actual values.

## Troubleshooting

### "Room not found" errors
- Verify your Supabase URL and anon key are correct
- Check that the database schema was created successfully

### Real-time updates not working
- Ensure Realtime is enabled for the tables
- Check browser console for connection errors
- Verify your Supabase project has Realtime enabled

### Players not appearing
- Check that RLS policies allow read/write operations
- Verify the `players` table has replication enabled
- Check browser console for errors

## Production Deployment

For production:
1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Ensure your Supabase project is in production mode
3. Update CORS settings if needed
4. Consider using Row Level Security (RLS) policies for better security

## Future AI Integration

The codebase is structured to easily add AI-generated content:

1. **Content Generation Hook**: The `selectContentPack` function in `src/lib/contentPacks.js` can be extended to call an AI API
2. **Topic Processing**: The `topicInput` in `App.jsx` is already captured and can be sent to an AI service
3. **Dynamic Questions**: Game components receive `contentPack` which can be AI-generated
4. **Supabase Functions**: Edge Functions can be extended to call AI APIs (OpenAI, Anthropic, etc.)

Example integration point:
```javascript
// In App.jsx handleGenerateEvent
const pack = await generateAIContent(topicInput); // Replace selectContentPack
```

