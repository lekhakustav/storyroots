import { NextResponse } from 'next/server';
export async function POST() { const response = NextResponse.json({ signedOut: true }); response.cookies.delete('keepsake_user'); return response; }
