
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Difficulty, BubbleData } from '../types';
import { audioService } from '../services/audio';
import { scoreService } from '../services/scores';

interface BubbleGameProps {
  difficulty: Difficulty;
  onComplete: (score: number) => void;
  onBack: () => void;
}

const COLORS = ['bg-[#de1f26]', 'bg-[#3a3e91]', 'bg-green-500', 'bg-yellow-400', 'bg-purple-500', 'bg-pink-500'];

const GET_INITIAL_TIME = (diff: Difficulty) => {
  if (diff === 'hard') return 25;
  if (diff === 'medium') return 30;
  return 40;
};

export const BubbleGame: React.FC<BubbleGameProps> = ({ difficulty, onComplete, onBack }) => {
  const [targetSum, setTargetSum] = useState(0);
  const [currentSum, setCurrentSum] = useState(1);
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [poppedBubbles, setPoppedBubbles] = useState<BubbleData[]>([]);
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GET_INITIAL_TIME(difficulty));
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  const requestRef = useRef<number>(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const scores = scoreService.getHighScores();
    setHighScore(scores[difficulty]);
  }, [difficulty]);

  const generateLevel = useCallback(() => {
    // 1. Set factor range based on difficulty
    let maxFactor = 5; // Easy: 2x2 up to 5x5
    if (difficulty === 'medium') maxFactor = 10; // Medium: up to 10x10
    if (difficulty === 'hard') maxFactor = 12;   // Hard: up to 12x12

    // 2. Pick two random factors
    const factor1 = Math.floor(Math.random() * (maxFactor - 1)) + 2;
    const factor2 = Math.floor(Math.random() * (maxFactor - 1)) + 2;
    
    // 3. Calculate the Target (Multiplication)
    const target = factor1 * factor2; 
    
    setTargetSum(target);
    setCurrentSum(0);
    setTimeLeft(GET_INITIAL_TIME(difficulty));

    const newBubbles: BubbleData[] = [];
    
    // 4. Create the array of bubble values starting with the correct factors
    const values = [factor1, factor2]; 

    // 5. Fill the rest with random numbers (distractors)
    for (let i = 0; i < 10; i++) {
      values.push(Math.floor(Math.random() * (maxFactor + 3)) + 1);
    }

    // 6. Create the actual bubble objects
    values.forEach((val) => {
      newBubbles.push({
        id: Math.random().toString(36).substr(2, 9),
        value: val,
        x: Math.random() * 80 + 5,
        y: Math.random() * 70 + 10,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.floor(Math.random() * 20) + 60,
        speed: (Math.random() * 0.1 + 0.05) * (Math.random() > 0.5 ? 1 : -1)
      });
    });

    setBubbles(newBubbles);
    setPoppedBubbles([]);
  }, [difficulty]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      if (isPaused || showQuitConfirm || isCelebrating) return;

      setTimeLeft((prev) => {
        if (prev <= 1) {
          audioService.playError();
          setProgress((p) => Math.max(0, p - 10));
          setScore(s => Math.max(0, s - 10));
          generateLevel();
          return GET_INITIAL_TIME(difficulty);
        }
        
        if (prev - 1 < 5) {
          audioService.playTick();
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [generateLevel, difficulty, isPaused, showQuitConfirm, isCelebrating]);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const animate = useCallback(() => {
    if (!isPaused && !showQuitConfirm && !isCelebrating) {
      setBubbles(prev => prev.map(b => {
        let nextX = b.x + b.speed;
        let nextY = b.y + Math.sin(Date.now() / 1000 + parseFloat(b.id)) * 0.05;
        if (nextX > 90 || nextX < 5) b.speed *= -1;
        return { ...b, x: nextX, y: nextY };
      }));
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [isPaused, showQuitConfirm, isCelebrating]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [animate]);

  const handleBubbleClick = (bubble: BubbleData) => {
    if (isPaused || showQuitConfirm || isCelebrating) return;
    
    const poppedOne = { ...bubble };
    setPoppedBubbles(prev => [...prev, poppedOne]);
    
    setTimeout(() => {
      setPoppedBubbles(prev => prev.filter(b => b.id !== poppedOne.id));
    }, 300);

    const nextSum = currentSum === 0 ? bubble.value : currentSum * bubble.value;
    audioService.playPop();

    if (nextSum === targetSum) {
      const timeBonus = timeLeft * 5;
      const roundScore = 50 + timeBonus;
      const newScore = score + roundScore;
      setScore(newScore);
      
      const nextProgress = progress + 20;
      if (nextProgress >= 100) {
        setProgress(100);
        setIsCelebrating(true);
        audioService.playLevelComplete();
        setTimeout(() => {
          onComplete(newScore);
        }, 2000);
      } else {
        audioService.playCorrectSum();
        setProgress(nextProgress);
        generateLevel();
      }
    } else if (targetSum % nextSum !== 0) { 
      audioService.playError();
      setScore(s => Math.max(0, s - 10));
      setCurrentSum(0);
    } else {
      setCurrentSum(nextSum);
    }

    setBubbles(prev => prev.filter(b => b.id !== bubble.id));
  };

  const togglePause = () => {
    if (showQuitConfirm || isCelebrating) return;
    audioService.playPop();
    setIsPaused(!isPaused);
  };

  const handleRequestQuit = () => {
    if (isCelebrating) return;
    audioService.playPop();
    setShowQuitConfirm(true);
  };

  const timePercent = (timeLeft / GET_INITIAL_TIME(difficulty)) * 100;
  const timeBarColor = timeLeft < 5 ? 'bg-[#de1f26]' : timeLeft < 10 ? 'bg-yellow-400' : 'bg-[#3a3e91]';

  return (
    <div className="w-full h-full max-w-4xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden relative border-4 border-white flex flex-col">
      
      {/* Overlays */}
      {isCelebrating && (
        <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-white/40 backdrop-blur-md animate-in fade-in duration-500 overflow-hidden text-center">
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute text-4xl animate-bounce"
                style={{ 
                  left: `${Math.random() * 100}%`, 
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              >
                {['✨', '⭐', '🌈', '🎉', '🎈'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
          <div className="relative transform transition-all animate-bounce px-4">
            <h2 className="text-5xl sm:text-7xl font-game text-transparent bg-clip-text bg-gradient-to-r from-[#de1f26] via-[#3a3e91] to-purple-500 drop-shadow-lg leading-tight">
              WELL DONE!
            </h2>
          </div>
          <div className="mt-8 bg-white/90 px-6 sm:px-8 py-3 rounded-full shadow-2xl border-4 border-yellow-400 transform scale-110 sm:scale-125">
            <span className="text-xl sm:text-2xl font-game text-[#3a3e91]">GREAT MATH SKILLS!</span>
          </div>
        </div>
      )}

      {showQuitConfirm && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-200 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center max-w-sm w-full transform transition-all scale-in border-4 border-[#de1f26]">
            <div className="text-5xl mb-4">😮</div>
            <h2 className="text-2xl sm:text-3xl font-game text-gray-800 mb-2">Wait!</h2>
            <p className="text-gray-600 font-bold mb-8">Are you sure you want to quit? Your progress will be lost!</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={onBack}
                className="w-full py-3 sm:py-4 bg-[#de1f26] hover:bg-[#be1a21] text-white rounded-2xl font-game text-lg sm:text-xl shadow-lg transition-transform active:scale-95"
              >
                YES, QUIT
              </button>
              <button 
                onClick={() => setShowQuitConfirm(false)}
                className="w-full py-3 sm:py-4 bg-[#3a3e91] hover:bg-[#2a2e71] text-white rounded-2xl font-game text-lg sm:text-xl shadow-lg transition-transform active:scale-95"
              >
                KEEP PLAYING!
              </button>
            </div>
          </div>
        </div>
      )}

      {isPaused && !showQuitConfirm && !isCelebrating && (
        <div className="absolute inset-0 z-50 bg-[#3a3e91]/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 p-4">
          <div className="bg-white p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl text-center max-w-xs w-full scale-in transform transition-all">
            <h2 className="text-3xl sm:text-4xl font-game text-[#3a3e91] mb-6">Paused</h2>
            <div className="space-y-4">
              <button 
                onClick={togglePause}
                className="w-full py-3 sm:py-4 px-8 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-game text-xl sm:text-2xl shadow-lg transition-transform active:scale-95"
              >
                RESUME
              </button>
              <button 
                onClick={handleRequestQuit}
                className="w-full py-3 px-8 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-game text-base sm:text-lg transition-transform active:scale-95"
              >
                QUIT GAME
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header UI */}
      <div className="p-3 sm:p-6 flex justify-between items-center bg-white/80 border-b-2 border-[#3a3e91]/10 relative">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex flex-col">
            <button onClick={handleRequestQuit} className="text-[#3a3e91] font-game hover:underline text-left text-[10px] sm:text-xs">← EXIT</button>
            <div className="font-game text-lg sm:text-xl text-[#3a3e91] leading-tight whitespace-nowrap">Score: {score}</div>
            <div className="font-game text-[10px] sm:text-sm text-[#de1f26] opacity-90 uppercase tracking-tight whitespace-nowrap">Best: {Math.max(highScore, score)}</div>
          </div>
          <button 
            onClick={togglePause}
            className="p-2 sm:p-3 bg-[#3a3e91]/10 hover:bg-[#3a3e91]/20 text-[#3a3e91] rounded-xl sm:rounded-2xl transition-all active:scale-90 shrink-0"
            title="Pause Game"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 9v6m4-6v6" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center flex-1 mx-2">
          <span className="text-gray-400 text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">TARGET PRODUCT</span>
          <span className="text-4xl sm:text-6xl font-game text-[#de1f26] drop-shadow-sm leading-none">{targetSum}</span>
        </div>

        <div className="text-right flex flex-col items-end">
          <div className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-tight">PROGRESS</div>
          <div className={`w-16 sm:w-32 h-2 sm:h-4 bg-gray-200 rounded-full mt-1 overflow-hidden transition-all duration-300 ${progress === 100 ? 'ring-2 sm:ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : ''}`}>
            <div 
              className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 animate-pulse' : 'bg-gradient-to-r from-[#3a3e91] to-purple-500'}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Countdown Timer Bar */}
      <div className="w-full h-1.5 sm:h-2 bg-gray-100">
        <div 
          className={`h-full transition-all duration-1000 ease-linear ${timeBarColor}`}
          style={{ width: `${timePercent}%` }}
        ></div>
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 min-h-[300px] w-full bg-[#3a3e91]/5 overflow-hidden">
        <div className={`absolute top-2 left-3 sm:top-4 sm:left-4 font-game text-lg sm:text-2xl z-10 transition-colors ${timeLeft < 5 ? 'text-[#de1f26] animate-bounce' : 'text-[#3a3e91]/30'}`}>
          ⏱ {timeLeft}s
        </div>

        {/* Bubbles */}
        {poppedBubbles.map((bubble) => (
          <div
            key={`popped-${bubble.id}`}
            style={{ 
              left: `${bubble.x}%`, 
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`
            }}
            className={`absolute rounded-full flex items-center justify-center text-white font-game text-xl sm:text-2xl shadow-lg border-2 border-white/50 pop-animation pointer-events-none ${bubble.color}`}
          >
            {bubble.value}
          </div>
        ))}

        {bubbles.map((bubble) => (
          <button
            key={bubble.id}
            onClick={() => handleBubbleClick(bubble)}
            disabled={isPaused || showQuitConfirm || isCelebrating}
            style={{ 
              left: `${bubble.x}%`, 
              top: `${bubble.y}%`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`
            }}
            className={`absolute rounded-full flex items-center justify-center text-white font-game text-xl sm:text-2xl shadow-lg border-2 border-white/50 transition-transform active:scale-125 hover:brightness-110 ${bubble.color} ${(isPaused || showQuitConfirm || isCelebrating) ? 'opacity-50 grayscale' : ''}`}
          >
            {bubble.value}
          </button>
        ))}

        {/* Sum Indicator */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex items-center space-x-2 sm:space-x-4 bg-white/95 px-5 sm:px-8 py-3 sm:py-4 rounded-full shadow-2xl border-2 border-[#3a3e91]/20 z-20 whitespace-nowrap">
          <span className="text-gray-400 font-game text-xs sm:text-base">PRODUCT:</span>
          <span className={`text-2xl sm:text-4xl font-game ${currentSum > targetSum ? 'text-[#de1f26]' : 'text-[#3a3e91]'}`}>
            {currentSum}
          </span>
          {currentSum > 0 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (!isPaused && !showQuitConfirm && !isCelebrating) {
                  audioService.playPop();
                  setCurrentSum(0);
                }
              }}
              className="ml-2 text-[10px] bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md text-gray-500 font-bold uppercase"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className={`px-4 py-3 sm:py-4 text-white text-center font-bold text-xs sm:text-sm transition-colors shrink-0 ${isCelebrating ? 'bg-purple-600' : 'bg-[#3a3e91]'}`}>
        {isCelebrating ? "YOU DID IT!" : showQuitConfirm ? "Waiting..." : isPaused ? "Paused" : "Pop bubbles to reach the Target!"}
      </div>
    </div>
  );
};
