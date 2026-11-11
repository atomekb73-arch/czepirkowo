import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/authCrypto';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('czepirkowo_admin_token')?.value;
  const isValid = verifySessionToken(token);

  return NextResponse.json({ authenticated: isValid });
}
