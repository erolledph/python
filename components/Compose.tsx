'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Users, Mail, X } from 'lucide-react';

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

const defaultHtmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WEB3 LITERACY WITH BLESSED</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border-radius: 0 0 10px 10px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Hello {name}!</h1>
        <p>Welcome to the future of Web3 education</p>
    </div>
    <div class="content">
        <p>We're excited to share with you the amazing opportunities in the Web3 space.</p>
        <p>BLESSED is here to guide you through your journey of blockchain literacy and digital empowerment.</p>
        <a href="#" class="button">Get Started</a>
        <p>Best regards,<br>The BLESSED Team</p>
    </div>
    <div class="footer">
        <p>This email was sent to {email}. If you no longer wish to receive these emails, please unsubscribe.</p>
    </div>
</body>
</html>
`;

export default function Compose() {
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
   const [manualName, setManualName] = useState('');
   const [manualEmail, setManualEmail] = useState('');
   const [senderName, setSenderName] = useState('');
   const [replyToEmail, setReplyToEmail] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showTemplateModal, setShowTemplateModal] = useState(false);


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
    console.log('=== FETCH RECIPIENTS DEBUG ===');
    try {
      console.log('Fetching recipients...');
      const res = await fetch('/api/recipients');
      console.log('Response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Received recipients data:', data);
        console.log('Setting recipients to:', data.recipients || []);
        setRecipients(data.recipients || []);
      } else {
        console.error('Failed to fetch recipients, status:', res.status);
      }
    } catch (error) {
      console.error('Failed to fetch recipients:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    // Don't auto-fetch recipients - let user choose when to load them
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleClearAll = () => {
    setRecipients([]);
    setManualName('');
    setManualEmail('');
    setEmailSubject('');
    setEmailContent('');
    setSenderName('');
    setReplyToEmail('');
    showNotification('success', 'All fields cleared');
  };

  const handleAddRecipient = () => {
    console.log('=== ADD RECIPIENT DEBUG ===');
    console.log('manualName:', manualName);
    console.log('manualEmail:', manualEmail);
    console.log('recipients:', recipients);
    
    if (!manualEmail) {
      showNotification('error', 'Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(manualEmail)) {
      showNotification('error', 'Invalid email format');
      return;
    }

    const newRecipient: Recipient = {
      id: Date.now().toString(),
      name: manualName || manualEmail.split('@')[0],
      email: manualEmail,
      status: 'pending'
    };

    console.log('New recipient to add:', newRecipient);
    
    if (Array.isArray(recipients)) {
      console.log('Adding to existing array');
      setRecipients([...recipients, newRecipient]);
    } else {
      console.log('Creating new array');
      setRecipients([newRecipient]);
    }
    
    setManualName('');
    setManualEmail('');
    showNotification('success', 'Recipient added successfully');
  };

  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== CSV UPLOAD DEBUG ===');
    const file = event.target.files?.[0];
    console.log('File:', file);
    if (!file) return;

    console.log('CSV file selected:', file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        console.log('CSV raw text:', text);
        
        const lines = text.split('\n').filter(line => line.trim());
        console.log('CSV lines:', lines);
        
        const newRecipients: Recipient[] = [];
        lines.forEach((line, index) => {
          const [name, email] = line.split(',').map(s => s.trim());
          console.log(`Processing line ${index}:`, { name, email });
          
          if (email && email.includes('@')) {
            newRecipients.push({
              id: `csv-${Date.now()}-${index}`,
              name: name || email.split('@')[0],
              email,
              status: 'pending'
            });
          }
        });

        console.log('Parsed recipients:', newRecipients);

        if (newRecipients.length > 0) {
          if (Array.isArray(recipients)) {
            console.log('Adding CSV recipients to existing array');
            setRecipients([...recipients, ...newRecipients]);
          } else {
            console.log('Creating new array from CSV');
            setRecipients(newRecipients);
          }
          showNotification('success', `${newRecipients.length} recipients imported from CSV`);
        } else {
          showNotification('error', 'No valid emails found in CSV');
        }
      } catch (error) {
        console.error('CSV parsing error:', error);
        showNotification('error', 'Failed to parse CSV file');
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveRecipient = (id: string) => {
    if (Array.isArray(recipients)) {
      setRecipients(recipients.filter(r => r.id !== id));
    }
  };

  const handleStartCampaign = async () => {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      showNotification('error', 'Please add recipients first');
      return;
    }

    if (!emailSubject || !emailContent) {
      showNotification('error', 'Subject and email content are required');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          recipients,
          subject: emailSubject,
          htmlContent: emailContent,
          senderName,
          replyTo: replyToEmail
        }),
      });

      if (res.ok) {
        showNotification('success', 'Campaign started successfully');
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Failed to start campaign');
      }
    } catch (error) {
      showNotification('error', 'Failed to start campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStopCampaign = async () => {
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });

      if (res.ok) {
        showNotification('success', 'Campaign stopped');
      } else {
        const error = await res.json();
        showNotification('error', error.error || 'Failed to stop campaign');
      }
    } catch (error) {
      showNotification('error', 'Failed to stop campaign');
    }
  };

   const insertHtmlTag = (tag: string, value?: string) => {
     const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
     if (!textarea) return;

     const start = textarea.selectionStart;
     const end = textarea.selectionEnd;
     const selectedText = emailContent.substring(start, end);
     const beforeText = emailContent.substring(0, start);
     const afterText = emailContent.substring(end);

     let newText = '';
     switch (tag) {
       case 'bold':
         newText = `<strong>${selectedText || 'bold text'}</strong>`;
         break;
       case 'italic':
         newText = `<em>${selectedText || 'italic text'}</em>`;
         break;
       case 'underline':
         newText = `<u>${selectedText || 'underlined text'}</u>`;
         break;
       case 'link':
         newText = `<a href="${value || '#'}" target="_blank">${selectedText || 'link text'}</a>`;
         break;
       case 'image':
         newText = `<img src="${value || 'https://via.placeholder.com/300x200'}" alt="Image" style="max-width: 100%; height: auto;">`;
         break;
       case 'h1':
         newText = `<h1>${selectedText || 'Heading 1'}</h1>`;
         break;
       case 'h2':
         newText = `<h2>${selectedText || 'Heading 2'}</h2>`;
         break;
       case 'p':
         newText = `<p>${selectedText || 'Paragraph text'}</p>`;
         break;
       case 'br':
         newText = '<br>';
         break;
       default:
         return;
     }

     const updatedContent = beforeText + newText + afterText;
     setEmailContent(updatedContent);
   };


   const previewEmail = () => {
     const previewContent = emailContent
       .replace(/{name}/g, 'John Doe')
       .replace(/{email}/g, 'john.doe@example.com');

     console.log('Preview content:', previewContent);
     return previewContent;
   };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-3">Compose Email</h1>
        <p className="text-gray-400 text-lg">Create and send personalized email campaigns</p>
      </div>

      {/* Campaign Status */}
      {status.isRunning && (
        <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/50 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-blue-400 font-semibold text-lg">Campaign in Progress</h3>
            <button
              onClick={handleStopCampaign}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-500/25"
            >
              Stop Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400 block">Total:</span>
              <span className="text-white font-semibold text-lg">{status.total}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400 block">Sent:</span>
              <span className="text-green-400 font-semibold text-lg">{status.sent}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400 block">Failed:</span>
              <span className="text-red-400 font-semibold text-lg">{status.failed}</span>
            </div>
            <div className="bg-gray-800/50 p-3 rounded-lg">
              <span className="text-gray-400 block">Current:</span>
              <span className="text-blue-400 font-semibold text-sm">{status.currentEmail}</span>
            </div>
          </div>
          {status.errors.length > 0 && (
            <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg">
              <strong>Errors:</strong> {status.errors.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Recipients Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            Recipients ({recipients.length})
          </h2>
          <div className="text-sm text-gray-400">
            {recipients.length} recipient{recipients.length !== 1 ? 's' : ''} ready
          </div>
        </div>
        
        <div className="space-y-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Name (optional)"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <input
              type="email"
              placeholder="Email address"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddRecipient}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg shadow-blue-500/25"
            >
              Add Recipient
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              id="csv-upload"
            />
            <label
              htmlFor="csv-upload"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-center cursor-pointer hover:bg-gray-600/50 transition-all duration-200 text-white font-medium"
            >
              📁 Upload CSV File
            </label>
            <button
              onClick={fetchRecipients}
              className="px-6 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white hover:bg-gray-600/50 transition-all duration-200 font-medium"
            >
              🔄 Sync from Server
            </button>
            <button
              onClick={handleClearAll}
              className="px-6 py-3 bg-red-600/50 border border-red-600/50 rounded-xl text-white hover:bg-red-600/70 transition-all duration-200 font-medium"
            >
              🗑️ Clear All
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-2 p-4 bg-gray-900/30 rounded-xl border border-gray-700/30">
          {Array.isArray(recipients) && recipients.map((recipient) => (
            <div
              key={recipient.id}
              className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-all duration-200 group"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <span className="text-blue-400 text-sm font-medium">
                    {recipient.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-white font-medium">{recipient.name}</span>
                  <span className="text-gray-400 text-sm ml-2">&lt;{recipient.email}&gt;</span>
                </div>
              </div>
              <button
                onClick={() => handleRemoveRecipient(recipient.id)}
                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 hover:bg-red-500/20 rounded-lg"
              >
                ×
              </button>
            </div>
          ))}
          {Array.isArray(recipients) && recipients.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400">No recipients added yet</p>
              <p className="text-gray-500 text-sm mt-1">Add recipients manually or upload a CSV file</p>
            </div>
          )}
        </div>
      </div>

      {/* Email Content Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700/50 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Mail className="w-4 h-4 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Email Content</h2>
        </div>
        
        <div className="space-y-6">
           <div>
             <label className="text-gray-400 text-sm font-medium mb-2 block">Email Subject</label>
             <input
               type="text"
               placeholder="Enter email subject..."
               value={emailSubject}
               onChange={(e) => setEmailSubject(e.target.value)}
               className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
             />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="text-gray-400 text-sm font-medium mb-2 block">Sender Name (Optional)</label>
               <input
                 type="text"
                 placeholder="Default sender name"
                 value={senderName}
                 onChange={(e) => setSenderName(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
               />
             </div>
             <div>
               <label className="text-gray-400 text-sm font-medium mb-2 block">Reply-To Email (Optional)</label>
               <input
                 type="email"
                 placeholder="reply-to@example.com"
                 value={replyToEmail}
                 onChange={(e) => setReplyToEmail(e.target.value)}
                 className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
               />
             </div>
           </div>

           {/* Template Loading Section */}
           <div className="flex items-center justify-between">
             <div>
               <label className="text-gray-400 text-sm font-medium mb-2 block">Email Templates</label>
               <p className="text-gray-500 text-xs">Load saved templates to quickly compose emails</p>
             </div>
             <button
               onClick={() => setShowTemplateModal(true)}
               className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium flex items-center gap-2"
             >
               📋 Load Template
             </button>
           </div>

           {/* HTML Editor Toolbar */}
           <div>
             <label className="text-gray-400 text-sm font-medium mb-2 block">HTML Editor Toolbar</label>
             <div className="bg-gray-700/50 rounded-xl p-3 mb-3 border border-gray-600/50">
               <div className="flex flex-wrap gap-2">
                 <button
                   onClick={() => insertHtmlTag('bold')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Bold"
                 >
                   <strong>B</strong>
                 </button>
                 <button
                   onClick={() => insertHtmlTag('italic')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium italic"
                   title="Italic"
                 >
                   <em>I</em>
                 </button>
                 <button
                   onClick={() => insertHtmlTag('underline')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium underline"
                   title="Underline"
                 >
                   <u>U</u>
                 </button>
                 <button
                   onClick={() => {
                     const url = prompt('Enter link URL:');
                     if (url) insertHtmlTag('link', url);
                   }}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Insert Link"
                 >
                   🔗 Link
                 </button>
                 <button
                   onClick={() => {
                     const src = prompt('Enter image URL:');
                     if (src) insertHtmlTag('image', src);
                   }}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Insert Image"
                 >
                   🖼️ Image
                 </button>
                 <button
                   onClick={() => insertHtmlTag('h1')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Heading 1"
                 >
                   H1
                 </button>
                 <button
                   onClick={() => insertHtmlTag('h2')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Heading 2"
                 >
                   H2
                 </button>
                 <button
                   onClick={() => insertHtmlTag('p')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Paragraph"
                 >
                   ¶
                 </button>
                 <button
                   onClick={() => insertHtmlTag('br')}
                   className="px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 transition-colors font-medium"
                   title="Line Break"
                 >
                   ↵ Break
                 </button>
               </div>
             </div>

             <div className="flex justify-between items-center mb-2">
               <label className="text-gray-400 text-sm font-medium">Email Content (HTML)</label>
               <button
                 onClick={() => setShowPreviewModal(true)}
                 className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
               >
                 👁️ Preview Email
               </button>
             </div>
             <textarea
               value={emailContent}
               onChange={(e) => setEmailContent(e.target.value)}
               placeholder="Enter your email content in HTML format... or use the toolbar above to build your email!"
               className="w-full h-64 px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all font-mono text-sm"
             />
           </div>
        </div>
      </div>

      {/* Send Button */}
      <div className="flex justify-center">
        <button
          onClick={handleStartCampaign}
          disabled={(!Array.isArray(recipients) || recipients.length === 0) || isSubmitting || status.isRunning}
          className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all font-semibold text-lg shadow-lg shadow-green-500/25"
        >
          {isSubmitting ? 'Starting...' : status.isRunning ? 'Campaign Running' : 'Start Campaign'}
        </button>
      </div>

       {/* Preview Modal */}
       {showPreviewModal && (
         <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
           <div className="bg-gray-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
             <div className="flex justify-between items-center p-6 pb-4 border-b border-gray-700">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                   <Mail className="w-4 h-4 text-green-400" />
                 </div>
                 <div>
                   <h3 className="text-xl font-bold text-white">Email Preview</h3>
                   <p className="text-sm text-gray-400">Preview how your email will look to recipients</p>
                 </div>
               </div>
               <button
                 onClick={() => setShowPreviewModal(false)}
                 className="text-gray-400 hover:text-white p-2 hover:bg-gray-700 rounded-lg transition-all duration-200"
               >
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>

             <div className="bg-white rounded-b-2xl overflow-hidden">
               <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                 <div className="flex items-center gap-2 text-sm text-gray-600">
                   <Mail className="w-4 h-4" />
                   <span className="font-medium">Subject: {emailSubject || 'No Subject'}</span>
                 </div>
               </div>
               <div className="relative">
                 <iframe
                   srcDoc={previewEmail()}
                   className="w-full h-[500px] border-0"
                   title="Email Preview"
                 />
               </div>
             </div>

             <div className="flex justify-end gap-3 p-6 pt-4 bg-gray-800 rounded-b-2xl">
               <button
                 onClick={() => setShowPreviewModal(false)}
                 className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
               >
                 Close Preview
               </button>
               <button
                 onClick={() => {
                   navigator.clipboard.writeText(previewEmail());
                   showNotification('success', 'Email HTML copied to clipboard');
                 }}
                 className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
               >
                 📋 Copy HTML
               </button>
             </div>
           </div>
         </div>
       )}
      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Load Email Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {(() => {
                try {
                  const stored = localStorage.getItem('emailTemplates');
                  const templates = stored ? JSON.parse(stored) : [];
                  
                  if (templates.length === 0) {
                    return (
                      <div className="col-span-full text-center py-8">
                        <p className="text-gray-400 mb-4">No templates found. Create templates in the Templates page first.</p>
                        <button
                          onClick={() => {
                            setShowTemplateModal(false);
                            // Navigate to templates page or open in new tab
                            window.open('/templates', '_blank');
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          Create Templates
                        </button>
                      </div>
                    );
                  }

                  return templates.map((template: any) => (
                    <div
                      key={template.id}
                      className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition-all cursor-pointer"
                      onClick={() => {
                        setEmailSubject(template.subject);
                        setEmailContent(template.content);
                        setShowTemplateModal(false);
                        toast.success(`Template "${template.name}" loaded`);
                      }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-purple-600 bg-gray-600 border-gray-500 rounded focus:ring-purple-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{template.subject}</p>
                      <div className="bg-gray-800/50 rounded p-2 h-20 overflow-hidden">
                        <p className="text-gray-300 text-xs line-clamp-3">
                          {template.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(template.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ));
                } catch (error) {
                  return (
                    <div className="col-span-full text-center py-8">
                      <p className="text-red-400">Error loading templates</p>
                    </div>
                  );
                }
              })()}
            </div>

            <div className="flex items-center justify-between">
              <p className="text-gray-400 text-sm">Click on a template to load it, or select multiple templates</p>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
