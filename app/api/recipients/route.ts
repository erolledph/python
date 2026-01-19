import { NextResponse } from 'next/server';

const STORAGE_URL = process.env.JSONSTORAGE_URL || 'https://api.jsonstorage.net/v1/json/a56507df-897d-405e-b72c-a963c2b2e2e0/0705f6de-5e78-41c9-9295-ea8c11441097';

export async function GET() {
  try {
    const response = await fetch(STORAGE_URL, { cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
    }

    const text = await response.text();
    let recipients = [];
    
    if (text.trim()) {
      try {
        const data = JSON.parse(text);
        recipients = Array.isArray(data) ? data : [];
      } catch (e) {
        recipients = [];
      }
    }

    return NextResponse.json({ recipients }, { status: 200 });

  } catch (error) {
    console.error('Fetch recipients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
