'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface EmailEvent {
  event: string;
  email: string;
  date: string;
  subject: string;
  from: string;
  tags?: string[];
  'message-id'?: string;
  ts?: number;
  ts_event?: number;
  template_id?: number;
  'X-Mailin-custom'?: string;
  sending_ip?: string;
  ts_epoch?: number;
  mirror_link?: string;
  contact_id?: number;
  link?: string;
  user_agent?: string;
  device_used?: string;
  reason?: string;
}

interface Statistics {
  totalSent: number;
  delivered: number;
  deliveredRate: number;
  trackableOpens: number;
  trackableOpenRate: number;
  estimatedOpens: number;
  uniqueClickers: number;
  bounced: number;
  bounceRate: number;
  complaints: number;
  blocked: number;
  blockedRate: number;
}

export default function Statistics() {
  const [events, setEvents] = useState<EmailEvent[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const eventsPerPage = 10;

  useEffect(() => {
    fetchStatistics();
    fetchEvents(currentPage);
  }, [currentPage]);

  const fetchStatistics = async () => {
    try {
      // Mock statistics for now - replace with actual API call
      const mockStats: Statistics = {
        totalSent: 398,
        delivered: 381,
        deliveredRate: 95.73,
        trackableOpens: 119,
        trackableOpenRate: 31.23,
        estimatedOpens: 119,
        uniqueClickers: 0,
        bounced: 1,
        bounceRate: 0.25,
        complaints: 0,
        blocked: 15,
        blockedRate: 3.77
      };
      setStatistics(mockStats);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    }
  };

  const fetchEvents = async (page: number) => {
    try {
      setLoading(true);
      // Mock events for now - replace with actual API call to Brevo webhook data
      const mockEvents: EmailEvent[] = [
        {
          event: 'First opening',
          date: '19-01-2026 16:25:17',
          subject: 'asdasd',
          from: 'noreply@jumble.sbs',
          email: 'erolledph@gmail.com',
          tags: []
        },
        {
          event: 'Delivered',
          date: '19-01-2026 16:25:04',
          subject: 'asdasd',
          from: 'noreply@jumble.sbs',
          email: 'erolledph@gmail.com',
          tags: []
        },
        {
          event: 'Sent',
          date: '19-01-2026 16:25:03',
          subject: 'asdasd',
          from: 'noreply@jumble.sbs',
          email: 'erolledph@gmail.com',
          tags: []
        },
        {
          event: 'Unsubscribed',
          date: '19-01-2026 15:51:13',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+123@gmail.com',
          tags: []
        },
        {
          event: 'First opening',
          date: '19-01-2026 15:51:04',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+123@gmail.com',
          tags: []
        },
        {
          event: 'Delivered',
          date: '19-01-2026 15:51:02',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+ced@gmail.com',
          tags: []
        },
        {
          event: 'Sent',
          date: '19-01-2026 15:51:01',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+ced@gmail.com',
          tags: []
        },
        {
          event: 'Delivered',
          date: '19-01-2026 15:51:01',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+123@gmail.com',
          tags: []
        },
        {
          event: 'Sent',
          date: '19-01-2026 15:50:59',
          subject: 'WEB3 LITERACY WITH BLESSED',
          from: 'noreply@jumble.sbs',
          email: 'erolledph+123@gmail.com',
          tags: []
        },
        {
          event: 'Blocked',
          date: '19-01-2026 15:39:26',
          subject: 'facebuuk',
          from: 'recipes@jumble.sbs',
          email: 'erolledph@gmail.com',
          tags: []
        }
      ];

      setEvents(mockEvents);
      setTotalPages(Math.ceil(mockEvents.length / eventsPerPage));
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (event: string) => {
    switch (event.toLowerCase()) {
      case 'sent':
        return 'text-blue-400 bg-blue-900/20';
      case 'delivered':
        return 'text-green-400 bg-green-900/20';
      case 'opened':
      case 'first opening':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'clicked':
        return 'text-purple-400 bg-purple-900/20';
      case 'bounced':
      case 'hard bounce':
        return 'text-red-400 bg-red-900/20';
      case 'blocked':
        return 'text-orange-400 bg-orange-900/20';
      case 'unsubscribed':
        return 'text-gray-400 bg-gray-700/20';
      case 'spam':
      case 'complaint':
        return 'text-pink-400 bg-pink-900/20';
      default:
        return 'text-gray-400 bg-gray-700/20';
    }
  };

  const paginatedEvents = events.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Email Statistics</h1>
        <p className="text-gray-400">Monitor your email campaign performance and delivery metrics</p>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Sent</p>
                <p className="text-2xl font-bold text-white">{statistics.totalSent}</p>
              </div>
              <div className="text-blue-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Delivered</p>
                <p className="text-2xl font-bold text-green-400">{statistics.delivered}</p>
                <p className="text-sm text-gray-400">{statistics.deliveredRate}%</p>
              </div>
              <div className="text-green-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Opens</p>
                <p className="text-2xl font-bold text-yellow-400">{statistics.trackableOpens}</p>
                <p className="text-sm text-gray-400">{statistics.trackableOpenRate}%</p>
              </div>
              <div className="text-yellow-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Blocked</p>
                <p className="text-2xl font-bold text-orange-400">{statistics.blocked}</p>
                <p className="text-sm text-gray-400">{statistics.blockedRate}%</p>
              </div>
              <div className="text-orange-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Recent Events</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">From</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedEvents.map((event, index) => (
                  <tr key={index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventColor(event.event)}`}>
                        {event.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{event.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{event.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{event.from}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{event.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {event.tags && event.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((currentPage - 1) * eventsPerPage) + 1} to {Math.min(currentPage * eventsPerPage, events.length)} of {events.length} events
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
