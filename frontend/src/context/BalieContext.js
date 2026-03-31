import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API = process.env.REACT_APP_BACKEND_URL;
const BalieContext = createContext(null);

export const BalieProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/balia/bulk`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <BalieContext.Provider value={{ data, loading, refresh }}>
      {children}
    </BalieContext.Provider>
  );
};

export const useBalieData = () => {
  const ctx = useContext(BalieContext);
  if (!ctx) return { data: null, loading: true, refresh: () => {} };
  return ctx;
};
