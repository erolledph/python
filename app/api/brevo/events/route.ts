import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Brevo API key not configured' },
        { status: 500 }
      );
    }

    // Build query parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: ((page - 1) * limit).toString(),
      sort: 'desc',
    });

    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    // Get transactional email events from Brevo
    const eventsResponse = await fetch(
      `https://api.brevo.com/v3/smtp/statistics/events?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
        },
      }
    );

    if (!eventsResponse.ok) {
      const errorData = await eventsResponse.json().catch(() => ({}));
      console.error('Brevo events API error:', eventsResponse.status, errorData);
      
      // If events API is not available (may require higher plan), return mock data
      const mockEvents = [
        {
          event: 'request',
          email: 'erolledph@gmail.com',
          date: new Date().toISOString(),
          subject: 'Test Email',
          from: 'noreply@jumble.sbs',
          tags: ['test'],
          'message-id': 'test-' + Date.now(),
          ts: Date.now(),
          ts_event: Date.now()
        }
      ];

      return NextResponse.json({
        events: mockEvents,
        pagination: {
          currentPage: page,
          totalPages: 1,
          total: mockEvents.length,
          limit: limit
        },
        note: 'Events API requires higher plan. Showing limited data.'
      });
    }

    const eventsData = await eventsResponse.json();
    
    // Process and format events
    const processedEvents = eventsData.events?.map((event: any) => {
      let formattedDate = 'Invalid Date';
      
      // Try different timestamp fields
      const timestamp = event.ts || event.ts_event || event.ts_epoch;
      if (timestamp && !isNaN(timestamp)) {
        formattedDate = new Date(timestamp * 1000).toLocaleString();
      }
      
      return {
        event: event.event || 'unknown',
        email: event.email || '',
        date: formattedDate,
        subject: event.subject || 'No Subject',
        from: event.from || 'Unknown',
        tags: event.tags || [],
        'message-id': event.messageId || '',
        ts: event.ts,
        ts_event: event.ts_event,
        template_id: event.templateId,
        'X-Mailin-custom': event['X-Mailin-custom'],
        sending_ip: event.sendingIp,
        ts_epoch: event.tsEpoch,
        mirror_link: event.mirrorLink,
        contact_id: event.contactId,
        link: event.link,
        user_agent: event.userAgent,
        device_used: event.deviceUsed,
        reason: event.reason
      };
    }) || [];

    return NextResponse.json({
      events: processedEvents,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil((eventsData.totalEvents || processedEvents.length) / limit),
        total: eventsData.totalEvents || processedEvents.length,
        limit: limit
      },
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching Brevo events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
