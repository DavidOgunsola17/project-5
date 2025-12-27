export const EVENT_TYPES = {
  JOIN: 'join',
  LEAVE: 'leave',
  TEAMS_ASSIGNED: 'teams_assigned',
  START_GAME: 'start_game',
  END_GAME: 'end_game',

  // Team Trivia
  TEAM_QUESTION: 'team_question',
  TRIVIA_ANSWER: 'trivia_answer',
  TRIVIA_CORRECT: 'trivia_correct',
  TRIVIA_WRONG: 'trivia_wrong',

  // Secret Phrase
  PHRASE_STARTED: 'phrase_started',
  CLUE_SENT: 'clue_sent',
  PHRASE_GUESS: 'phrase_guess',
  PHRASE_SOLVED: 'phrase_solved',

  // Silent Majority
  QUESTION_SENT: 'question_sent',
  ANSWER_SUBMITTED: 'answer_submitted',
  MAJORITY_REVEAL: 'majority_reveal',
  POINTS_AWARDED: 'points_awarded',

  // Round management
  ROUND_START: 'round_start',
  ROUND_END: 'round_end',
  GAME_OVER: 'game_over',
};

export const GAME_MODES = {
  TEAM_TRIVIA: 'team_trivia',
  SECRET_PHRASE: 'secret_phrase',
  SILENT_MAJORITY: 'silent_majority',
};

export const TEAM_COLORS = {
  'Team 1': { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500' },
  'Team 2': { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-500' },
  'Team 3': { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-500' },
  'Team 4': { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-500' },
};

export const VIEWS = {
  LANDING: 'landing',
  HOST: 'host',
  JOIN: 'join',
  SELECT_EVENT: 'select_event',
  LOBBY: 'lobby',
  IN_GAME: 'in_game',
};
