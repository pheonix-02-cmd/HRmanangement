/**
 * Security & Sanitization Utilities for NexusHR
 * Protects against XSS, injection, brute-force attempts, and credential leaks.
 */

// 1. XSS Input Sanitization
export const sanitizeInput = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // strip script tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // strip iframe tags
    .replace(/javascript\s*:/gi, '') // strip javascript: pseudo-protocol
    .replace(/on\w+\s*=/gi, '') // strip event handlers like onclick=
    .trim();
};

// 2. Strict Email Validator
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return re.test(email.trim());
};

// 3. Password Strength Validator
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters long.' };
  }
  return { valid: true, message: '' };
};

// 4. Secure Password Hashing (SHA-256 with Salt via Web Crypto API)
export const hashPassword = async (password, salt = 'nexus_hrms_salt_2026') => {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return password; // Fallback in non-browser env
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// 5. Rate Limiter (Brute-Force Protection)
const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;
const STORAGE_KEY = 'nexus_auth_rate_limit';

export const checkRateLimit = (identifier = 'default') => {
  if (typeof window === 'undefined') return { allowed: true, remainingTime: 0 };

  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${identifier}`);
    if (!raw) return { allowed: true, remainingTime: 0, attempts: 0 };

    const { attempts, lockedUntil } = JSON.parse(raw);
    const now = Date.now();

    if (lockedUntil && now < lockedUntil) {
      const remainingTime = Math.ceil((lockedUntil - now) / 1000);
      return { allowed: false, remainingTime, attempts };
    }

    // Lockout expired
    if (lockedUntil && now >= lockedUntil) {
      sessionStorage.removeItem(`${STORAGE_KEY}_${identifier}`);
      return { allowed: true, remainingTime: 0, attempts: 0 };
    }

    return { allowed: attempts < MAX_ATTEMPTS, remainingTime: 0, attempts };
  } catch (e) {
    return { allowed: true, remainingTime: 0, attempts: 0 };
  }
};

export const recordFailedAttempt = (identifier = 'default') => {
  if (typeof window === 'undefined') return;

  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY}_${identifier}`);
    const data = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };

    data.attempts += 1;
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + (LOCKOUT_SECONDS * 1000);
    }

    sessionStorage.setItem(`${STORAGE_KEY}_${identifier}`, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
};

export const resetRateLimit = (identifier = 'default') => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(`${STORAGE_KEY}_${identifier}`);
};
