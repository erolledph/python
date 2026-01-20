import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    BREVO_API_KEY: {
      exists: !!process.env.BREVO_API_KEY,
      length: process.env.BREVO_API_KEY?.length || 0,
      prefix: process.env.BREVO_API_KEY?.substring(0, 8) + '...' || 'missing'
    },
    NEXT_PUBLIC_SENDER_EMAIL: {
      exists: !!process.env.NEXT_PUBLIC_SENDER_EMAIL,
      value: process.env.NEXT_PUBLIC_SENDER_EMAIL || 'missing'
    },
    NEXT_PUBLIC_SENDER_NAME: {
      exists: !!process.env.NEXT_PUBLIC_SENDER_NAME,
      value: process.env.NEXT_PUBLIC_SENDER_NAME || 'missing'
    },
    NEXT_PUBLIC_SEND_DELAY: {
      exists: !!process.env.NEXT_PUBLIC_SEND_DELAY,
      value: process.env.NEXT_PUBLIC_SEND_DELAY || '1 (default)'
    },
    JSONSTORAGE_URL: {
      exists: !!process.env.JSONSTORAGE_URL,
      value: process.env.JSONSTORAGE_URL || 'missing'
    },
    NODE_ENV: {
      exists: !!process.env.NODE_ENV,
      value: process.env.NODE_ENV || 'missing'
    }
  };

  const issues = [];
  
  if (!envVars.BREVO_API_KEY.exists) {
    issues.push('❌ BREVO_API_KEY is missing - emails cannot be sent');
  } else if (envVars.BREVO_API_KEY.length < 20) {
    issues.push('⚠️ BREVO_API_KEY seems too short');
  }
  
  if (!envVars.NEXT_PUBLIC_SENDER_EMAIL.exists) {
    issues.push('❌ NEXT_PUBLIC_SENDER_EMAIL is missing');
  } else if (!envVars.NEXT_PUBLIC_SENDER_EMAIL.value.includes('@')) {
    issues.push('❌ NEXT_PUBLIC_SENDER_EMAIL appears invalid');
  }
  
  if (!envVars.JSONSTORAGE_URL.exists) {
    issues.push('⚠️ JSONSTORAGE_URL is missing - recipient storage may not work');
  }

  return NextResponse.json({
    environment: process.env.NODE_ENV || 'unknown',
    variables: envVars,
    issues,
    status: issues.length === 0 ? '✅ All critical variables configured' : '⚠️ Issues found'
  });
}
