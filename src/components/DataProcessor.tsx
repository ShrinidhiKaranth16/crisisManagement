import { useCallback, useState } from "react";

export const useDataProcessor = <T = any>() => {
  const [processedData, setProcessedData] = useState<T[]>([]);
  const [processing, setProcessing] = useState(false);

  const processData = useCallback((data: T[]) => {
    setProcessing(true);
    let result: T[] = [];
    let index = 0;

    const chunkSize = 100; // Adjustable
    const total = data.length;

    const processChunk = () => {
      const chunk = data.slice(index, index + chunkSize).map(item => ({
        ...item,
        processed: Date.now(),
        cache: new Array(50000).fill((item as any).pageViews || 0) // ⚠️ use small memory footprint
      }));

      result = [...result, ...chunk];
      index += chunkSize;

      if (index < total) {
        requestIdleCallback(processChunk);
      } else {
        setProcessedData(result);
        setProcessing(false);
      }
    };

    requestIdleCallback(processChunk);
  }, []);

  return { processedData, processing, processData };
};
