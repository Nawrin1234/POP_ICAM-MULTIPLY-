
import React, { useState, useEffect } from 'react';
import { Difficulty } from '../types';
import { scoreService } from '../services/scores';
import { Logo } from './Logo';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [highScores, setHighScores] = useState({ easy: 0, medium: 0, hard: 0 });

  useEffect(() => {
    setHighScores(scoreService.getHighScores());
  }, []);

  return (
    <div className="text-center bg-white/95 backdrop-blur-md p-6 sm:p-10 rounded-3xl shadow-2xl max-w-md w-full transform transition-all hover:shadow-[0_20px_50px_rgba(58,62,145,0.2)] border-t-8 border-[#3a3e91]">
      <div className="mb-6 sm:mb-8 flex flex-col items-center">
        <Logo className="mb-6" />
        <h1 className="text-4xl sm:text-5xl font-game text-[#3a3e91] mb-2 leading-tight drop-shadow-sm">Pop to Make with Addition!</h1>
        <h1 className="text-3xl sm:text-4xl font-game text-[#3a3e91] mb-2 leading-tight drop-shadow-sm">with Multiplication!</h1>
        <p className="text-[#3a3e91] font-bold text-sm sm:text-base px-4 opacity-80">Master mental math and beat your high scores!</p>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        <button 
          onClick={() => onStart('easy')}
          className="group w-full py-3 sm:py-4 px-5 sm:px-6 bg-yellow-400 hover:bg-yellow-500 text-[#3a3e91] rounded-2xl font-game text-lg sm:text-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 flex justify-between items-center"
        >
          <span>Beginner</span>
          <span className="text-[10px] sm:text-xs bg-[#3a3e91]/10 px-2 sm:px-3 py-1 rounded-full uppercase tracking-tighter">Best: {highScores.easy}</span>
        </button>
        <button 
          onClick={() => onStart('medium')}
          className="group w-full py-3 sm:py-4 px-5 sm:px-6 bg-[#3a3e91] hover:bg-[#2a2e71] text-white rounded-2xl font-game text-lg sm:text-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 flex justify-between items-center"
        >
          <span>Explorer</span>
          <span className="text-[10px] sm:text-xs bg-black/10 px-2 sm:px-3 py-1 rounded-full uppercase tracking-tighter">Best: {highScores.medium}</span>
        </button>
        <button 
          onClick={() => onStart('hard')}
          className="group w-full py-3 sm:py-4 px-5 sm:px-6 bg-[#de1f26] hover:bg-[#be1a21] text-white rounded-2xl font-game text-lg sm:text-xl transition-all shadow-md hover:shadow-lg transform active:scale-95 flex justify-between items-center"
        >
          <span>Math Master</span>
          <span className="text-[10px] sm:text-xs bg-black/10 px-2 sm:px-3 py-1 rounded-full uppercase tracking-tighter">Best: {highScores.hard}</span>
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex justify-center gap-4 text-2xl animate-bounce">
          <span>✨</span><span>🏆</span><span>🔢</span>
        </div>
      </div>
    </div>
  );
};
