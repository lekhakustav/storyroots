import { NextResponse } from 'next/server';
import { getCurrentUser } from './auth';
import { rateLimit } from './rate-limit';

export async function currentUser() { return getCurrentUser(); }
export function ok(data: unknown, init?: ResponseInit) { return NextResponse.json(data, init); }
export function bad(message: string, status = 400) { return NextResponse.json({ error: message }, { status }); }
export function guardRateLimit(userId: string, key: string, max = 10) { return rateLimit(`${userId}:${key}`, max); }
