'use client';
import { useEffect } from 'react';
import { pingBackend } from '@/lib/client-api';

const INTERVAL_MS = 10 * 60 * 1000;

export default function KeepAlive() {
  useEffect(() => {
    pingBackend();
    const id = setInterval(pingBackend, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  return null;
}
