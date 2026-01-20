import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Simple email tracking with file persistence
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

function getEmailStats(): EmailStats {
  const stats = loadStats();
  const today = getToday();
  
  // Update today's count
  stats.todaySent = stats.dailyStats[today] || 0;
  
  return stats;
}

function incrementEmailCount(): EmailStats {
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

export { getEmailStats, incrementEmailCount };

export async function GET() {
  try {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 500 }
      );
    }

    // Get account information which includes plan details
    const accountResponse = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
      },
    });

    if (!accountResponse.ok) {
      const errorData = await accountResponse.json().catch(() => ({}));
      console.error('Brevo account API error:', accountResponse.status, errorData);
      throw new Error(`Brevo API error: ${accountResponse.status} - ${errorData.message || 'Unknown error'}`);
    }

    const accountData = await accountResponse.json();

    // Extract plan information from real account data
    const planInfo = accountData.plan?.find((p: any) => p.type === 'free' || p.type === 'sendLimit');
    // Free plan is 300 emails per day, override API value if it's close
    const apiCredits = planInfo?.credits || 0;
    const credits = (apiCredits >= 290 && apiCredits <= 310) ? 300 : apiCredits; // Normalize to 300 for free plan
    
    // Get email statistics from persistent storage
    const emailStats = getEmailStats();
    
    // Get today's email count from tracking
    const todayStats = {
      requests: emailStats.todaySent,
      delivered: emailStats.todaySent, // Assume all delivered for simplicity
      clicks: 0,
      opens: 0
    };

    // Simple plan information with real data
    const plan = {
      planName: planInfo?.name || 'Free Plan',
      planType: planInfo?.type || 'free',
      credits: credits,
      usedCredits: emailStats.totalSent,
      remainingCredits: credits - emailStats.totalSent,
      todayStats: todayStats,
      lastUpdated: emailStats.lastUpdated,
      note: 'Statistics API requires Enterprise plan. Using local tracking.'
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching Brevo plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}