import { useState, useEffect } from 'react';

// Centralised in-memory cache and routing of subscribers for the entire ERP
let cachedData: any = null;
let cachedLoading = true;
const dataSubscribers = new Set<(data: any) => void>();
const loadingSubscribers = new Set<(loading: boolean) => void>();
let pollingTimer: any = null;
let isFirstLoadTriggered = false;

// Attempt to load from storage on startup
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('arcenol_db');
  if (saved) {
    try {
      cachedData = JSON.parse(saved);
      cachedLoading = false;
    } catch (e) {}
  }
}

const performFetch = async () => {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('API fetch error');
    const json = await res.json();
    cachedData = json;
    cachedLoading = false;

    // Notify all active React hook listeners
    dataSubscribers.forEach((cb) => {
      try { cb(json); } catch (e) {}
    });
    loadingSubscribers.forEach((cb) => {
      try { cb(false); } catch (e) {}
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('arcenol_db', JSON.stringify(json));
    }
  } catch (err) {
    console.error('[ERP State Sync Error]:', err);
  }
};

const initGlobalPolling = () => {
  if (isFirstLoadTriggered) return;
  isFirstLoadTriggered = true;
  performFetch();
  if (pollingTimer) clearInterval(pollingTimer);
  pollingTimer = setInterval(performFetch, 3000);
};

export function useERPData() {
  const [data, setData] = useState<any>(cachedData);
  const [loading, setLoading] = useState<boolean>(cachedLoading);

  useEffect(() => {
    // Add current component instance state setters to subscribers list
    dataSubscribers.add(setData);
    loadingSubscribers.add(setLoading);

    // Initialise global syncing
    initGlobalPolling();

    return () => {
      dataSubscribers.delete(setData);
      loadingSubscribers.delete(setLoading);
    };
  }, []);

  const refetch = async () => {
    await performFetch();
  };

  return { data, loading, refetch };
}

