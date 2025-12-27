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
    const { roomCode, username } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find room
    const { data: room, error: roomError } = await supabaseClient
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

    // Check if username already exists in room
    const { data: existingPlayer } = await supabaseClient
      .from('players')
      .select('id')
      .eq('room_id', room.id)
      .eq('username', username)
      .single();

    let player;
    if (existingPlayer) {
      // Update existing player
      const { data: updatedPlayer, error: updateError } = await supabaseClient
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
      const { data: newPlayer, error: playerError } = await supabaseClient
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

    return new Response(
      JSON.stringify({ room, player }),
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

