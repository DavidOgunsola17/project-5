import { motion } from 'framer-motion';

export function PlayerList({ players, title = 'Players' }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">{title}</h3>
      <div className="bg-white rounded-2xl shadow-md p-4 min-h-[100px]">
        {players.length === 0 ? (
          <p className="text-gray-400 text-center py-4">Waiting for players...</p>
        ) : (
          <ul className="space-y-2">
            {players.map((player, index) => (
              <motion.li
                key={player}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {player.charAt(0).toUpperCase()}
                </div>
                <span className="text-gray-800">{player}</span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        {players.length} {players.length === 1 ? 'player' : 'players'}
      </p>
    </div>
  );
}
