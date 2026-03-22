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

export interface ManualProduct {
  brand: string;
  title: string;
  description: string;
  materials: string;
  price: string;
}

const fetchManualReceipt = async (product: ManualProduct): Promise<EnvironmentalReceipt> => {
  const { data } = await api.post<EnvironmentalReceipt>('/api/v1/receipts/manual', {
    brand: product.brand,
    title: product.title,
    description: product.description,
    materials: product.materials,
    price: parseFloat(product.price) || 0,
  });
  return data;
};

export const useManualReceipt = (product: ManualProduct | null) =>
  useQuery({
    queryKey: ['receipt-manual', product],
    queryFn: () => fetchManualReceipt(product!),
    enabled: !!product?.title,
  });
