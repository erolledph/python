import { NextRequest, NextResponse } from 'next/server';

const STORAGE_URL = process.env.JSONSTORAGE_URL || 'https://api.jsonstorage.net/v1/json/a56507df-897d-405e-b72c-a963c2b2e2e0/0705f6de-5e78-41c9-9295-ea8c11441097';
const API_KEY = process.env.JSONSTORAGE_API_KEY || '8f378d79-e52c-48d0-a13e-0090ac77b8a8';

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'sent' | 'failed';
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const getResponse = await fetch(STORAGE_URL);
    if (!getResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch current data' }, { status: 500 });
    }

    const text = await getResponse.text();
    let recipients: Recipient[] = [];
    
    if (text.trim()) {
      try {
        const currentData = JSON.parse(text);
        recipients = Array.isArray(currentData) ? currentData : [];
      } catch (e) {
        recipients = [];
      }
    }

    const existingRecipient = recipients.find(r => r.email === email);
    if (existingRecipient) {
      return NextResponse.json({ message: 'Email already subscribed', email }, { status: 200 });
    }

    const newRecipient: Recipient = {
      id: `subscribe-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      status: 'pending'
    };

    const updatedRecipients = [...recipients, newRecipient];

    const putResponse = await fetch(`${STORAGE_URL}?apiKey=${API_KEY}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecipients)
    });

    if (!putResponse.ok) {
      return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Successfully subscribed', 
      email,
      recipient: newRecipient 
    }, { status: 200 });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
