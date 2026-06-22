'use server';

import { cookies } from 'next/headers';
import { prisma } from '../lib/db';
import { hashPassword, verifyPassword, encryptSession, decryptSession } from '../lib/crypto';

const COOKIE_NAME = 'complens_session';

async function setSessionCookie(user: { id: string; email: string; name: string | null; role: string }) {
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    expiresAt,
  };
  const token = encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAt),
    path: '/',
  });
}

export async function signUpAction(data: { email: string; password: string; name: string }) {
  const { email, password, name } = data;
  if (!email || !password || !name) {
    return { success: false, error: 'All fields are required.' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists.' };
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash,
        role: 'USER',
      },
    });

    await setSessionCookie(user);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error('Sign-up error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

export async function signInAction(data: { email: string; password: string }) {
  const { email, password } = data;
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return { success: false, error: 'Invalid email or password.' };
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return { success: false, error: 'Invalid email or password.' };
    }

    await setSessionCookie(user);
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

export async function signOutAction() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error('Sign-out error:', error);
    return { success: false, error: 'Internal server error occurred.' };
  }
}

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get(COOKIE_NAME);
    if (!tokenCookie || !tokenCookie.value) {
      return null;
    }

    const payload = decryptSession(tokenCookie.value);
    if (!payload || !payload.userId || payload.expiresAt < Date.now()) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}
