'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface Subscriber {
  id?: string;
  email: string;
  name?: string;
  subscribedAt?: string;
  status?: 'active' | 'inactive' | 'unsubscribed';
}

export default function Recipients() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://api.jsonstorage.net/v1/json/a56507df-897d-405e-b72c-a963c2b2e2e0/0705f6de-5e78-41c9-9295-ea8c11441097');

      if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status}`);
      }

      const data = await response.json();

      // Handle different possible data structures
      let subscriberList: Subscriber[] = [];

      if (Array.isArray(data)) {
        subscriberList = data;
      } else if (data.subscribers && Array.isArray(data.subscribers)) {
        subscriberList = data.subscribers;
      } else if (data.data && Array.isArray(data.data)) {
        subscriberList = data.data;
      } else {
        // If it's an object with email properties, convert to array
        subscriberList = Object.values(data).filter((item: any) =>
          typeof item === 'object' && item && item.email
        ) as Subscriber[];
      }

      // Ensure each subscriber has required fields
      const processedSubscribers = subscriberList.map((sub, index) => ({
        id: sub.id || `sub-${index}`,
        email: sub.email,
        name: sub.name || sub.email?.split('@')[0] || 'Unknown',
        subscribedAt: sub.subscribedAt || new Date().toISOString(),
        status: sub.status || 'active'
      }));

      setSubscribers(processedSubscribers);
      toast.success(`Loaded ${processedSubscribers.length} subscribers`);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setError(error instanceof Error ? error.message : 'Failed to load subscribers');
      toast.error('Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'text-green-400 bg-green-900/20';
      case 'inactive':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'unsubscribed':
        return 'text-red-400 bg-red-900/20';
      default:
        return 'text-gray-400 bg-gray-700/20';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipients Management</h1>
          <p className="text-gray-400">Manage your email subscribers</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading subscribers...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipients Management</h1>
          <p className="text-gray-400">Manage your email subscribers</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Failed to Load Subscribers</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchSubscribers}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Recipients Management</h1>
          <p className="text-gray-400">Manage your email subscribers</p>
        </div>
        <button
          onClick={fetchSubscribers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Subscribers</p>
              <p className="text-2xl font-bold text-white">{subscribers.length}</p>
            </div>
            <div className="text-blue-400">
              <Users className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Subscribers</p>
              <p className="text-2xl font-bold text-green-400">
                {subscribers.filter(sub => sub.status === 'active').length}
              </p>
            </div>
            <div className="text-green-400">
              <User className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Recent Signups</p>
              <p className="text-2xl font-bold text-purple-400">
                {subscribers.filter(sub => {
                  const signupDate = new Date(sub.subscribedAt || '');
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return signupDate > weekAgo;
                }).length}
              </p>
            </div>
            <div className="text-purple-400">
              <Calendar className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Subscriber List</h2>
          <p className="text-gray-400 text-sm mt-1">All your email subscribers from JSON storage</p>
        </div>

        {subscribers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Subscribers Found</h3>
            <p className="text-gray-400">No subscribers data found in your JSON storage.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Subscribed At
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {subscribers.map((subscriber, index) => (
                  <tr key={subscriber.id || index} className="hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-400 text-sm font-medium">
                            {(subscriber.name || 'U')[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white font-medium">{subscriber.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                      {subscriber.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscriber.status || 'active')}`}>
                        {subscriber.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatDate(subscriber.subscribedAt || '')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}