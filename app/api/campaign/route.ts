import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { incrementEmailCount } from '../brevo/plan/route';

interface Recipient {
  id: string;
  name: string;
  email: string;
  status: string;
}

let campaignState = {
  isRunning: false,
  total: 0,
  sent: 0,
  failed: 0,
  currentEmail: '',
  errors: [] as string[]
};

async function sendEmail(
  recipientEmail: string,
  name: string,
  subject: string,
  htmlContent: string,
  customSenderName?: string,
  replyTo?: string
): Promise<boolean> {
  const defaultSenderName = process.env.NEXT_PUBLIC_SENDER_NAME || 'John Doe';
  const senderEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL || 'Johndoe@email.com';
  const apiKey = process.env.BREVO_API_KEY;

  // Validate required environment variables
  if (!apiKey) {
    throw new Error('Brevo API key not configured');
  }

  if (!senderEmail || !senderEmail.includes('@')) {
    throw new Error('Invalid sender email configuration');
  }

  const personalizedHtml = htmlContent.replace(/{name}/g, name);

  const payload: Record<string, unknown> = {
    sender: {
      name: customSenderName || defaultSenderName,
      email: senderEmail
    },
    to: [
      {
        email: recipientEmail,
        name: name
      }
    ],
    subject: subject,
    htmlContent: personalizedHtml
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  try {
    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      payload,
      {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json'
        }
      }
    );

    // Increment persistent email count for statistics
    incrementEmailCount();
    
    return true;
  } catch (error: any) {
    console.error(`Failed to send email to ${recipientEmail}:`, error.response?.data || error.message);

    // Provide more specific error messages based on Brevo's response
    if (error.response?.data) {
      const brevoError = error.response.data;
      if (brevoError.code === 'invalid_parameter') {
        throw new Error(`Invalid email parameters: ${brevoError.message}`);
      } else if (brevoError.code === 'unauthorized') {
        throw new Error('Brevo API key is invalid or expired');
      } else if (brevoError.code === 'forbidden') {
        throw new Error('Sender email not verified in Brevo account');
      } else if (brevoError.message) {
        throw new Error(`Brevo error: ${brevoError.message}`);
      }
    }

    throw error;
  }
}

async function processCampaign(
  recipients: Recipient[],
  subject: string,
  htmlContent: string,
  customSenderName?: string,
  replyTo?: string
) {
  const delay = parseInt(process.env.NEXT_PUBLIC_SEND_DELAY || '1', 10) * 1000;

  try {
    campaignState.total = recipients.length;

    for (let i = 0; i < recipients.length; i++) {
      if (!campaignState.isRunning) {
        break;
      }

      const { email, name } = recipients[i];
      campaignState.currentEmail = email;

      try {
        await sendEmail(email, name, subject, htmlContent, customSenderName, replyTo);
        campaignState.sent++;
      } catch (error) {
        campaignState.failed++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        campaignState.errors.push(`Failed to send to ${email}: ${errorMessage}`);
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  } catch (error) {
    console.error('Campaign processing error:', error);
    campaignState.errors.push(`Campaign error: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    campaignState.isRunning = false;
    campaignState.currentEmail = '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, recipients, subject, htmlContent, senderName, replyTo } = body;

    if (action === 'start') {
      if (campaignState.isRunning) {
        return NextResponse.json({ error: 'Campaign already running' }, { status: 400 });
      }

      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
      }

      if (!subject || !htmlContent) {
        return NextResponse.json({ error: 'Subject and email content are required' }, { status: 400 });
      }

      campaignState = {
        isRunning: true,
        total: 0,
        sent: 0,
        failed: 0,
        currentEmail: '',
        errors: []
      };

      processCampaign(recipients, subject, htmlContent, senderName, replyTo).catch(console.error);

      return NextResponse.json({ message: 'Campaign started' });
    }

    if (action === 'stop') {
      campaignState.isRunning = false;
      return NextResponse.json({ message: 'Campaign stopped' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: 'Campaign operation failed' }, { status: 500 });
  }
}
