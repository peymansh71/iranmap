const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Determine build directory path based on execution environment
const getBuildPath = () => {
  const possiblePaths = [];

  if (process.pkg) {
    // When running as pkg, try embedded assets first
    possiblePaths.push(path.join(__dirname, "build"));
    // Then try external build directory as fallback
    possiblePaths.push(path.join(path.dirname(process.execPath), "build"));
  } else {
    // Normal Node.js execution
    possiblePaths.push(path.join(__dirname, "build"));
  }

  // Find the first path that exists
  for (const buildPath of possiblePaths) {
    if (
      fs.existsSync(buildPath) &&
      fs.existsSync(path.join(buildPath, "index.html"))
    ) {
      console.log(`📁 Using build path: ${buildPath}`);
      return buildPath;
    }
  }

  // Return first path as default if none found
  console.log(`⚠️  No valid build path found, using: ${possiblePaths[0]}`);
  return possiblePaths[0];
};

const buildPath = getBuildPath();

// Serve static files from the React app build directory
app.use(express.static(buildPath));

// API routes (if you need any backend functionality)
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    buildPath: buildPath,
    isPkg: !!process.pkg,
    buildExists: fs.existsSync(buildPath),
    indexExists: fs.existsSync(path.join(buildPath, "index.html")),
    buildContents: fs.existsSync(buildPath)
      ? fs.readdirSync(buildPath).slice(0, 10)
      : [],
  });
});

// Handle React routing, return all requests to React app
app.get("*", (req, res) => {
  const indexPath = path.join(buildPath, "index.html");

  // Check if build directory exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Detailed error information for debugging
    const possiblePaths = [];

    if (process.pkg) {
      possiblePaths.push(path.join(__dirname, "build"));
      possiblePaths.push(path.join(path.dirname(process.execPath), "build"));
    } else {
      possiblePaths.push(path.join(__dirname, "build"));
    }

    const errorInfo = {
      indexPath,
      buildPath,
      isPkg: !!process.pkg,
      execPath: process.execPath,
      dirname: __dirname,
      possiblePaths: possiblePaths.map((p) => ({
        path: p,
        exists: fs.existsSync(p),
        indexExists: fs.existsSync(path.join(p, "index.html")),
      })),
      cwdContents: fs.existsSync(process.cwd())
        ? fs.readdirSync(process.cwd()).slice(0, 10)
        : [],
      dirnameContents: fs.existsSync(__dirname)
        ? fs.readdirSync(__dirname).slice(0, 10)
        : [],
    };

    res.status(404).send(`
      <h1>Iran Map App - Debug Info</h1>
      <h2>Build files not found</h2>
      <pre>${JSON.stringify(errorInfo, null, 2)}</pre>
      <p><strong>Solution:</strong> Make sure the entire /dist folder is copied to Windows, not just the .exe file</p>
      <p>The app expects to find a 'build' folder next to the executable.</p>
    `);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Iran Map Server is running on port ${PORT}`);
  console.log(`📱 Open your browser to: http://localhost:${PORT}`);
  console.log(`📁 Serving from: ${buildPath}`);
  console.log(`📦 Running as pkg executable: ${!!process.pkg}`);
  console.log(`📂 Build directory exists: ${fs.existsSync(buildPath)}`);
  if (fs.existsSync(buildPath)) {
    console.log(
      `📄 Build contents: ${fs.readdirSync(buildPath).slice(0, 5).join(", ")}`
    );
  }
  console.log(`🛑 Press Ctrl+C to stop the server`);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});
