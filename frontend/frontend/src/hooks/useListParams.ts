import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from './useDebouncedValue';

const positiveInt = (raw: string | null) => {
  const value = Number.parseInt(raw ?? '', 10);
  return Number.isFinite(value) && value >= 1 ? value : 1;
};

/**
 * Filters and paging of a list page kept in the URL (?status=…&page=2), so a refresh, a shared link
 * and the Back button keep the same view. A key equal to its default is left out of the URL.
 *
 * `setSearchParams` computes from the params of the last render, so two calls in one event
 * (`setValue(…)` then `setPage(1)`) would overwrite each other. Every setter here builds on the
 * latest params instead, which is also why they can be called back to back.
 * Filters replace the current history entry; moving to a later page adds one.
 */
export function useListParams<K extends string>(defaults: Record<K, string>) {
  const [searchParams, setSearchParams] = useSearchParams();
  const latest = useRef(searchParams);
  latest.current = searchParams;
  const defaultsRef = useRef(defaults);
  defaultsRef.current = defaults;

  const write = useCallback((mutate: (params: URLSearchParams) => void, replace: boolean) => {
    const next = new URLSearchParams(latest.current);
    mutate(next);
    latest.current = next;
    setSearchParams(next, { replace });
  }, [setSearchParams]);

  const setValue = useCallback((key: K, value: string) => {
    write((params) => {
      if (value === defaultsRef.current[key]) params.delete(key);
      else params.set(key, value);
    }, true);
  }, [write]);

  const setPage = useCallback((next: number | ((page: number) => number)) => {
    const current = positiveInt(latest.current.get('page'));
    const target = Math.max(1, typeof next === 'function' ? next(current) : next);
    write((params) => {
      if (target === 1) params.delete('page');
      else params.set('page', String(target));
    }, target === 1);
  }, [write]);

  const reset = useCallback(() => {
    write((params) => {
      Object.keys(defaultsRef.current).forEach((key) => params.delete(key));
      params.delete('page');
    }, true);
  }, [write]);

  const values = Object.fromEntries(
    Object.entries<string>(defaults).map(([key, fallback]) => [key, searchParams.get(key) ?? fallback])
  ) as Record<K, string>;

  return { values, page: positiveInt(searchParams.get('page')), setValue, setPage, reset };
}

/**
 * A search box whose (trimmed) text reaches the URL only after the user pauses, and that follows the
 * URL when it changes from outside (Back/Forward). Clearing the box updates the URL at once.
 * `urlValue` is the current URL value, `commit` writes a new one.
 */
export function useUrlSearchInput(urlValue: string, commit: (value: string) => void, delayMs = 350) {
  const [input, setInput] = useState(urlValue);
  const debounced = useDebouncedValue(input.trim(), delayMs);
  const lastCommitted = useRef(urlValue);
  const commitRef = useRef(commit);
  commitRef.current = commit;

  // typed text -> URL
  useEffect(() => {
    if (debounced === lastCommitted.current) return;
    lastCommitted.current = debounced;
    commitRef.current(debounced);
  }, [debounced]);

  // URL changed by something else (Back/Forward, a link) -> text box. Our own commits are skipped so
  // characters typed after a commit are not overwritten.
  useEffect(() => {
    if (urlValue === lastCommitted.current) return;
    lastCommitted.current = urlValue;
    setInput(urlValue);
  }, [urlValue]);

  const update = useCallback((value: string) => {
    setInput(value);
    if (value.trim() === '' && lastCommitted.current !== '') {
      lastCommitted.current = '';
      commitRef.current('');
    }
  }, []);

  return [input, update] as const;
}
