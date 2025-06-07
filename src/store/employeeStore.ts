import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProvinceEmployee {
  provinceId: number;
  provinceName: string;
  employeeCount: number;
}

interface EmployeeStore {
  employees: ProvinceEmployee[];
  addOrUpdateEmployees: (
    provinceId: number,
    provinceName: string,
    count: number
  ) => void;
  getEmployeesByProvince: (provinceId: number) => ProvinceEmployee | undefined;
  getTotalEmployees: () => number;
  getAllEmployees: () => ProvinceEmployee[];
  clearAllEmployees: () => void;
}

const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],

      addOrUpdateEmployees: (
        provinceId: number,
        provinceName: string,
        count: number
      ) => {
        set((state) => {
          const existingIndex = state.employees.findIndex(
            (emp) => emp.provinceId === provinceId
          );

          if (count === 0) {
            // Remove if count is 0
            return {
              employees: state.employees.filter(
                (emp) => emp.provinceId !== provinceId
              ),
            };
          }

          if (existingIndex >= 0) {
            // Update existing
            const updatedEmployees = [...state.employees];
            updatedEmployees[existingIndex] = {
              provinceId,
              provinceName,
              employeeCount: count,
            };
            return { employees: updatedEmployees };
          } else {
            // Add new
            return {
              employees: [
                ...state.employees,
                { provinceId, provinceName, employeeCount: count },
              ],
            };
          }
        });
      },

      getEmployeesByProvince: (provinceId: number) => {
        return get().employees.find((emp) => emp.provinceId === provinceId);
      },

      getTotalEmployees: () => {
        return get().employees.reduce(
          (total, emp) => total + emp.employeeCount,
          0
        );
      },

      getAllEmployees: () => {
        return get().employees;
      },

      clearAllEmployees: () => {
        set({ employees: [] });
      },
    }),
    {
      name: "employee-storage",
    }
  )
);

export default useEmployeeStore;
