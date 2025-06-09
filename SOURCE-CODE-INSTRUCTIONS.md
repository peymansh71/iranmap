# Iran Map - Source Code Instructions

## 📋 Overview

This package contains the complete source code for the Iran Map application. Your client can modify, build, and deploy the application on their own.

## 📦 What's Included

```
iran-map-source-code.zip (39MB)
├── 📁 src/                          # React application source code
├── 📁 public/                       # Static assets and HTML template
├── 📄 package.json                  # Dependencies and scripts
├── 📄 package-lock.json             # Locked dependency versions
├── 📄 server.js                     # Express server for Windows deployment
├── 📄 build-for-windows.js          # Windows build automation script
├── 📄 start-iran-map.bat            # Windows startup script
├── 📄 start-iran-map.ps1            # PowerShell startup script
├── 📄 WINDOWS-DEPLOYMENT-GUIDE.md   # Detailed deployment guide
└── 📄 README.md                     # Project documentation
```

## 🛠️ System Requirements

### Development Environment:

- **Node.js 18.x or 20.x** (recommended: https://nodejs.org/)
- **npm** (comes with Node.js)
- **Modern code editor** (VS Code, WebStorm, etc.)
- **Git** (optional, for version control)

### For Windows Deployment:

- **Windows 10 or later** (for testing the executable)
- **Modern web browser** (Chrome, Firefox, Edge)

## 🚀 Quick Start

### 1. Extract and Setup

```bash
# Extract the zip file to your preferred location
# Open terminal/command prompt in the extracted folder

# Install dependencies
npm install
```

### 2. Development Mode

```bash
# Start development server (hot reload)
npm start
```

The app will open at `http://localhost:3000`

### 3. Build for Production

```bash
# Build React app for production
npm run build
```

### 4. Build Windows Executable

```bash
# Build complete Windows package
npm run package:windows
```

## 📁 Project Structure

### Core Application (`src/`)

```
src/
├── components/
│   ├── IranMap/                 # Main map component
│   │   ├── components/          # Map sub-components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # Business logic services
│   │   ├── constants/           # Configuration constants
│   │   └── types/               # TypeScript type definitions
│   └── Login/                   # Authentication component
├── store/                       # State management (Zustand)
├── styles/                      # Global CSS styles
└── data/                        # Static data files
```

### Key Files:

- **`src/App.jsx`** - Main application component
- **`src/components/IranMap/IranMapContainer.tsx`** - Main map container
- **`server.js`** - Express server for Windows deployment
- **`package.json`** - Project configuration and dependencies

## 🔧 Available Scripts

### Development:

```bash
npm start          # Start development server
npm test           # Run tests
npm run build      # Build for production
```

### Windows Deployment:

```bash
npm run server              # Test Express server locally
npm run package:windows     # Build complete Windows package
npm run build:windows       # Build executable only
```

## 🗺️ Map Configuration

### Offline Mode:

The app is configured for **offline use** - no internet required. Map tiles are replaced with province boundaries.

### To Enable Online Maps (Optional):

Edit `src/components/IranMap/components/MapView/MapView.tsx`:

```javascript
// Uncomment this line for online map tiles:
// <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
```

## 📊 Data Management

### Province Data:

- **Location**: `src/components/IranMap/iranProvinces.json`
- **Format**: GeoJSON with Iranian province boundaries

### Default Data:

- **Projects**: Stored in Zustand store (browser localStorage)
- **Hotels**: Stored in Zustand store (browser localStorage)
- **Employees**: Stored in Zustand store (browser localStorage)

### Excel Import/Export:

- **Templates**: Generated dynamically in `src/components/IranMap/services/excelTemplateService.ts`
- **Formats**: Projects, Hotels, and Employee data

## 🎨 Customization

### Colors and Themes:

- **Constants**: `src/components/IranMap/constants/index.ts`
- **Theme**: `src/theme.js` (Material-UI theme)
- **Global Styles**: `src/styles/global.css`

### Adding New Project Types:

```javascript
// In src/components/IranMap/constants/index.ts
export const PROJECT_TYPE_COLORS = {
  "آزادراه و بزرگراه": "#FF5722",
  YOUR_NEW_TYPE: "#YOUR_COLOR",
  // ... existing types
};
```

### Adding New Features:

1. Create component in `src/components/IranMap/components/`
2. Add hooks in `src/components/IranMap/hooks/`
3. Update store in `src/store/`
4. Add constants if needed

## 🔄 Building for Distribution

### For Windows Client:

```bash
# Complete build process
npm run package:windows

# Creates dist/ folder with:
# - iran-map-windows.exe
# - build/ folder (React app)
# - start-iran-map.bat
# - start-iran-map.ps1
# - README.txt
```

### For Web Deployment:

```bash
# Build static files
npm run build

# Deploy build/ folder to any web server
# (Vercel, Netlify, Apache, Nginx, etc.)
```

## 🐛 Troubleshooting

### Common Issues:

#### 1. npm install fails:

```bash
# Clear cache and try again
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. Build fails:

```bash
# Check Node.js version
node --version  # Should be 18.x or 20.x

# Clear build cache
rm -rf build
npm run build
```

#### 3. Windows executable doesn't work:

```bash
# Make sure entire dist/ folder is copied
# Check if build/ folder exists next to .exe file
# Test server directly first:
npm run server
```

#### 4. Port 3000 busy:

```bash
# Kill existing processes
npx kill-port 3000

# Or use different port
PORT=8080 npm start
```

## 📝 Development Guidelines

### Code Style:

- **React**: Functional components with hooks
- **State**: Zustand for global state management
- **Styling**: Material-UI + CSS modules
- **TypeScript**: Used for type safety where needed

### Git Workflow (Optional):

```bash
# Initialize git repository
git init
git add .
git commit -m "Initial commit"

# Create feature branches
git checkout -b feature/new-feature
# ... make changes ...
git commit -m "Add new feature"
git merge feature/new-feature
```

### Testing:

```bash
# Run tests
npm test

# Run specific test file
npm test MapView.test.js
```

## 🚀 Deployment Options

### Option 1: Windows Executable (Current)

- **Command**: `npm run package:windows`
- **Output**: Single executable + files
- **Use Case**: Desktop application for Windows

### Option 2: Web Application

- **Command**: `npm run build`
- **Output**: Static files for web server
- **Use Case**: Web browser access

### Option 3: Docker (Advanced)

```dockerfile
FROM node:18-alpine
COPY . /app
WORKDIR /app
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "run", "server"]
```

## 📞 Support

For technical questions or issues:

1. Check this documentation first
2. Review error messages carefully
3. Search online for similar issues
4. Contact the original developer if needed

## 📋 Version Information

- **Application Version**: 2.0.0
- **Node.js**: 18.x+ recommended
- **React**: 18.x
- **Build Date**: June 2024

## 📄 License

See LICENSE file for details.

---

**Happy coding! 🎉**
