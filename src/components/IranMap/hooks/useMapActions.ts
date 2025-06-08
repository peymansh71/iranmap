import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../../store/authStore.js";
import { Province, Field } from "../types/index.ts";

interface UseMapActionsProps {
  selectedAddProvince: Province | null;
  clickCoordinates: [number, number] | null;
  projectName: string;
  projectType: string;
  projectIsActive: boolean;
  hotelName: string;
  hotelType: string;
  hotelIsActive: boolean;
  fields: Field[];
  allProjects: any[];
  addProvinceInfo: (province: Province, data: any, fields: Field[]) => void;
  setLoading: (loading: boolean) => void;
  showNotification: (
    message: string,
    severity: "success" | "error" | "info"
  ) => void;
  resetProjectForm: () => void;
  resetHotelForm: () => void;
  openInfoModal: (province: Province) => void;
}

export const useMapActions = ({
  selectedAddProvince,
  clickCoordinates,
  projectName,
  projectType,
  projectIsActive,
  hotelName,
  hotelType,
  hotelIsActive,
  fields,
  allProjects,
  addProvinceInfo,
  setLoading,
  showNotification,
  resetProjectForm,
  resetHotelForm,
  openInfoModal,
}: UseMapActionsProps) => {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    navigate("/login");
  }, [logout, navigate]);

  // Add project with loading state
  const handleAddProject = useCallback(async () => {
    if (
      !selectedAddProvince ||
      !projectName.trim() ||
      !projectType.trim() ||
      !clickCoordinates
    ) {
      showNotification("لطفاً همه فیلدها را تکمیل کنید", "error");
      return;
    }

    setLoading(true);

    try {
      const filteredFields = fields.filter((f) => f.label && f.value !== "");
      if (filteredFields.length === 0) {
        showNotification("حداقل یک فیلد باید تکمیل شود", "error");
        return;
      }

      const projectData = {
        name: projectName.trim(),
        type: projectType.trim(),
        coordinates: clickCoordinates,
        category: "project",
        isActive: projectIsActive,
      };

      addProvinceInfo(selectedAddProvince, projectData, filteredFields);
      resetProjectForm();
      openInfoModal(selectedAddProvince);
      showNotification("پروژه با موفقیت اضافه شد", "success");
    } catch (error) {
      showNotification("خطا در افزودن پروژه", "error");
    } finally {
      setLoading(false);
    }
  }, [
    selectedAddProvince,
    projectName,
    projectType,
    clickCoordinates,
    projectIsActive,
    fields,
    addProvinceInfo,
    setLoading,
    showNotification,
    resetProjectForm,
    openInfoModal,
  ]);

  // Add hotel with loading state
  const handleAddHotel = useCallback(async () => {
    if (
      !selectedAddProvince ||
      !hotelName.trim() ||
      !hotelType.trim() ||
      !clickCoordinates
    ) {
      showNotification("لطفاً همه فیلدها را تکمیل کنید", "error");
      return;
    }

    setLoading(true);

    try {
      const filteredFields = fields.filter((f) => f.label && f.value !== "");
      if (filteredFields.length === 0) {
        showNotification("حداقل یک فیلد باید تکمیل شود", "error");
        return;
      }

      const hotelData = {
        name: hotelName.trim(),
        type: hotelType.trim(),
        coordinates: clickCoordinates,
        category: "hotel",
        isActive: hotelIsActive,
      };

      addProvinceInfo(selectedAddProvince, hotelData, filteredFields);
      resetHotelForm();
      openInfoModal(selectedAddProvince);
      showNotification("اقامتگاه با موفقیت اضافه شد", "success");
    } catch (error) {
      showNotification("خطا در افزودن اقامتگاه", "error");
    } finally {
      setLoading(false);
    }
  }, [
    selectedAddProvince,
    hotelName,
    hotelType,
    clickCoordinates,
    hotelIsActive,
    fields,
    addProvinceInfo,
    setLoading,
    showNotification,
    resetHotelForm,
    openInfoModal,
  ]);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const csvContent = [
      ["نام", "نوع", "دسته", "استان", "وضعیت", "مختصات عرض", "مختصات طول"],
      ...allProjects.map((item) => [
        item.name,
        item.type,
        item.category === "hotel" ? "اقامتگاه" : "پروژه",
        item.provinceName,
        item.isActive ? "فعال" : "غیرفعال",
        item.coordinates[0],
        item.coordinates[1],
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `iran-map-data-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("داده‌ها با موفقیت به فرمت CSV صادر شد", "success");
  }, [allProjects, showNotification]);

  // Export to JSON
  const exportToJSON = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      totalProjects: allProjects.filter((p) => p.category !== "hotel").length,
      totalHotels: allProjects.filter((p) => p.category === "hotel").length,
      data: allProjects.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        category: item.category,
        provinceName: item.provinceName,
        coordinates: item.coordinates,
        isActive: item.isActive,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `iran-map-data-${new Date().toISOString().split("T")[0]}.json`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification("داده‌ها با موفقیت به فرمت JSON صادر شد", "success");
  }, [allProjects, showNotification]);

  return {
    handleLogout,
    handleAddProject,
    handleAddHotel,
    exportToCSV,
    exportToJSON,
  };
};
