import type { Purchase } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function fetchPurchases(): Promise<Purchase[]> {
  const response = await fetch(`${API_URL}/purchases`);
  if (!response.ok) throw new Error('Failed to fetch purchases');
  return response.json();
}

export async function createPurchase(data: Omit<Purchase, '_id' | 'status' | 'createdAt' | 'directorApproval' | 'financeApproval'>): Promise<Purchase> {
  const response = await fetch(`${API_URL}/purchases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create purchase');
  return response.json();
}

export async function updatePurchase(id: string, data: Partial<Purchase>): Promise<Purchase> {
  const response = await fetch(`${API_URL}/purchases/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update purchase');
  return response.json();
}

export async function reuploadBill(id: string, fileData: { fileUrl: string; fileName: string }): Promise<Purchase> {
  return updatePurchase(id, fileData);
}