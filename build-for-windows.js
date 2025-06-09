const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

console.log("🚀 Building Iran Map for Windows...\n");

// Step 1: Build React app
console.log("📦 Building React application...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ React build completed\n");
} catch (error) {
  console.error("❌ React build failed:", error.message);
  process.exit(1);
}

// Step 2: Install dependencies if needed
console.log("📦 Installing production dependencies...");
try {
  execSync("npm install --production=false", { stdio: "inherit" });
  console.log("✅ Dependencies installed\n");
} catch (error) {
  console.error("❌ Dependency installation failed:", error.message);
  process.exit(1);
}

// Step 3: Create executable with pkg
console.log("🔨 Creating Windows executable...");
try {
  // Ensure dist directory exists
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist");
  }

  execSync(
    "npx pkg server.js --targets node18-win-x64 --output dist/iran-map-windows.exe",
    { stdio: "inherit" }
  );
  console.log("✅ Windows executable created\n");
} catch (error) {
  console.error("❌ Executable creation failed:", error.message);
  process.exit(1);
}

// Step 4: Copy build directory to dist (fallback for pkg issues)
console.log("📁 Copying build directory...");
try {
  const sourceBuildPath = "build";
  const destBuildPath = "dist/build";

  // Remove existing build directory in dist
  if (fs.existsSync(destBuildPath)) {
    fs.rmSync(destBuildPath, { recursive: true, force: true });
  }

  // Copy build directory
  copyDirectoryRecursive(sourceBuildPath, destBuildPath);
  console.log("✅ Build directory copied to dist/build\n");
} catch (error) {
  console.error("❌ Build directory copying failed:", error.message);
  // Don't exit - this is a fallback
}

// Step 5: Copy additional files to dist
console.log("📁 Copying additional files...");
try {
  // Copy batch files
  if (fs.existsSync("start-iran-map.bat")) {
    fs.copyFileSync("start-iran-map.bat", "dist/start-iran-map.bat");
  }

  if (fs.existsSync("start-iran-map.ps1")) {
    fs.copyFileSync("start-iran-map.ps1", "dist/start-iran-map.ps1");
  }

  console.log("✅ Additional files copied\n");
} catch (error) {
  console.error("❌ File copying failed:", error.message);
}

// Step 6: Create README for Windows users
console.log("📄 Creating user documentation...");
const readmeContent = `# Iran Map - Windows Application

## Quick Start
1. Double-click \`start-iran-map.bat\` to run the application
2. Your browser will automatically open to http://localhost:3000
3. Close the command window to stop the application

## Alternative Start Methods
- **Batch File**: Double-click \`start-iran-map.bat\`
- **PowerShell**: Right-click \`start-iran-map.ps1\` → "Run with PowerShell"
- **Manual**: Run \`iran-map-windows.exe\` and open http://localhost:3000

## System Requirements
- Windows 10 or later
- Modern web browser (Chrome, Firefox, Edge)
- No additional software installation required

## Port Configuration
The application runs on port 3000. If this port is busy, the server will show an error.
To use a different port, run: \`iran-map-windows.exe\` with environment variable \`PORT=8080\`

## Troubleshooting
1. **Port already in use**: Close other applications or restart your computer
2. **Firewall warning**: Allow the application through Windows Firewall
3. **Browser doesn't open**: Manually navigate to http://localhost:3000

## Support
This is the Iran Map visualization application packaged for Windows.
Version: 1.0.0
Built: ${new Date().toISOString()}
`;

try {
  fs.writeFileSync("dist/README.txt", readmeContent);
  console.log("✅ README created\n");
} catch (error) {
  console.error("❌ README creation failed:", error.message);
}

// Step 7: Display summary
console.log("🎉 Build completed successfully!\n");
console.log("📂 Distribution files created in /dist:");
console.log("   • iran-map-windows.exe (Main application)");
console.log("   • build/ (React app files)");
console.log("   • start-iran-map.bat (Quick start script)");
console.log("   • start-iran-map.ps1 (PowerShell script)");
console.log("   • README.txt (User instructions)\n");

// Get file sizes
try {
  const exeStats = fs.statSync("dist/iran-map-windows.exe");
  const sizeMB = (exeStats.size / (1024 * 1024)).toFixed(1);
  console.log(`📊 Executable size: ${sizeMB} MB`);

  if (fs.existsSync("dist/build")) {
    console.log(`📊 Build directory: Present as fallback`);
  }
} catch (error) {
  console.log("📊 Could not determine file size");
}

console.log("\n🚚 Ready for distribution to Windows users!");
console.log("💡 Share the entire /dist folder with your client.");

// Helper function to copy directory recursively
function copyDirectoryRecursive(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyDirectoryRecursive(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}
