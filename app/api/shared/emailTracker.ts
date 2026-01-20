// Simple email tracking with file persistence
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TRACKER_FILE = join(process.cwd(), 'email-count.json');

interface EmailStats {
  totalSent: number;
  todaySent: number;
  lastUpdated: string;
  dailyStats: { [date: string]: number };
}

function getDefaultStats(): EmailStats {
  return {
    totalSent: 0,
    todaySent: 0,
    lastUpdated: new Date().toISOString(),
    dailyStats: {}
  };
}

function loadStats(): EmailStats {
  try {
    if (existsSync(TRACKER_FILE)) {
      const data = readFileSync(TRACKER_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading email stats:', error);
  }
  return getDefaultStats();
}

function saveStats(stats: EmailStats): void {
  try {
    writeFileSync(TRACKER_FILE, JSON.stringify(stats, null, 2));
  } catch (error) {
    console.error('Error saving email stats:', error);
  }
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function incrementEmailCount(): EmailStats {
  const stats = loadStats();
  const today = getToday();
  
  // Reset daily count if it's a new day
  if (!stats.dailyStats[today]) {
    stats.dailyStats[today] = 0;
  }
  
  // Increment counters
  stats.totalSent++;
  stats.dailyStats[today]++;
  stats.todaySent = stats.dailyStats[today];
  stats.lastUpdated = new Date().toISOString();
  
  saveStats(stats);
  return stats;
}

export function getEmailStats(): EmailStats {
  const stats = loadStats();
  const today = getToday();
  
  // Update today's count
  stats.todaySent = stats.dailyStats[today] || 0;
  
  return stats;
}

export function resetStats(): void {
  try {
    if (existsSync(TRACKER_FILE)) {
      // Keep the file but reset the stats
      const stats = getDefaultStats();
      saveStats(stats);
    }
  } catch (error) {
    console.error('Error resetting email stats:', error);
  }
}
