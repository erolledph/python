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

    // Get transactional email events to calculate statistics
    const eventsResponse = await fetch(
      `https://api.brevo.com/v3/smtp/statistics/events?${params.toString()}&limit=1000`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    let statistics = {
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
    };

    if (eventsResponse.ok) {
      const eventsData = await eventsResponse.json();
      const events = eventsData.events || [];
      
      // Calculate statistics from events
      const eventCounts = events.reduce((acc: any, event: any) => {
        const eventType = event.event?.toLowerCase() || 'unknown';
        acc[eventType] = (acc[eventType] || 0) + 1;
        return acc;
      }, {});
      
      statistics.totalSent = eventCounts.request || eventCounts.requests || 0;
      statistics.delivered = Math.min(eventCounts.delivered || 0, statistics.totalSent); // Don't exceed total sent
      statistics.bounced = eventCounts.bounced || eventCounts.bounce || eventCounts.hardbounce || 0;
      statistics.blocked = eventCounts.blocked || 0;
      statistics.complaints = eventCounts.spam || eventCounts.complaint || 0;
      statistics.trackableOpens = Math.min(eventCounts.opened || eventCounts.open || eventCounts['first opening'] || 0, statistics.totalSent);
      statistics.uniqueClickers = Math.min(eventCounts.clicked || eventCounts.click || 0, statistics.totalSent);
      
      // Calculate rates
      if (statistics.totalSent > 0) {
        statistics.deliveredRate = parseFloat(((statistics.delivered / statistics.totalSent) * 100).toFixed(2));
        statistics.bounceRate = parseFloat(((statistics.bounced / statistics.totalSent) * 100).toFixed(2));
        statistics.blockedRate = parseFloat(((statistics.blocked / statistics.totalSent) * 100).toFixed(2));
        statistics.trackableOpenRate = parseFloat(((statistics.trackableOpens / statistics.totalSent) * 100).toFixed(2));
        statistics.clickRate = parseFloat(((statistics.uniqueClickers / statistics.totalSent) * 100).toFixed(2));
      }
      
      statistics.estimatedOpens = statistics.trackableOpens;
      statistics.spamComplaints = statistics.complaints;
    } else {
      console.error('Events API failed, using fallback');
      // Fallback to local tracking data
      const todayStats = await fetch('http://localhost:3000/api/brevo/plan').then(res => res.json()).catch(() => ({ usedCredits: 0 }));
      
      statistics.totalSent = todayStats.usedCredits || 0;
      statistics.delivered = Math.round(statistics.totalSent * 0.96); // Assume 96% delivery
      statistics.deliveredRate = statistics.totalSent > 0 ? 96 : 0;
      statistics.trackableOpens = Math.round(statistics.totalSent * 0.44); // Assume 44% open rate
      statistics.trackableOpenRate = statistics.totalSent > 0 ? 44 : 0;
      statistics.estimatedOpens = statistics.trackableOpens;
      statistics.bounced = Math.round(statistics.totalSent * 0.002); // 0.2% bounce
      statistics.bounceRate = statistics.totalSent > 0 ? 0.2 : 0;
      statistics.blocked = Math.round(statistics.totalSent * 0.034); // 3.4% blocked
      statistics.blockedRate = statistics.totalSent > 0 ? 3.4 : 0;
    }

    return NextResponse.json({
      statistics,
      lastUpdated: new Date().toISOString(),
      dateRange: {
        startDate: startDate || 'All time',
        endDate: endDate || 'Now'
      },
      source: eventsResponse.ok ? 'Calculated from events' : 'Estimated from local tracking'
    });

  } catch (error) {
    console.error('Error fetching Brevo transactional statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactional statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
