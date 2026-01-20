import { NextResponse } from 'next/server';
import { getCampaignState } from '../shared/campaignState';

export async function GET() {
  return NextResponse.json(getCampaignState());
}
