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

    // Get account information from Brevo
    const response = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Brevo account API error:', response.status, errorData);
      throw new Error(`Brevo API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Extract relevant account information
    const account = {
      email: data.email,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      companyName: data.companyName || '',
    };

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching Brevo account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch account information', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}