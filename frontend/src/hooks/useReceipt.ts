import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { EnvironmentalReceipt } from '../api/types';

const fetchReceipt = async (url: string): Promise<EnvironmentalReceipt> => {
  const { data } = await api.get<EnvironmentalReceipt>('/api/v1/receipts', {
    params: { url },
  });
  return data;
};

export const useReceipt = (url: string) =>
  useQuery({
    queryKey: ['receipt', url],
    queryFn: () => fetchReceipt(url),
    enabled: !!url,
  });
