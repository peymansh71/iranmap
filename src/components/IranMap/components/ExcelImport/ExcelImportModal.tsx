import React, { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Chip,
} from "@mui/material";
import {
  CloudUpload as CloudUploadIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { ExcelTemplateService } from "../../services/excelTemplateService.ts";
import useProvinceInfoStore from "../../../../store/provinceInfoStore.js";
import useEmployeeStore from "../../../../store/employeeStore.ts";

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete: (
    message: string,
    severity: "success" | "error" | "info"
  ) => void;
}

interface ImportResult {
  projects?: any[];
  hotels?: any[];
  employees?: any[];
  errors?: string[];
}

const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  open,
  onClose,
  onImportComplete,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  // Store hooks
  const {
    addProvinceInfo,
    getProvinceByName,
    bulkImportProjectsFromExcel,
    bulkImportHotelsFromExcel,
  } = useProvinceInfoStore();
  const { addOrUpdateEmployees, bulkImportFromExcel } = useEmployeeStore();

  // Handle file upload
  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.name.match(/\.(xlsx|xls)$/)) {
        onImportComplete(
          "فقط فایل‌های Excel (.xlsx, .xls) قابل قبول هستند",
          "error"
        );
        return;
      }

      setUploading(true);
      setProgress(0);
      setImportResult(null);

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        // Parse Excel file
        const result = await ExcelTemplateService.parseExcelFile(file);

        clearInterval(progressInterval);
        setProgress(100);

        setImportResult(result);

        // Show summary
        const totalItems =
          (result.projects?.length || 0) +
          (result.hotels?.length || 0) +
          (result.employees?.length || 0);

        if (totalItems > 0) {
          onImportComplete(
            `فایل با موفقیت بارگذاری شد. ${totalItems} مورد آماده وارد شدن است.`,
            "success"
          );
        } else {
          onImportComplete("هیچ داده معتبری در فایل یافت نشد", "error");
        }
      } catch (error) {
        onImportComplete(`خطا در پردازش فایل: ${error}`, "error");
      } finally {
        setUploading(false);
        // Reset file input
        event.target.value = "";
      }
    },
    [onImportComplete]
  );

  // Handle data import
  const handleImportData = useCallback(async () => {
    if (!importResult) return;

    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Import projects using bulk function
      if (importResult.projects && importResult.projects.length > 0) {
        try {
          // Group projects by province
          const projectsByProvince = new Map();

          for (const project of importResult.projects) {
            const province = getProvinceByName(project.provinceName);
            if (province) {
              if (!projectsByProvince.has(province.name_fa)) {
                projectsByProvince.set(province.name_fa, {
                  province,
                  projects: [],
                });
              }

              // Convert to expected format
              const fields = [
                { label: "توضیحات", value: project.description },
                { label: "بودجه", value: project.budget },
                { label: "تاریخ شروع", value: project.startDate },
                { label: "تاریخ پایان", value: project.endDate },
                { label: "مدیر پروژه", value: project.manager },
                { label: "تلفن تماس", value: project.phone },
              ].filter((f) => f.value);

              const projectData = {
                name: project.name,
                type: project.type,
                coordinates: project.coordinates,
                category: "project",
                isActive: project.isActive,
                fields,
              };

              projectsByProvince
                .get(province.name_fa)
                .projects.push(projectData);
              successCount++;
            } else {
              errorCount++;
            }
          }

          // Bulk import projects
          if (projectsByProvince.size > 0) {
            bulkImportProjectsFromExcel(
              Array.from(projectsByProvince.values())
            );
          }
        } catch (error) {
          console.error("Error importing projects:", error);
          errorCount += importResult.projects.length;
        }
      }

      // Import hotels using bulk function
      if (importResult.hotels && importResult.hotels.length > 0) {
        try {
          // Group hotels by province
          const hotelsByProvince = new Map();

          for (const hotel of importResult.hotels) {
            const province = getProvinceByName(hotel.provinceName);
            if (province) {
              if (!hotelsByProvince.has(province.name_fa)) {
                hotelsByProvince.set(province.name_fa, {
                  province,
                  hotels: [],
                });
              }

              const fields = [
                { label: "توضیحات", value: hotel.description },
                { label: "ظرفیت", value: hotel.capacity },
                { label: "تعداد اتاق", value: hotel.rooms },
                { label: "امکانات", value: hotel.facilities },
                { label: "آدرس", value: hotel.address },
                { label: "تلفن تماس", value: hotel.phone },
                { label: "وب‌سایت", value: hotel.website },
              ].filter((f) => f.value);

              const hotelData = {
                name: hotel.name,
                type: hotel.type,
                coordinates: hotel.coordinates,
                category: "hotel",
                isActive: hotel.isActive,
                fields,
              };

              hotelsByProvince.get(province.name_fa).hotels.push(hotelData);
              successCount++;
            } else {
              errorCount++;
            }
          }

          // Bulk import hotels
          if (hotelsByProvince.size > 0) {
            bulkImportHotelsFromExcel(Array.from(hotelsByProvince.values()));
          }
        } catch (error) {
          console.error("Error importing hotels:", error);
          errorCount += importResult.hotels.length;
        }
      }

      // Import employees using bulk function
      if (importResult.employees && importResult.employees.length > 0) {
        try {
          // Convert to expected format
          const employeesData: Array<{
            provinceId: number;
            provinceName: string;
            employeeCount: number;
          }> = [];

          for (const employee of importResult.employees) {
            const province = getProvinceByName(employee.provinceName);
            if (province) {
              employeesData.push({
                provinceId: province.id,
                provinceName: province.name_fa,
                employeeCount: employee.employeeCount,
              });
              successCount++;
            } else {
              errorCount++;
            }
          }

          // Bulk import employees
          if (employeesData.length > 0) {
            bulkImportFromExcel(employeesData);
          }
        } catch (error) {
          console.error("Error importing employees:", error);
          errorCount += importResult.employees.length;
        }
      }

      // Show result
      if (successCount > 0) {
        onImportComplete(
          `وارد کردن داده‌ها با موفقیت انجام شد. ${successCount} مورد اضافه شد${
            errorCount > 0 ? ` و ${errorCount} مورد با خطا مواجه شد` : ""
          }. زمان آخرین به‌روزرسانی ثبت شد.`,
          errorCount > 0 ? "info" : "success"
        );
        setImportResult(null);
        onClose();
      } else {
        onImportComplete("هیچ داده‌ای وارد نشد", "error");
      }
    } catch (error) {
      onImportComplete(`خطا در وارد کردن داده‌ها: ${error}`, "error");
    } finally {
      setUploading(false);
    }
  }, [
    importResult,
    addProvinceInfo,
    bulkImportProjectsFromExcel,
    bulkImportHotelsFromExcel,
    addOrUpdateEmployees,
    bulkImportFromExcel,
    getProvinceByName,
    onImportComplete,
    onClose,
  ]);

  // Download template handlers
  const handleDownloadProjectsTemplate = () => {
    ExcelTemplateService.generateProjectsTemplate();
    onImportComplete("قالب پروژه‌ها دانلود شد", "success");
  };

  const handleDownloadHotelsTemplate = () => {
    ExcelTemplateService.generateHotelsTemplate();
    onImportComplete("قالب اقامتگاه‌ها دانلود شد", "success");
  };

  const handleDownloadEmployeesTemplate = () => {
    ExcelTemplateService.generateEmployeesTemplate();
    onImportComplete("قالب نیروها دانلود شد", "success");
  };

  const handleDownloadCombinedTemplate = () => {
    ExcelTemplateService.generateCombinedTemplate();
    onImportComplete("قالب کامل دانلود شد", "success");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth dir="rtl">
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">بارگذاری و دانلود قالب Excel</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="دانلود قالب" />
          <Tab label="بارگذاری فایل" />
          {importResult && <Tab label="بررسی داده‌ها" />}
        </Tabs>

        <Box mt={2}>
          {/* Download Templates Tab */}
          {activeTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                دانلود قالب‌های Excel
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                برای وارد کردن داده‌ها به صورت دسته‌ای، ابتدا قالب مناسب را
                دانلود کنید، آن را تکمیل کرده و سپس بارگذاری کنید.
              </Typography>

              <Box display="flex" flexDirection="column" gap={2}>
                <Card>
                  <CardContent>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography variant="h6">قالب کامل</Typography>
                        <Typography variant="body2" color="textSecondary">
                          شامل تمام بخش‌ها: پروژه‌ها، اقامتگاه‌ها و نیروها
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleDownloadCombinedTemplate}
                      >
                        دانلود
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Box display="flex" gap={2}>
                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        پروژه‌ها
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        قالب ثبت پروژه‌های عمرانی
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleDownloadProjectsTemplate}
                        fullWidth
                      >
                        دانلود قالب پروژه‌ها
                      </Button>
                    </CardContent>
                  </Card>

                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        اقامتگاه‌ها
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        قالب ثبت هتل‌ها و اماکن اقامتی
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleDownloadHotelsTemplate}
                        fullWidth
                      >
                        دانلود قالب اقامتگاه‌ها
                      </Button>
                    </CardContent>
                  </Card>

                  <Card sx={{ flex: 1 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        نیروها
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        paragraph
                      >
                        قالب ثبت تعداد نیروها هر استان
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleDownloadEmployeesTemplate}
                        fullWidth
                      >
                        دانلود قالب نیروها
                      </Button>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Box>
          )}

          {/* Upload File Tab */}
          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                بارگذاری فایل Excel
              </Typography>

              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                    p={4}
                    border="2px dashed #ccc"
                    borderRadius={2}
                  >
                    <CloudUploadIcon
                      sx={{ fontSize: 64, color: "action.disabled" }}
                    />
                    <Typography variant="h6">
                      فایل Excel خود را انتخاب کنید
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      textAlign="center"
                    >
                      فرمت‌های پشتیبانی شده: .xlsx, .xls
                      <br />
                      حداکثر حجم: 10 مگابایت
                    </Typography>

                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                      id="excel-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="excel-upload">
                      <Button
                        variant="contained"
                        component="span"
                        disabled={uploading}
                        startIcon={<CloudUploadIcon />}
                      >
                        انتخاب فایل
                      </Button>
                    </label>
                  </Box>
                </CardContent>
              </Card>

              {uploading && (
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom>
                    در حال پردازش فایل...
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} />
                </Box>
              )}
            </Box>
          )}

          {/* Data Review Tab */}
          {activeTab === 2 && importResult && (
            <Box>
              <Typography variant="h6" gutterBottom>
                بررسی داده‌های بارگذاری شده
              </Typography>

              {importResult.errors && importResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    تعدادی خطا در پردازش فایل:
                  </Typography>
                  <List dense>
                    {importResult.errors.map((error, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={error} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}

              <Box display="flex" gap={2} mb={2}>
                {importResult.projects && (
                  <Chip
                    icon={<InfoIcon />}
                    label={`${importResult.projects.length} پروژه`}
                    color="primary"
                  />
                )}
                {importResult.hotels && (
                  <Chip
                    icon={<InfoIcon />}
                    label={`${importResult.hotels.length} اقامتگاه`}
                    color="secondary"
                  />
                )}
                {importResult.employees && (
                  <Chip
                    icon={<InfoIcon />}
                    label={`${importResult.employees.length} استان (نیروها)`}
                    color="success"
                  />
                )}
              </Box>

              {/* Projects preview */}
              {importResult.projects && importResult.projects.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      پروژه‌ها ({importResult.projects.length})
                    </Typography>
                    <List dense>
                      {importResult.projects
                        .slice(0, 5)
                        .map((project, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText
                              primary={project.name}
                              secondary={`${project.type} - ${project.provinceName}`}
                            />
                          </ListItem>
                        ))}
                      {importResult.projects.length > 5 && (
                        <ListItem>
                          <ListItemText
                            primary={`... و ${
                              importResult.projects.length - 5
                            } پروژه دیگر`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Hotels preview */}
              {importResult.hotels && importResult.hotels.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      اقامتگاه‌ها ({importResult.hotels.length})
                    </Typography>
                    <List dense>
                      {importResult.hotels.slice(0, 5).map((hotel, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={hotel.name}
                            secondary={`${hotel.type} - ${hotel.provinceName}`}
                          />
                        </ListItem>
                      ))}
                      {importResult.hotels.length > 5 && (
                        <ListItem>
                          <ListItemText
                            primary={`... و ${
                              importResult.hotels.length - 5
                            } اقامتگاه دیگر`}
                          />
                        </ListItem>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Employees preview */}
              {importResult.employees && importResult.employees.length > 0 && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      نیروهای ({importResult.employees.length} استان)
                    </Typography>
                    <List dense>
                      {importResult.employees.map((employee, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckCircleIcon color="success" />
                          </ListItemIcon>
                          <ListItemText
                            primary={employee.provinceName}
                            secondary={`${employee.employeeCount} نیرو`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={uploading}>
          بستن
        </Button>
        {importResult && activeTab === 2 && (
          <Button
            variant="contained"
            onClick={handleImportData}
            disabled={uploading}
            startIcon={!uploading ? <CheckCircleIcon /> : undefined}
          >
            {uploading ? "در حال وارد کردن..." : "وارد کردن داده‌ها"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExcelImportModal;
