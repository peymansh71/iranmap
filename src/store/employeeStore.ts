import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ProvinceEmployee {
  provinceId: number;
  provinceName: string;
  employeeCount: number;
}

interface EmployeeStore {
  employees: ProvinceEmployee[];
  lastExcelImport: string | null;
  addOrUpdateEmployees: (
    provinceId: number,
    provinceName: string,
    count: number
  ) => void;
  bulkImportFromExcel: (employees: ProvinceEmployee[]) => void;
  getEmployeesByProvince: (provinceId: number) => ProvinceEmployee | undefined;
  getTotalEmployees: () => number;
  getAllEmployees: () => ProvinceEmployee[];
  clearAllEmployees: () => void;
  getLastExcelImportTime: () => string | null;
}

const useEmployeeStore = create<EmployeeStore>()(
  persist(
    (set, get) => ({
      employees: [],
      lastExcelImport: null,

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

      bulkImportFromExcel: (employees: ProvinceEmployee[]) => {
        set({
          employees,
          lastExcelImport: new Date().toISOString(),
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

      getLastExcelImportTime: () => {
        return get().lastExcelImport;
      },
    }),
    {
      name: "employee-storage",
    }
  )
);

export default useEmployeeStore;
