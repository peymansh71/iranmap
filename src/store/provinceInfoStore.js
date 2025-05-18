import { create } from "zustand";
import { persist } from "zustand/middleware";

const useProvinceInfoStore = create(
  persist(
    (set, get) => ({
      provinceInfoList: [],
      addProvinceInfo: (province, fields) => {
        // Remove any existing info for this province
        set((state) => ({
          provinceInfoList: [
            ...state.provinceInfoList.filter(
              (item) => item.province !== province
            ),
            { province, fields },
          ],
        }));
      },
      updateProvinceInfo: (province, fields) => {
        set((state) => ({
          provinceInfoList: state.provinceInfoList.map((item) =>
            item.province === province ? { ...item, fields } : item
          ),
        }));
      },
      removeProvinceInfo: (province) => {
        set((state) => ({
          provinceInfoList: state.provinceInfoList.filter(
            (item) => item.province !== province
          ),
        }));
      },
      getProvinceInfoByName: (province) => {
        return get().provinceInfoList.find(
          (item) => item.province === province
        );
      },
    }),
    {
      name: "province-info-storage",
    }
  )
);

export default useProvinceInfoStore;
