import { NextResponse } from 'next/server';

let campaignState = {
  isRunning: false,
  total: 0,
  sent: 0,
  failed: 0,
  currentEmail: '',
  errors: [] as string[]
};

export async function GET() {
  return NextResponse.json(campaignState);
}
