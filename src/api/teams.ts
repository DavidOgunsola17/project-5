import { getSupabaseClient } from '../lib/supabaseClient';

export interface Team {
  id: string;
  room_id: string;
  original_name: string;
  custom_name: string | null;
  color: string;
  score: number;
  created_at: string;
}

export interface TeamNameSuggestion {
  id: string;
  team_id: string;
  player_id: string;
  suggested_name: string;
  created_at: string;
}

const TEAM_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];

/**
 * Creates teams for a room based on player count and team size
 */
export async function createTeams(
  roomId: string,
  teamCount: number,
  teamSize: number
): Promise<Team[]> {
  try {
    const teams: Team[] = [];

    const supabase = getSupabaseClient();
    if (!supabase) return [];

    for (let i = 0; i < teamCount; i++) {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          room_id: roomId,
          original_name: `Team ${i + 1}`,
          custom_name: null,
          color: TEAM_COLORS[i % TEAM_COLORS.length],
          score: 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team:', error);
        continue;
      }

      if (data) {
        teams.push(data);
      }
    }

    return teams;
  } catch (error) {
    console.error('Error creating teams:', error);
    return [];
  }
}

/**
 * Fetches all teams for a room
 */
export async function fetchTeams(roomId: string): Promise<Team[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('room_id', roomId)
      .order('original_name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
}

/**
 * Updates a team's custom name
 */
export async function updateTeamName(
  teamId: string,
  customName: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('teams')
      .update({ custom_name: customName })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team name:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating team name:', error);
    return false;
  }
}

/**
 * Updates a team's score
 */
export async function updateTeamScore(
  teamId: string,
  score: number
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const { error } = await supabase
      .from('teams')
      .update({ score })
      .eq('id', teamId);

    if (error) {
      console.error('Error updating team score:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error updating team score:', error);
    return false;
  }
}

/**
 * Bulk assigns players to teams
 * assignments: { playerId: teamId } mapping
 */
export async function assignPlayersToTeams(
  roomId: string,
  assignments: Record<string, string | null>
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const updates = Object.entries(assignments).map(([playerId, teamId]) =>
      supabase
        .from('players')
        .update({ team_id: teamId })
        .eq('id', playerId)
        .eq('room_id', roomId)
    );

    const results = await Promise.all(updates);

    const hasErrors = results.some((result) => result.error);
    if (hasErrors) {
      console.error('Error assigning players to teams');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error assigning players to teams:', error);
    return false;
  }
}

/**
 * Saves a team name suggestion from a player
 */
export async function saveTeamNameSuggestion(
  teamId: string,
  playerId: string,
  suggestedName: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return false;
    
    const { error } = await supabase.from('team_names').upsert(
      {
        team_id: teamId,
        player_id: playerId,
        suggested_name: suggestedName,
      },
      {
        onConflict: 'team_id,player_id',
      }
    );

    if (error) {
      console.error('Error saving team name suggestion:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving team name suggestion:', error);
    return false;
  }
}

/**
 * Fetches all name suggestions for a team
 */
export async function fetchTeamNameSuggestions(
  teamId: string
): Promise<TeamNameSuggestion[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];
    
    const { data, error } = await supabase
      .from('team_names')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching team name suggestions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching team name suggestions:', error);
    return [];
  }
}

