import { NextRequest, NextResponse } from 'next/server';

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
      throw new Error(`Brevo API error: ${accountResponse.status}`);
    }

    const accountData = await accountResponse.json();

    // Get email campaign statistics for credits usage
    const statsResponse = await fetch('https://api.brevo.com/v3/emailCampaigns', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
      },
    });

    let usedCredits = 0;
    if (statsResponse.ok) {
      const campaignsData = await statsResponse.json();
      // Estimate used credits based on campaigns (this is approximate)
      usedCredits = campaignsData.campaigns?.length * 100 || 0;
    }

    // Extract plan information
    const plan = {
      planName: accountData.plan?.name || 'Free Plan',
      planType: accountData.plan?.type || 'free',
      credits: accountData.plan?.credits || 300, // Default free plan credits
      usedCredits: usedCredits,
    };

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error fetching Brevo plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan information' },
      { status: 500 }
    );
  }
}