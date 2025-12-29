import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roomId, teamSize } = await req.json();

    const supabaseClient = createClient(
      // @ts-ignore Deno is available in Supabase Edge Functions runtime
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore Deno is available in Supabase Edge Functions runtime
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all players (excluding host)
    const { data: players, error: playersError } = await supabaseClient
      .from('players')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_host', false)
      .order('created_at', { ascending: true });

    if (playersError) throw playersError;

    if (!players || players.length === 0) {
      throw new Error('No players to assign');
    }

    // Calculate number of teams based on team size
    const numTeams = Math.max(2, Math.ceil(players.length / teamSize));

    // Delete existing teams
    await supabaseClient.from('teams').delete().eq('room_id', roomId);

    // Create teams and assign players
    const teams = [];
    for (let i = 0; i < numTeams; i++) {
      const { data: team, error: teamError } = await supabaseClient
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
        await supabaseClient
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
    await supabaseClient
      .from('rooms')
      .update({ status: 'team-assignment' })
      .eq('id', roomId);

    return new Response(
      JSON.stringify({ teams }),
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

