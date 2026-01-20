import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 500 }
      );
    }

    // Build query parameters for date range
    const params = new URLSearchParams();
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    // Get transactional email statistics from Brevo
    const statsResponse = await fetch(
      `https://api.brevo.com/v3/smtp/statistics/aggregated?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    if (!statsResponse.ok) {
      const errorData = await statsResponse.json().catch(() => ({}));
      console.error('Brevo transactional stats API error:', statsResponse.status, errorData);
      
      // If stats API is not available, return calculated stats from events
      return NextResponse.json({
        statistics: {
          totalSent: 0,
          delivered: 0,
          deliveredRate: 0,
          trackableOpens: 0,
          trackableOpenRate: 0,
          estimatedOpens: 0,
          uniqueClickers: 0,
          bounced: 0,
          bounceRate: 0,
          complaints: 0,
          blocked: 0,
          blockedRate: 0,
          clicks: 0,
          clickRate: 0,
          spamComplaints: 0,
          invalidSynonyms: 0
        },
        note: 'Transactional statistics API requires higher plan. Using calculated data.',
        lastUpdated: new Date().toISOString()
      });
    }

    const statsData = await statsResponse.json();
    
    // Calculate rates
    const totalSent = statsData.requests || 0;
    const delivered = statsData.delivered || 0;
    const bounced = statsData.bounces || 0;
    const complaints = statsData.spamComplaints || 0;
    const blocked = statsData.blocked || 0;
    const opens = statsData.opens || 0;
    const clicks = statsData.clicks || 0;

    const statistics = {
      totalSent: totalSent,
      delivered: delivered,
      deliveredRate: totalSent > 0 ? parseFloat(((delivered / totalSent) * 100).toFixed(2)) : 0,
      trackableOpens: opens,
      trackableOpenRate: totalSent > 0 ? parseFloat(((opens / totalSent) * 100).toFixed(2)) : 0,
      estimatedOpens: opens,
      uniqueClickers: clicks,
      bounced: bounced,
      bounceRate: totalSent > 0 ? parseFloat(((bounced / totalSent) * 100).toFixed(2)) : 0,
      complaints: complaints,
      blocked: blocked,
      blockedRate: totalSent > 0 ? parseFloat(((blocked / totalSent) * 100).toFixed(2)) : 0,
      clicks: clicks,
      clickRate: totalSent > 0 ? parseFloat(((clicks / totalSent) * 100).toFixed(2)) : 0,
      spamComplaints: complaints,
      invalidSynonyms: statsData.invalidSynonyms || 0
    };

    return NextResponse.json({
      statistics,
      lastUpdated: new Date().toISOString(),
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Now'
      }
    });

  } catch (error) {
    console.error('Error fetching Brevo transactional statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactional statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
