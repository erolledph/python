'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, CreditCard, Zap, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface BrevoAccount {
  email: string;
  firstName: string;
  lastName: string;
  companyName: string;
}

interface BrevoPlan {
  planName: string;
  planType: string;
  credits: number;
  usedCredits: number;
}

export default function Settings() {
  const [account, setAccount] = useState<BrevoAccount | null>(null);
  const [plan, setPlan] = useState<BrevoPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingBrevo, setTestingBrevo] = useState(false);

  useEffect(() => {
    fetchBrevoData();
  }, []);

  const testBrevoConnection = async () => {
    try {
      setTestingBrevo(true);
      const response = await fetch('/api/brevo/test');
      const data = await response.json();

      if (data.success) {
        toast.success('Brevo connection successful! Emails should work.');
      } else {
        toast.error(`Brevo issue: ${data.error}`);
        if (data.details) {
          console.error('Brevo test details:', data.details);
        }
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Failed to test Brevo connection');
    } finally {
      setTestingBrevo(false);
    }
  };

  const fetchBrevoData = async () => {
    try {
      setLoading(true);
      // Fetch account info
      const accountRes = await fetch('/api/brevo/account');
      if (accountRes.ok) {
        const accountData = await accountRes.json();
        setAccount(accountData);
      }

      // Fetch plan info
      const planRes = await fetch('/api/brevo/plan');
      if (planRes.ok) {
        const planData = await planRes.json();
        setPlan(planData);
      }
    } catch (error) {
      console.error('Failed to fetch Brevo data:', error);
      toast.error('Failed to load Brevo account information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-400">Loading Brevo account information...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-3">Settings</h1>
        <p className="text-gray-400 text-lg">Manage your Brevo account and preferences</p>
      </div>

      {/* Account Information */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Brevo Account Details</h2>
        </div>

        {account ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm font-medium">Email</label>
                <p className="text-white font-medium">{account.email}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium">First Name</label>
                <p className="text-white font-medium">{account.firstName || 'Not set'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm font-medium">Last Name</label>
                <p className="text-white font-medium">{account.lastName || 'Not set'}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm font-medium">Company</label>
                <p className="text-white font-medium">{account.companyName || 'Not set'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <User className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Unable to load account information</p>
            <button
              onClick={fetchBrevoData}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Plan Information */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Current Plan & Credits</h2>
        </div>

        {plan ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-white font-semibold text-lg">{plan.planName}</h3>
                <p className="text-gray-400 text-sm">{plan.planType}</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold text-lg">{plan.credits.toLocaleString()}</h3>
                <p className="text-gray-400 text-sm">Total Credits</p>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold text-lg">{(plan.credits - plan.usedCredits).toLocaleString()}</h3>
                <p className="text-gray-400 text-sm">Remaining Credits</p>
              </div>
            </div>

            {/* Usage Progress */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Credits Used</span>
                <span className="text-white text-sm">{plan.usedCredits.toLocaleString()} / {plan.credits.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((plan.usedCredits / plan.credits) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                {Math.round((plan.usedCredits / plan.credits) * 100)}% of your monthly credits used
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Unable to load plan information</p>
            <button
              onClick={fetchBrevoData}
              className="mt-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Brevo Connection Test */}
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-blue-400 font-medium">Test Email Sending</h3>
              <p className="text-gray-400 text-sm">Check if your Brevo setup can send emails</p>
            </div>
            <button
              onClick={testBrevoConnection}
              disabled={testingBrevo}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {testingBrevo ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Test Connection
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Template Guide */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Email Template Guide</h2>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-800/50 rounded-lg p-4">
            <h3 className="text-blue-400 font-semibold mb-2">📧 Canva Templates for Email</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p><strong>❌ Don&apos;t use:</strong> Embed links (contain iframes that email clients strip)</p>
              <p><strong>✅ Do use:</strong> Download → HTML option for email-compatible templates</p>
              <p><strong>Steps:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>Open your Canva design</li>
                <li>Click "Share" → "Download"</li>
                <li>Select "HTML" format</li>
                <li>Copy the downloaded HTML code</li>
                <li>Paste directly into the email editor</li>
              </ol>
            </div>
          </div>

          <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4">
            <h3 className="text-green-400 font-semibold mb-2">🎨 Template Loading Options</h3>
            <div className="text-gray-300 text-sm space-y-2">
              <p><strong>Template URL Field:</strong> For web templates (iframes may not work in all email clients)</p>
              <p><strong>Direct HTML:</strong> Best for email - paste HTML code directly into the editor</p>
              <p><strong>HTML Toolbar:</strong> Use the formatting buttons to build emails from scratch</p>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Email Client Limitations</h3>
            <div className="text-gray-300 text-sm">
              <p>Email clients support only basic HTML/CSS:</p>
              <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                <li>No iframes, JavaScript, or complex CSS</li>
                <li>Limited media queries and positioning</li>
                <li>Images may be blocked by default</li>
                <li>Always test with multiple email clients</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* API Key Management */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
            <SettingsIcon className="w-4 h-4 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">API Configuration</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400 text-sm font-medium mb-2 block">Brevo API Key</label>
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="Enter your Brevo API key"
                className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                defaultValue="xkeysib-..." // This would be loaded from environment/config
              />
              <button className="px-6 py-3 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 transition-colors font-medium">
                Update Key
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Your API key is stored securely and used to connect to Brevo services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}