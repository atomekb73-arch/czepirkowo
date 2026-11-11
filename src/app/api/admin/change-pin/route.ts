import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, verifyAdminPin, saveNewPin, createSessionToken } from '@/lib/authCrypto';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('czepirkowo_admin_token')?.value;
    if (!verifySessionToken(token)) {
      return NextResponse.json(
        { success: false, error: 'Brak uprawnień. Zaloguj się ponownie.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const currentPin = body?.currentPin || '';
    const newPin = body?.newPin || '';

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { success: false, error: 'Wypełnij wszystkie pola formularza.' },
        { status: 400 }
      );
    }

    if (newPin.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: 'Nowy PIN musi mieć co najmniej 4 znaki.' },
        { status: 400 }
      );
    }

    // Weryfikacja starego PIN-u
    const isCurrentValid = await verifyAdminPin(currentPin);
    if (!isCurrentValid) {
      return NextResponse.json(
        { success: false, error: 'Dotychczasowy PIN jest nieprawidłowy.' },
        { status: 400 }
      );
    }

    // Zapis nowego PIN-u
    const saved = await saveNewPin(newPin);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: 'Nie udało się zapisać nowego PIN-u w bazie.' },
        { status: 500 }
      );
    }

    // Odśwież sesję Magdy
    const newToken = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Nowy PIN został pomyślnie zapisany! Zapamiętaj swój nowy kod.',
    });

    response.cookies.set('czepirkowo_admin_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Błąd zmiany PIN-u:', err);
    return NextResponse.json({ success: false, error: 'Błąd serwera' }, { status: 500 });
  }
}
