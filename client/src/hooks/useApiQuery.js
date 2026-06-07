import { useCallback, useEffect, useState } from "react";
import { getApiError } from "../api/client.js";

export const useApiQuery = (request, dependencies = []) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextData = await request();
      setData(nextData);
    } catch (requestError) {
      setError(getApiError(requestError));
    } finally {
      setIsLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    load();
  }, [load]);

  return { data, error, isLoading, refetch: load, setData };
};
