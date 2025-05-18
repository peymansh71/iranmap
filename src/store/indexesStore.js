import { create } from "zustand";
import { indexesAPI } from "../services/api";

const useIndexesStore = create((set) => ({
  indexes: [],
  isLoading: false,
  error: null,

  fetchIndexes: async () => {
    try {
      set({ isLoading: true, error: null });
      const indexes = await indexesAPI.getAll();
      set({ indexes: indexes.map((i) => i.name), isLoading: false });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to fetch indexes",
        isLoading: false,
      });
    }
  },

  addIndex: async (name) => {
    try {
      set({ isLoading: true, error: null });
      await indexesAPI.create({ name });
      set((state) => ({
        indexes: [...state.indexes, name],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to add index",
        isLoading: false,
      });
    }
  },

  removeIndex: async (name) => {
    try {
      set({ isLoading: true, error: null });
      const index = await indexesAPI.getAll();
      const indexToDelete = index.find((i) => i.name === name);
      if (indexToDelete) {
        await indexesAPI.delete(indexToDelete._id);
        set((state) => ({
          indexes: state.indexes.filter((i) => i !== name),
          isLoading: false,
        }));
      }
    } catch (error) {
      set({
        error: error.response?.data?.message || "Failed to remove index",
        isLoading: false,
      });
    }
  },
}));

export default useIndexesStore;
