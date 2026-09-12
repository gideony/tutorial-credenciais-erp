import { NextResponse } from 'next/server';

export async function GET(request) {
  return new NextResponse('Authentication Required!', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}
