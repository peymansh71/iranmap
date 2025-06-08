import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PROJECT_TYPES, HOTEL_TYPES } from "../constants/index.ts";

interface TemplateConfig {
  sheetName: string;
  headers: string[];
  sampleData?: any[];
  instructions?: string[];
}

export class ExcelTemplateService {
  // Generate Projects Template
  static generateProjectsTemplate() {
    const headers = [
      "نام پروژه (اجباری)",
      "نوع پروژه (اجباری)",
      "استان (اجباری)",
      "عرض جغرافیایی (اجباری)",
      "طول جغرافیایی (اجباری)",
      "وضعیت (فعال/غیرفعال)",
      "توضیحات",
      "بودجه",
      "تاریخ شروع",
      "تاریخ پایان",
      "مدیر پروژه",
      "تلفن تماس",
    ];

    const sampleData = [
      [
        "نمونه پروژه آزادراه",
        "آزادراه و بزرگراه",
        "تهران",
        35.6892,
        51.389,
        "فعال",
        "این یک نمونه پروژه است",
        "1000000000",
        "1402/01/01",
        "1402/12/29",
        "احمد محمدی",
        "09123456789",
      ],
    ];

    const instructions = [
      "راهنمای تکمیل فایل پروژه‌ها:",
      "1. ستون‌های اجباری را حتماً تکمیل کنید",
      "2. نوع پروژه باید از لیست زیر انتخاب شود:",
      ...PROJECT_TYPES.map((type) => `   - ${type}`),
      "3. مختصات جغرافیایی باید به صورت اعشاری باشد (مثال: 35.6892)",
      '4. وضعیت فقط "فعال" یا "غیرفعال" قابل قبول است',
      "5. استان باید نام فارسی صحیح استان باشد",
      "6. سطر اول نمونه است، می‌توانید آن را حذف کنید",
    ];

    return this.createExcelFile(
      {
        sheetName: "پروژه‌ها",
        headers,
        sampleData,
        instructions,
      },
      "template-projects.xlsx"
    );
  }

  // Generate Hotels Template
  static generateHotelsTemplate() {
    const headers = [
      "نام اقامتگاه (اجباری)",
      "نوع اقامتگاه (اجباری)",
      "استان (اجباری)",
      "عرض جغرافیایی (اجباری)",
      "طول جغرافیایی (اجباری)",
      "وضعیت (فعال/غیرفعال)",
      "توضیحات",
      "ظرفیت",
      "تعداد اتاق",
      "امکانات",
      "آدرس",
      "تلفن تماس",
      "وب‌سایت",
    ];

    const sampleData = [
      [
        "نمونه هتل پارسیان",
        "هتل",
        "اصفهان",
        32.6546,
        51.668,
        "فعال",
        "هتل 5 ستاره با امکانات کامل",
        "200",
        "100",
        "استخر، سالن ورزش، رستوران",
        "اصفهان، خیابان چهارباغ",
        "03133445566",
        "www.parsianhotel.com",
      ],
    ];

    const instructions = [
      "راهنمای تکمیل فایل اقامتگاه‌ها:",
      "1. ستون‌های اجباری را حتماً تکمیل کنید",
      "2. نوع اقامتگاه باید از لیست زیر انتخاب شود:",
      ...HOTEL_TYPES.map((type) => `   - ${type}`),
      "3. مختصات جغرافیایی باید به صورت اعشاری باشد",
      '4. وضعیت فقط "فعال" یا "غیرفعال" قابل قبول است',
      "5. استان باید نام فارسی صحیح استان باشد",
      "6. ظرفیت و تعداد اتاق باید عدد باشد",
      "7. سطر اول نمونه است، می‌توانید آن را حذف کنید",
    ];

    return this.createExcelFile(
      {
        sheetName: "اقامتگاه‌ها",
        headers,
        sampleData,
        instructions,
      },
      "template-hotels.xlsx"
    );
  }

  // Generate Employees Template
  static generateEmployeesTemplate() {
    const headers = [
      "استان (اجباری)",
      "تعداد کارکنان (اجباری)",
      "توضیحات",
      "نوع کارکنان",
      "مسئول استان",
      "تلفن تماس",
      "ایمیل",
    ];

    const sampleData = [
      [
        "تهران",
        25,
        "کارکنان بخش فنی و اجرایی",
        "مهندس و تکنسین",
        "علی رضایی",
        "02122334455",
        "tehran@company.com",
      ],
      [
        "اصفهان",
        15,
        "کارکنان نظارت و کنترل کیفیت",
        "ناظر و بازرس",
        "محمد احمدی",
        "03133445566",
        "isfahan@company.com",
      ],
    ];

    const instructions = [
      "راهنمای تکمیل فایل کارکنان:",
      "1. نام استان باید دقیقاً مطابق نام‌های فارسی استان‌ها باشد",
      "2. تعداد کارکنان باید عدد مثبت باشد",
      "3. هر استان فقط یک سطر داشته باشد",
      "4. در صورت وجود کارکنان قبلی، اعداد جدید جایگزین می‌شود",
      "5. سطرهای نمونه را می‌توانید حذف کنید",
    ];

    return this.createExcelFile(
      {
        sheetName: "کارکنان",
        headers,
        sampleData,
        instructions,
      },
      "template-employees.xlsx"
    );
  }

  // Generate Combined Template (All in one file)
  static generateCombinedTemplate() {
    const workbook = XLSX.utils.book_new();

    // Projects Sheet
    const projectsData = [
      [
        "نام پروژه (اجباری)",
        "نوع پروژه (اجباری)",
        "استان (اجباری)",
        "عرض جغرافیایی (اجباری)",
        "طول جغرافیایی (اجباری)",
        "وضعیت (فعال/غیرفعال)",
        "توضیحات",
        "بودجه",
        "تاریخ شروع",
        "تاریخ پایان",
        "مدیر پروژه",
        "تلفن تماس",
      ],
      [
        "نمونه پروژه آزادراه",
        "آزادراه و بزرگراه",
        "تهران",
        35.6892,
        51.389,
        "فعال",
        "این یک نمونه پروژه است",
        "1000000000",
        "1402/01/01",
        "1402/12/29",
        "احمد محمدی",
        "09123456789",
      ],
    ];
    const projectsSheet = XLSX.utils.aoa_to_sheet(projectsData);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, "پروژه‌ها");

    // Hotels Sheet
    const hotelsData = [
      [
        "نام اقامتگاه (اجباری)",
        "نوع اقامتگاه (اجباری)",
        "استان (اجباری)",
        "عرض جغرافیایی (اجباری)",
        "طول جغرافیایی (اجباری)",
        "وضعیت (فعال/غیرفعال)",
        "توضیحات",
        "ظرفیت",
        "تعداد اتاق",
        "امکانات",
        "آدرس",
        "تلفن تماس",
        "وب‌سایت",
      ],
      [
        "نمونه هتل پارسیان",
        "هتل",
        "اصفهان",
        32.6546,
        51.668,
        "فعال",
        "هتل 5 ستاره با امکانات کامل",
        "200",
        "100",
        "استخر، سالن ورزش، رستوران",
        "اصفهان، خیابان چهارباغ",
        "03133445566",
        "www.parsianhotel.com",
      ],
    ];
    const hotelsSheet = XLSX.utils.aoa_to_sheet(hotelsData);
    XLSX.utils.book_append_sheet(workbook, hotelsSheet, "اقامتگاه‌ها");

    // Employees Sheet
    const employeesData = [
      [
        "استان (اجباری)",
        "تعداد کارکنان (اجباری)",
        "توضیحات",
        "نوع کارکنان",
        "مسئول استان",
        "تلفن تماس",
        "ایمیل",
      ],
      [
        "تهران",
        25,
        "کارکنان بخش فنی و اجرایی",
        "مهندس و تکنسین",
        "علی رضایی",
        "02122334455",
        "tehran@company.com",
      ],
      [
        "اصفهان",
        15,
        "کارکنان نظارت و کنترل کیفیت",
        "ناظر و بازرس",
        "محمد احمدی",
        "03133445566",
        "isfahan@company.com",
      ],
    ];
    const employeesSheet = XLSX.utils.aoa_to_sheet(employeesData);
    XLSX.utils.book_append_sheet(workbook, employeesSheet, "کارکنان");

    // Instructions Sheet
    const instructionsData = [
      ["راهنمای استفاده از قالب Excel"],
      [""],
      ["این فایل شامل 3 شیت برای ورود اطلاعات است:"],
      ["1. پروژه‌ها: برای ثبت پروژه‌های عمرانی"],
      ["2. اقامتگاه‌ها: برای ثبت هتل‌ها و اماکن اقامتی"],
      ["3. کارکنان: برای ثبت تعداد کارکنان در هر استان"],
      [""],
      ["نکات مهم:"],
      ["- ستون‌های با کلمه (اجباری) حتماً باید تکمیل شوند"],
      ["- مختصات جغرافیایی باید به صورت اعشاری باشد"],
      ['- وضعیت فقط "فعال" یا "غیرفعال" باشد'],
      ["- نام استان‌ها باید دقیقاً مطابق نام‌های فارسی باشد"],
      [""],
      ["انواع پروژه مجاز:"],
      ...PROJECT_TYPES.map((type) => [type]),
      [""],
      ["انواع اقامتگاه مجاز:"],
      ...HOTEL_TYPES.map((type) => [type]),
    ];
    const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
    XLSX.utils.book_append_sheet(workbook, instructionsSheet, "راهنما");

    // Generate file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `template-complete-${new Date().toISOString().split("T")[0]}.xlsx`
    );
  }

  // Helper method to create Excel file
  private static createExcelFile(config: TemplateConfig, filename: string) {
    const workbook = XLSX.utils.book_new();

    // Create main data sheet
    const sheetData = [config.headers];
    if (config.sampleData) {
      sheetData.push(...config.sampleData);
    }
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, config.sheetName);

    // Create instructions sheet if provided
    if (config.instructions) {
      const instructionsData = config.instructions.map((instruction) => [
        instruction,
      ]);
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, "راهنما");
    }

    // Generate and download file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, filename);
  }

  // Parse uploaded Excel file
  static async parseExcelFile(file: File): Promise<{
    projects?: any[];
    hotels?: any[];
    employees?: any[];
    errors?: string[];
  }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });

          const result: any = {};
          const errors: string[] = [];

          // Parse Projects sheet
          if (workbook.SheetNames.includes("پروژه‌ها")) {
            try {
              const projectsSheet = workbook.Sheets["پروژه‌ها"];
              const projectsData = XLSX.utils.sheet_to_json(projectsSheet, {
                header: 1,
              });
              result.projects = this.parseProjectsData(projectsData as any[][]);
            } catch (error) {
              errors.push(`خطا در پردازش شیت پروژه‌ها: ${error}`);
            }
          }

          // Parse Hotels sheet
          if (workbook.SheetNames.includes("اقامتگاه‌ها")) {
            try {
              const hotelsSheet = workbook.Sheets["اقامتگاه‌ها"];
              const hotelsData = XLSX.utils.sheet_to_json(hotelsSheet, {
                header: 1,
              });
              result.hotels = this.parseHotelsData(hotelsData as any[][]);
            } catch (error) {
              errors.push(`خطا در پردازش شیت اقامتگاه‌ها: ${error}`);
            }
          }

          // Parse Employees sheet
          if (workbook.SheetNames.includes("کارکنان")) {
            try {
              const employeesSheet = workbook.Sheets["کارکنان"];
              const employeesData = XLSX.utils.sheet_to_json(employeesSheet, {
                header: 1,
              });
              result.employees = this.parseEmployeesData(
                employeesData as any[][]
              );
            } catch (error) {
              errors.push(`خطا در پردازش شیت کارکنان: ${error}`);
            }
          }

          if (errors.length > 0) {
            result.errors = errors;
          }

          resolve(result);
        } catch (error) {
          reject(new Error(`خطا در خواندن فایل Excel: ${error}`));
        }
      };

      reader.onerror = () => reject(new Error("خطا در خواندن فایل"));
      reader.readAsArrayBuffer(file);
    });
  }

  // Parse projects data from Excel
  private static parseProjectsData(data: any[][]): any[] {
    if (!data || data.length < 2) return [];

    const headers = data[0];
    const projects = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const project = {
        name: row[0]?.toString().trim(),
        type: row[1]?.toString().trim(),
        provinceName: row[2]?.toString().trim(),
        coordinates: [parseFloat(row[3]) || 0, parseFloat(row[4]) || 0] as [
          number,
          number
        ],
        isActive: row[5]?.toString().trim() === "فعال",
        category: "project",
        description: row[6]?.toString().trim() || "",
        budget: row[7]?.toString().trim() || "",
        startDate: row[8]?.toString().trim() || "",
        endDate: row[9]?.toString().trim() || "",
        manager: row[10]?.toString().trim() || "",
        phone: row[11]?.toString().trim() || "",
      };

      // Validate required fields
      if (
        project.name &&
        project.type &&
        project.provinceName &&
        project.coordinates[0] !== 0 &&
        project.coordinates[1] !== 0
      ) {
        projects.push(project);
      }
    }

    return projects;
  }

  // Parse hotels data from Excel
  private static parseHotelsData(data: any[][]): any[] {
    if (!data || data.length < 2) return [];

    const hotels = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const hotel = {
        name: row[0]?.toString().trim(),
        type: row[1]?.toString().trim(),
        provinceName: row[2]?.toString().trim(),
        coordinates: [parseFloat(row[3]) || 0, parseFloat(row[4]) || 0] as [
          number,
          number
        ],
        isActive: row[5]?.toString().trim() === "فعال",
        category: "hotel",
        description: row[6]?.toString().trim() || "",
        capacity: row[7]?.toString().trim() || "",
        rooms: row[8]?.toString().trim() || "",
        facilities: row[9]?.toString().trim() || "",
        address: row[10]?.toString().trim() || "",
        phone: row[11]?.toString().trim() || "",
        website: row[12]?.toString().trim() || "",
      };

      // Validate required fields
      if (
        hotel.name &&
        hotel.type &&
        hotel.provinceName &&
        hotel.coordinates[0] !== 0 &&
        hotel.coordinates[1] !== 0
      ) {
        hotels.push(hotel);
      }
    }

    return hotels;
  }

  // Parse employees data from Excel
  private static parseEmployeesData(data: any[][]): any[] {
    if (!data || data.length < 2) return [];

    const employees = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length === 0) continue;

      const employee = {
        provinceName: row[0]?.toString().trim(),
        employeeCount: parseInt(row[1]) || 0,
        description: row[2]?.toString().trim() || "",
        type: row[3]?.toString().trim() || "",
        manager: row[4]?.toString().trim() || "",
        phone: row[5]?.toString().trim() || "",
        email: row[6]?.toString().trim() || "",
      };

      // Validate required fields
      if (employee.provinceName && employee.employeeCount > 0) {
        employees.push(employee);
      }
    }

    return employees;
  }
}
