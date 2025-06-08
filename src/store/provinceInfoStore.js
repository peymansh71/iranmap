import { create } from "zustand";
import { persist } from "zustand/middleware";

// List of all provinces
const allProvinces = [
  {
    id: "Khorasan Jonubi",
    name_fa: "خراسان جنوبی",
    name_en: "Khorasan Jonubi",
  },
  {
    id: "Azarbayjan Sharghi",
    name_fa: "آذربایجان شرقی",
    name_en: "Azarbayjan Sharghi",
  },
  {
    id: "Azarbayjan Gharbi",
    name_fa: "آذربایجان غربی",
    name_en: "Azarbayjan Gharbi",
  },
  { id: "Ardebil", name_fa: "اردبیل", name_en: "Ardebil" },
  { id: "Esfehan", name_fa: "اصفهان", name_en: "Esfehan" },
  { id: "Alborz", name_fa: "البرز", name_en: "Alborz" },
  { id: "Ilam", name_fa: "ایلام", name_en: "Ilam" },
  { id: "Bushehr", name_fa: "بوشهر", name_en: "Bushehr" },
  { id: "Tehran", name_fa: "تهران", name_en: "Tehran" },
  {
    id: "Chahar Mahal va Bakhtiari",
    name_fa: "چهارمحال و بختیاری",
    name_en: "Chahar Mahal va Bakhtiari",
  },
  { id: "Khorasan Razavi", name_fa: "خراسان رضوی", name_en: "Khorasan Razavi" },
  {
    id: "Khorasan Shomali",
    name_fa: "خراسان شمالی",
    name_en: "Khorasan Shomali",
  },
  { id: "Khuzestan", name_fa: "خوزستان", name_en: "Khuzestan" },
  { id: "Zanjan", name_fa: "زنجان", name_en: "Zanjan" },
  { id: "Semnan", name_fa: "سمنان", name_en: "Semnan" },
  {
    id: "Sistan va Baluchestan",
    name_fa: "سیستان و بلوچستان",
    name_en: "Sistan va Baluchestan",
  },
  { id: "Fars", name_fa: "فارس", name_en: "Fars" },
  { id: "Qazvin", name_fa: "قزوین", name_en: "Qazvin" },
  { id: "Qom", name_fa: "قم", name_en: "Qom" },
  { id: "Kordestan", name_fa: "کردستان", name_en: "Kordestan" },
  { id: "Kerman", name_fa: "کرمان", name_en: "Kerman" },
  { id: "Kermanshah", name_fa: "کرمانشاه", name_en: "Kermanshah" },
  {
    id: "Kohgiluye va Boyerahmad",
    name_fa: "کهگیلویه و بویراحمد",
    name_en: "Kohgiluye va Boyerahmad",
  },
  { id: "Golestan", name_fa: "گلستان", name_en: "Golestan" },
  { id: "Gilan", name_fa: "گیلان", name_en: "Gilan" },
  { id: "Lorestan", name_fa: "لرستان", name_en: "Lorestan" },
  { id: "Mazandaran", name_fa: "مازندران", name_en: "Mazandaran" },
  { id: "Markazi", name_fa: "مرکزی", name_en: "Markazi" },
  { id: "Hormozgan", name_fa: "هرمزگان", name_en: "Hormozgan" },
  { id: "Hamedan", name_fa: "همدان", name_en: "Hamedan" },
  { id: "Yazd", name_fa: "یزد", name_en: "Yazd" },
];

// Initialize province info with empty projects for all provinces
const initialProvinceInfo = allProvinces.map((province) => ({
  province,
  projects: [], // Changed from fields to projects
}));

// Migration function to fix existing data
const migrateProvinceData = (existingData) => {
  if (!existingData || !Array.isArray(existingData)) {
    return initialProvinceInfo;
  }

  return allProvinces.map((province) => {
    // Find existing data for this province
    const existingProvince = existingData.find((item) => {
      if (typeof item.province === "string") {
        return item.province === province.name_fa;
      }
      return item.province?.id === province.id;
    });

    // Migrate old structure to new project-based structure
    if (existingProvince?.fields && !existingProvince?.projects) {
      return {
        province,
        projects:
          existingProvince.fields.length > 0
            ? [
                {
                  name: "پروژه قدیم", // Default name for migrated data
                  type: "ابنیه", // Default type for migrated data
                  category: "project", // Default category
                  fields: existingProvince.fields,
                },
              ]
            : [],
      };
    }

    // Add category to existing projects if missing
    const updatedProjects = (existingProvince?.projects || []).map(
      (project) => ({
        ...project,
        category: project.category || "project", // Default to project if category is missing
        isActive: project.isActive !== undefined ? project.isActive : true, // Default to active if missing
      })
    );

    return {
      province,
      projects: updatedProjects,
    };
  });
};

const useProvinceInfoStore = create(
  persist(
    (set, get) => ({
      provinceInfoList: initialProvinceInfo,
      addProvinceInfo: (province, project, fields) =>
        set((state) => ({
          provinceInfoList: state.provinceInfoList.map((info) => {
            if (info.province.id === province.id) {
              // Check if project already exists
              const existingProjectIndex = info.projects.findIndex(
                (p) => p.name === project.name
              );

              if (existingProjectIndex >= 0) {
                // Update existing project
                const updatedProjects = [...info.projects];
                updatedProjects[existingProjectIndex] = {
                  name: project.name,
                  type: project.type,
                  coordinates: project.coordinates,
                  category: project.category || "project",
                  isActive:
                    project.isActive !== undefined ? project.isActive : true,
                  fields,
                };
                return { ...info, projects: updatedProjects };
              } else {
                // Add new project/hotel
                return {
                  ...info,
                  projects: [
                    ...info.projects,
                    {
                      name: project.name,
                      type: project.type,
                      coordinates: project.coordinates,
                      category: project.category || "project",
                      isActive:
                        project.isActive !== undefined
                          ? project.isActive
                          : true,
                      fields,
                    },
                  ],
                };
              }
            }
            return info;
          }),
        })),
      getProvinceInfoByName: (provinceId) => {
        const state = get();
        return state.provinceInfoList.find(
          (info) => info.province.id === provinceId
        );
      },
      getProvinceByName: (provinceName) => {
        const state = get();
        const provinceInfo = state.provinceInfoList.find(
          (info) => info.province.name_fa === provinceName
        );
        return provinceInfo ? provinceInfo.province : null;
      },
      // Add a function to reset the store to initial state
      resetStore: () => set({ provinceInfoList: initialProvinceInfo }),
    }),
    {
      name: "province-info-storage",
      // Add migration function to the persist middleware
      migrate: (persistedState, version) => {
        if (version < 3) {
          return {
            ...persistedState,
            provinceInfoList: migrateProvinceData(
              persistedState.provinceInfoList
            ),
          };
        }
        return persistedState;
      },
      version: 3, // Increment version to trigger migration
    }
  )
);

export default useProvinceInfoStore;
