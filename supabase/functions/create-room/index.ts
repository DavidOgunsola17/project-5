/// <reference lib="deno.ns" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { username, topic, gameMode, teamSize, targetScore } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate unique room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Create room
    const { data: room, error: roomError } = await supabaseClient
      .from('rooms')
      .insert({
        code,
        host_id: crypto.randomUUID(), // In real app, use authenticated user ID
        topic,
        game_mode: gameMode,
        team_size: teamSize || 4,
        target_score: targetScore || 5,
        status: 'waiting',
      })
      .select()
      .single();

    if (roomError) throw roomError;

    // Create host player (host is not a player, but we track them)
    const { data: hostPlayer, error: hostError } = await supabaseClient
      .from('players')
      .insert({
        room_id: room.id,
        username: username || 'Host',
        is_host: true,
      })
      .select()
      .single();

    if (hostError) throw hostError;

    return new Response(
      JSON.stringify({ room, hostPlayer }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});

