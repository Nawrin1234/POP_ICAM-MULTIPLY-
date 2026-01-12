
import { Difficulty } from '../types';

const STORAGE_KEY = 'pop_to_make_high_scores';

interface HighScores {
  easy: number;
  medium: number;
  hard: number;
}

export const scoreService = {
  getHighScores(): HighScores {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { easy: 0, medium: 0, hard: 0 };
    try {
      return JSON.parse(data);
    } catch {
      return { easy: 0, medium: 0, hard: 0 };
    }
  },

  saveScore(difficulty: Difficulty, score: number): boolean {
    const scores = this.getHighScores();
    if (score > scores[difficulty]) {
      scores[difficulty] = score;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
      return true; // New high score
    }
    return false;
  }
};
