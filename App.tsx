
import React, { useState } from 'react';
import { BubbleGame } from './components/BubbleGame';
import { RewardScreen } from './components/RewardScreen';
import { StartScreen } from './components/StartScreen';
import { Difficulty } from './types';
import { scoreService } from './services/scores';

const App: React.FC = () => {
  const [view, setView] = useState<'start' | 'playing' | 'reward'>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [sessionScore, setSessionScore] = useState(0);
  const [isNewHighScore, setIsNewHighScore] = useState(false);

  const handleStart = (diff: Difficulty) => {
    setDifficulty(diff);
    setSessionScore(0);
    setIsNewHighScore(false);
    setView('playing');
  };

  const handleLevelComplete = (finalScore: number) => {
    const isNew = scoreService.saveScore(difficulty, finalScore);
    setIsNewHighScore(isNew);
    setSessionScore(finalScore);
    setView('reward');
  };

  const handleBackToStart = () => {
    setView('start');
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4">
      {view === 'start' && (
        <StartScreen onStart={handleStart} />
      )}
      
      {view === 'playing' && (
        <BubbleGame 
          difficulty={difficulty} 
          onComplete={handleLevelComplete} 
          onBack={handleBackToStart} 
        />
      )}

      {view === 'reward' && (
        <div className="w-full flex flex-col items-center justify-center pt-8">
          <RewardScreen 
            difficulty={difficulty} 
            score={sessionScore}
            isHighScore={isNewHighScore}
            onPlayAgain={handleBackToStart} 
          />
        </div>
      )}
      
      {/* Decorative background elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-200 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-100 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>
    </div>
  );
};

export default App;
