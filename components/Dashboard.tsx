'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'sent' | 'failed';
}

interface CampaignStatus {
  isRunning: boolean;
  total: number;
  sent: number;
  failed: number;
  currentEmail: string;
  errors: string[];
}

const defaultHtmlTemplate = `<p>Hi {name},</p>
<p>Thank you for taking the bold step to begin your journey into the world of Web3 and blockchain technology. I'm truly excited to have you onboard.</p>
<p>Warm regards,<br><strong>Blessed</strong></p>`;

export default function Dashboard() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [status, setStatus] = useState<CampaignStatus>({
    isRunning: false,
    total: 0,
    sent: 0,
    failed: 0,
    currentEmail: '',
    errors: []
  });
  const [emailSubject, setEmailSubject] = useState('WEB3 LITERACY WITH BLESSED');
  const [emailContent, setEmailContent] = useState(defaultHtmlTemplate);
  const [showPreview, setShowPreview] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  }, []);

  const fetchRecipients = useCallback(async () => {
    try {
      const res = await fetch('/api/recipients');
      if (res.ok) {
        const data = await res.json();
        setRecipients(data.recipients || []);
      }
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchRecipients();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchRecipients]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').slice(1);
        const newRecipients: Recipient[] = lines
          .filter(line => line.trim())
          .map((line, index) => {
            const [email, name] = line.split(',').map(s => s.trim().replace(/"/g, ''));
            return {
              id: `csv-${Date.now()}-${index}`,
              email: email || '',
              name: name || email?.split('@')[0] || 'Recipient',
              status: 'pending' as const
            };
          })
          .filter(r => r.email.includes('@'));
        setRecipients(prev => [...prev, ...newRecipients]);
        showNotification('success', `Added ${newRecipients.length} contacts`);
      };
      reader.readAsText(selectedFile);
    } else {
      showNotification('error', 'Please select a CSV file');
    }
  };

  const addManualRecipient = () => {
    if (!manualEmail.trim()) {
      showNotification('error', 'Please enter email');
      return;
    }
    if (!manualEmail.includes('@')) {
      showNotification('error', 'Invalid email format');
      return;
    }
    const newRecipient: Recipient = {
      id: `manual-${Date.now()}`,
      name: manualName.trim() || manualEmail.split('@')[0],
      email: manualEmail.trim(),
      status: 'pending'
    };
    setRecipients(prev => [...prev, newRecipient]);
    showNotification('success', 'Contact added');
    setManualName('');
    setManualEmail('');
  };

  const removeRecipient = (id: string) => {
    setRecipients(prev => prev.filter(r => r.id !== id));
  };

  const clearAllRecipients = () => {
    setRecipients([]);
  };

  const handleStartCampaign = async () => {
    if (recipients.length === 0) {
      showNotification('error', 'Please add recipients first');
      return;
    }

    if (!emailContent.trim()) {
      showNotification('error', 'Please compose your email content');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          recipients: recipients,
          subject: emailSubject,
          htmlContent: emailContent,
          senderName: senderName || undefined,
          replyTo: replyToEmail || undefined
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitSuccess(true);
        showNotification('success', 'Campaign started!');
      } else {
        showNotification('error', data.error || 'Failed to start campaign');
      }
    } catch (error) {
      showNotification('error', 'Failed to start campaign');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
  };

  const handleStopCampaign = async () => {
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'stop' })
      });

      if (res.ok) {
        showNotification('success', 'Campaign stopped');
      }
    } catch (error) {
      showNotification('error', 'Failed to stop campaign');
    }
  };

  const progress = status.total > 0 ? Math.round(((status.sent + status.failed) / status.total) * 100) : 0;
  const successRate = status.sent + status.failed > 0 ? Math.round((status.sent / (status.sent + status.failed)) * 100) : 0;

  const previewEmail = () => {
    return emailContent.replace(/{name}/g, '<span style="color: #8b5cf6;">John Doe</span>');
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      padding: '40px 20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>
            Email Campaign
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Add contacts and send personalized emails
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
              Add Contacts ({recipients.length})
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Name (optional)"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualRecipient()}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <input
                type="email"
                placeholder="Email"
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addManualRecipient()}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button
                onClick={addManualRecipient}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px'
                }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                padding: '10px 20px',
                backgroundColor: '#475569',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}>
                Upload CSV
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                onClick={fetchRecipients}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#0891b2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '13px'
                }}
              >
                Fetch from Server
              </button>
              {recipients.length > 0 && (
                <button
                  onClick={clearAllRecipients}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#7f1d1d',
                    color: '#fecaca',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {recipients.length > 0 && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                  Contacts List
                </h2>
                <span style={{ color: '#64748b', fontSize: '13px' }}>{recipients.length} contacts</span>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '200px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #475569' }}>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>Name</th>
                      <th style={{ padding: '8px', textAlign: 'left', color: '#64748b', fontSize: '12px' }}>Email</th>
                      <th style={{ padding: '8px', textAlign: 'right', color: '#64748b', fontSize: '12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipients.map((recipient) => (
                      <tr key={recipient.id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '8px', color: '#e2e8f0', fontSize: '13px' }}>{recipient.name}</td>
                        <td style={{ padding: '8px', color: '#94a3b8', fontSize: '13px' }}>{recipient.email}</td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>
                          <button
                            onClick={() => removeRecipient(recipient.id)}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#7f1d1d',
                              color: '#fecaca',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '11px'
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', marginBottom: '16px' }}>
              Compose Email
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <input
                type="text"
                placeholder="Sender Name (Optional) e.g. John from MyBrand"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <input
                type="email"
                placeholder="Reply-To Email (Optional) e.g. support@mybrand.com"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                style={{
                  padding: '10px 12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'white',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: 'white',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#64748b', fontSize: '13px' }}>Content (HTML)</label>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Preview
                </button>
              </div>
              <textarea
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '12px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              onClick={handleStartCampaign}
              disabled={recipients.length === 0 || isSubmitting}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: recipients.length > 0 && !isSubmitting ? '#10b981' : '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: recipients.length > 0 && !isSubmitting ? 'pointer' : 'not-allowed',
                fontWeight: '600',
                fontSize: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              {isSubmitting ? (
                <>
                  <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                  Sending...
                </>
              ) : submitSuccess ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Success!
                </>
              ) : (
                `Send to ${recipients.length} Contact${recipients.length !== 1 ? 's' : ''}`
              )}
            </button>
          </div>

          {status.total > 0 && (
            <div style={{ backgroundColor: '#1e293b', borderRadius: '12px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
                  Progress
                </h2>
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: status.isRunning ? '#166534' : '#475569',
                  color: status.isRunning ? '#6ee7b7' : '#94a3b8',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  {status.isRunning ? 'Running' : 'Completed'}
                </span>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontSize: '12px' }}>{progress}%</span>
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {status.sent + status.failed} / {status.total}
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: progress === 100 ? '#10b981' : '#6366f1',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', backgroundColor: '#312e81', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#a5b4fc' }}>{status.sent}</div>
                  <div style={{ color: '#6366f1', fontSize: '11px' }}>Sent</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#7f1d1d', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#fecaca' }}>{status.failed}</div>
                  <div style={{ color: '#ef4444', fontSize: '11px' }}>Failed</div>
                </div>
                <div style={{ padding: '12px', backgroundColor: '#78350f', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#fcd34d' }}>{successRate}%</div>
                  <div style={{ color: '#f59e0b', fontSize: '11px' }}>Success</div>
                </div>
              </div>
              {status.currentEmail && (
                <div style={{ padding: '10px', backgroundColor: '#78350f', borderRadius: '6px', marginBottom: '12px', fontSize: '12px', color: '#fcd34d' }}>
                  Sending to: {status.currentEmail}
                </div>
              )}
              {status.errors.length > 0 && (
                <div style={{ maxHeight: '80px', overflowY: 'auto', backgroundColor: '#450a0a', borderRadius: '6px', padding: '10px', fontSize: '11px', color: '#fecaca', fontFamily: 'monospace', marginBottom: '12px' }}>
                  {status.errors.slice(-3).map((error, i) => (
                    <div key={i} style={{ padding: '2px 0' }}>{error}</div>
                  ))}
                </div>
              )}
              <button
                onClick={handleStopCampaign}
                disabled={!status.isRunning}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: status.isRunning ? '#ef4444' : '#475569',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: status.isRunning ? 'pointer' : 'not-allowed',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                {status.isRunning ? 'Stop Campaign' : 'Campaign Finished'}
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      {showPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            border: '1px solid #475569'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Email Preview
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '6px',
              padding: '20px',
              minHeight: '200px'
            }}>
              <div dangerouslySetInnerHTML={{ __html: previewEmail() }} />
            </div>
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
