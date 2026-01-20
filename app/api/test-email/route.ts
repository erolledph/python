import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message } = await request.json();
    
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL;
    const senderName = process.env.NEXT_PUBLIC_SENDER_NAME || 'Test Sender';

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Brevo API key not configured'
      }, { status: 500 });
    }

    const payload = {
      sender: {
        name: senderName,
        email: senderEmail
      },
      to: [
        {
          email: email,
          name: 'Test Recipient'
        }
      ],
      subject: subject || 'Test Email from Brevo',
      htmlContent: message || `<p>This is a test email sent at ${new Date().toLocaleString()}</p>`
    };

    console.log(`Sending test email to ${email} from ${senderEmail}`);

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

    console.log('Test email sent successfully:', response.data);

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: response.data.messageId,
      to: email,
      from: senderEmail
    });

  } catch (error: any) {
    console.error('Test email failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to send test email',
      details: error.response?.data || error.message
    }, { status: 500 });
  }
}
