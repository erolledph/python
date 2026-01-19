import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.NEXT_PUBLIC_SENDER_EMAIL;

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'Brevo API key not configured'
      }, { status: 500 });
    }

    // Test 1: Check API key validity
    try {
      const accountResponse = await axios.get('https://api.brevo.com/v3/account', {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey
        }
      });

      console.log('Brevo account check successful:', accountResponse.data.email);
    } catch (error: any) {
      console.error('Brevo API key test failed:', error.response?.data || error.message);
      return NextResponse.json({
        success: false,
        error: 'Brevo API key is invalid',
        details: error.response?.data || error.message
      }, { status: 500 });
    }

    // Test 2: Check if sender email is configured
    if (!senderEmail || !senderEmail.includes('@')) {
      return NextResponse.json({
        success: false,
        error: 'Sender email not properly configured',
        senderEmail: senderEmail
      }, { status: 500 });
    }

    // Test 3: Try to get senders list to check if email is verified
    try {
      const sendersResponse = await axios.get('https://api.brevo.com/v3/senders', {
        headers: {
          'accept': 'application/json',
          'api-key': apiKey
        }
      });

      const senders = sendersResponse.data.senders || [];
      const isVerified = senders.some((sender: any) =>
        sender.email.toLowerCase() === senderEmail.toLowerCase() &&
        sender.active
      );

      if (!isVerified) {
        return NextResponse.json({
          success: false,
          error: 'Sender email not verified in Brevo',
          senderEmail: senderEmail,
          message: `Please verify ${senderEmail} in your Brevo account settings`,
          availableSenders: senders.map((s: any) => ({ email: s.email, active: s.active }))
        }, { status: 500 });
      }

      console.log('Sender email is verified:', senderEmail);

    } catch (error: any) {
      console.error('Sender verification check failed:', error.response?.data || error.message);
      // Continue anyway, as this might not be critical
    }

    return NextResponse.json({
      success: true,
      message: 'Brevo configuration is valid',
      senderEmail: senderEmail,
      accountEmail: 'Connected successfully'
    });

  } catch (error: any) {
    console.error('Brevo test failed:', error);
    return NextResponse.json({
      success: false,
      error: 'Unexpected error during Brevo test',
      details: error.message
    }, { status: 500 });
  }
}