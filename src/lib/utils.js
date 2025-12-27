export function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function normalizeUsername(name) {
  return (name || '').trim();
}

export function normalizeName(name) {
  return (name || '').toString().trim().toLowerCase();
}

export function getTeamColor(teamName) {
  const colors = {
    'Team 1': 'blue',
    'Team 2': 'red',
    'Team 3': 'green',
    'Team 4': 'yellow',
  };
  return colors[teamName] || 'gray';
}

export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function splitIntoTeams(players, numTeams = 2) {
  const shuffled = shuffleArray(players);
  const teams = {};

  for (let i = 0; i < numTeams; i++) {
    teams[`Team ${i + 1}`] = [];
  }

  shuffled.forEach((player, index) => {
    const teamNumber = (index % numTeams) + 1;
    teams[`Team ${teamNumber}`].push(player);
  });

  return teams;
}

export function selectRandomTeamMember(team) {
  if (!team || team.length === 0) return null;
  return team[Math.floor(Math.random() * team.length)];
}
