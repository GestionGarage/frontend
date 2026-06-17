'use client';
import { useState } from 'react';

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  const toParams = (): Record<string, string> => ({
    page: String(page),
    limit: String(limit),
  });

  const reset = () => setPage(1);

  return { page, limit, setPage, reset, toParams };
}
