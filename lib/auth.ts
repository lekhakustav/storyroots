import { cookies } from 'next/headers';
import type { AppUser } from './types';

export const DEMO_USER: AppUser = { id: 'demo-user', fullName: 'Demo Keeper', email: 'demo@keepsake.local' };

export async function getCurrentUser(): Promise<AppUser> {
  const cookieStore = await cookies();
  const raw = cookieStore.get('keepsake_user')?.value;
  if (!raw) return DEMO_USER;
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as AppUser;
    if (parsed.id && parsed.email) return parsed;
  } catch {}
  return DEMO_USER;
}

export function encodeUser(user: AppUser) {
  return Buffer.from(JSON.stringify(user), 'utf8').toString('base64url');
}
