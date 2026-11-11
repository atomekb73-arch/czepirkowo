import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminPin, createSessionToken } from '@/lib/authCrypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pin = body?.pin || '';

    // Sztuczne opóźnienie 300ms przeciw brute-force
    await new Promise((res) => setTimeout(res, 300));

    if (!(await verifyAdminPin(pin))) {
      return NextResponse.json(
        { success: false, error: 'Nieprawidłowy PIN pracowni.' },
        { status: 401 }
      );
    }

    const token = createSessionToken();
    const response = NextResponse.json({ success: true, message: 'Zalogowano pomyślnie' });

    response.cookies.set('czepirkowo_admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 dni
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Błąd autoryzacji admina:', err);
    return NextResponse.json({ success: false, error: 'Błąd serwera' }, { status: 500 });
  }
}
