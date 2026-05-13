import { useState, useEffect } from "react";

export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFunction();
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Bir hata oluştu");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction, dependencies]);

  return { data, loading, error };
};
