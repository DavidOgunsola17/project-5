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
    const { roomId, gameMode, roundNumber } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let scores = {};

    if (gameMode === 'pop-quiz') {
      // Calculate Pop Quiz Rally scores
      const { data: answers, error: answersError } = await supabaseClient
        .from('pop_quiz_answers')
        .select('team_id, is_correct')
        .eq('room_id', roomId)
        .eq('round_number', roundNumber);

      if (answersError) throw answersError;

      // Count correct answers per team
      const teamScores = {};
      answers?.forEach((answer) => {
        if (answer.is_correct) {
          teamScores[answer.team_id] = (teamScores[answer.team_id] || 0) + 1;
        }
      });

      // Update team scores
      for (const [teamId, points] of Object.entries(teamScores)) {
        await supabaseClient.rpc('increment_team_score', {
          team_id: teamId,
          points: points,
        });
      }

      scores = teamScores;
    } else if (gameMode === 'secret-phrase') {
      // Secret Phrase scoring is handled when phrase is guessed correctly
      // This function can be called to check if a guess was correct
      const { data: correctGuess, error: guessError } = await supabaseClient
        .from('secret_phrase_guesses')
        .select('team_id')
        .eq('room_id', roomId)
        .eq('round_number', roundNumber)
        .eq('is_correct', true)
        .single();

      if (!guessError && correctGuess) {
        await supabaseClient.rpc('increment_team_score', {
          team_id: correctGuess.team_id,
          points: 1,
        });
        scores[correctGuess.team_id] = 1;
      }
    } else if (gameMode === 'sync') {
      // Calculate Sync game alignment scores
      const { data: answers, error: answersError } = await supabaseClient
        .from('sync_answers')
        .select('team_id, selected_answer')
        .eq('room_id', roomId)
        .eq('round_number', roundNumber);

      if (answersError) throw answersError;

      // Group answers by team
      const teamAnswers = {};
      answers?.forEach((answer) => {
        if (!teamAnswers[answer.team_id]) {
          teamAnswers[answer.team_id] = [];
        }
        teamAnswers[answer.team_id].push(answer.selected_answer);
      });

      // Calculate alignment for each team
      for (const [teamId, teamAnswerList] of Object.entries(teamAnswers)) {
        const answerCounts = [0, 0, 0, 0];
        teamAnswerList.forEach((ans) => {
          if (ans >= 0 && ans < 4) answerCounts[ans]++;
        });

        const majorityCount = Math.max(...answerCounts);
        const alignmentScore = Math.floor((majorityCount / teamAnswerList.length) * 100);
        const pointsEarned = alignmentScore >= 50 ? 1 : 0;

        if (pointsEarned > 0) {
          await supabaseClient.rpc('increment_team_score', {
            team_id: teamId,
            points: pointsEarned,
          });
        }

        scores[teamId] = {
          alignmentScore,
          pointsEarned,
          answerCounts,
        };
      }
    }

    return new Response(
      JSON.stringify({ scores }),
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

