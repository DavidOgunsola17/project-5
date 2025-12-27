import { TEAM_COLORS } from '../lib/constants';

export function TeamBadge({ teamName, players = [], score, className = '' }) {
  const colors = TEAM_COLORS[teamName] || {
    bg: 'bg-gray-500',
    text: 'text-gray-500',
    border: 'border-gray-500',
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md p-4 border-l-4 ${colors.border} ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-lg font-bold ${colors.text}`}>{teamName}</h3>
        {score !== undefined && (
          <span className="text-2xl font-bold text-gray-800">{score}</span>
        )}
      </div>
      {players.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {players.map((player) => (
            <span
              key={player}
              className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-700"
            >
              {player}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
