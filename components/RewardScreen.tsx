
import React from 'react';

interface RewardScreenProps {
  difficulty: string;
  score: number;
  isHighScore: boolean;
  onPlayAgain: () => void;
}

export const RewardScreen: React.FC<RewardScreenProps> = ({ score, isHighScore, onPlayAgain }) => {
  return (
    <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center border-t-8 border-[#3a3e91]">
      <div className="mb-8">
        <h2 className="text-4xl sm:text-5xl font-game text-[#de1f26] mb-4">Level Complete!</h2>
        <div className="text-6xl mb-6">🏆</div>
        <div className="space-y-2">
          <div className="text-gray-400 text-sm font-bold uppercase tracking-widest">Final Score</div>
          <div className="text-5xl sm:text-6xl font-game text-[#3a3e91]">{score}</div>
          {isHighScore && (
            <div className="inline-block mt-4 bg-yellow-400 text-yellow-900 text-sm font-bold px-6 py-2 rounded-full animate-bounce shadow-md">
              NEW PERSONAL BEST! 🌟
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 mb-8">
        <p className="text-[#3a3e91] font-bold">You are a Math Master! Every bubble popped made your brain even stronger! 💪</p>
      </div>

      <button
        onClick={onPlayAgain}
        className="w-full py-4 sm:py-5 bg-gradient-to-r from-[#3a3e91] to-[#de1f26] hover:brightness-110 text-white rounded-2xl font-game text-xl sm:text-2xl shadow-xl transform transition-all active:scale-95 flex items-center justify-center gap-3"
      >
        <span>PLAY AGAIN!</span>
        <span className="text-2xl">🚀</span>
      </button>

      <p className="mt-6 text-xs text-gray-400 font-bold uppercase tracking-tighter">Try another difficulty level to challenge yourself!</p>
    </div>
  );
};
