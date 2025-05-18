import { create } from "zustand";
import { persist } from "zustand/middleware";

const useIndexesStore = create(
  persist(
    (set) => ({
      indexes: [],
      addIndex: (index) =>
        set((state) => ({
          indexes: state.indexes.includes(index)
            ? state.indexes
            : [...state.indexes, index],
        })),
      removeIndex: (index) =>
        set((state) => ({
          indexes:
            state.indexes.length === 1
              ? state.indexes
              : state.indexes.filter((i) => i !== index),
        })),
      setIndexes: (indexes) => set({ indexes }),
    }),
    {
      name: "indexes-storage",
    }
  )
);

export default useIndexesStore;
