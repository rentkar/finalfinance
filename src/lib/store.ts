import { create } from 'zustand';
import { fetchPurchases, createPurchase, updatePurchase, reuploadBill } from './api';
import type { Purchase } from './types';

interface PurchaseStore {
  purchases: Purchase[];
  loading: boolean;
  error: string | null;
  fetchPurchases: () => Promise<void>;
  addPurchase: (purchase: Omit<Purchase, '_id' | 'status' | 'createdAt' | 'directorApproval' | 'financeApproval'>) => Promise<void>;
  updatePurchaseStatus: (id: string, status: Purchase['status'], approvalType?: 'director' | 'finance') => Promise<void>;
  reuploadBill: (id: string, fileUrl: string, fileName: string) => Promise<void>;
}

export const usePurchaseStore = create<PurchaseStore>((set, get) => ({
  purchases: [],
  loading: false,
  error: null,

  fetchPurchases: async () => {
    set({ loading: true, error: null });
    try {
      const purchases = await fetchPurchases();
      set({ purchases, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addPurchase: async (purchase) => {
    set({ loading: true, error: null });
    try {
      const newPurchase = await createPurchase(purchase);
      set((state) => ({
        purchases: [newPurchase, ...state.purchases],
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updatePurchaseStatus: async (id, status, approvalType) => {
    set({ loading: true, error: null });
    try {
      const now = new Date();
      let updateData: Partial<Purchase> = { status };

      if (status === 'rejected') {
        updateData = {
          status: 'rejected',
          directorApproval: null,
          financeApproval: null
        };
      } else if (approvalType === 'director') {
        updateData = {
          status: 'director_approved',
          directorApproval: { approved: true, date: now }
        };
      } else if (approvalType === 'finance') {
        updateData = {
          status: 'finance_approved',
          financeApproval: { approved: true, date: now }
        };
      }

      const updatedPurchase = await updatePurchase(id, updateData);
      set((state) => ({
        purchases: state.purchases.map((p) =>
          p._id === id ? updatedPurchase : p
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  reuploadBill: async (id, fileUrl, fileName) => {
    set({ loading: true, error: null });
    try {
      const updatedPurchase = await reuploadBill(id, { fileUrl, fileName });
      set((state) => ({
        purchases: state.purchases.map((p) =>
          p._id === id ? updatedPurchase : p
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));