# Iran Map - Offline Mode Guide

## 🗺️ Overview

Your Iran Map application now supports **offline mode** with pre-downloaded map tiles! This means the app can work without internet connection while still showing detailed maps of Iran.

---

## 📦 What's Included

### **New Components:**

- ✅ **OfflineMapView** - Hybrid online/offline map component
- ✅ **Tile Downloader** - Script to download Iran map tiles
- ✅ **Offline Toggle** - UI switch in dashboard
- ✅ **Auto-Detection** - Automatically switches based on internet connection

### **Features:**

- 🌐 **Hybrid Mode** - Works both online and offline
- 📱 **Auto-Switch** - Detects internet connection
- 🎛️ **Manual Toggle** - Dashboard switch for forced offline mode
- 📊 **Visual Indicators** - Shows current mode status
- 🎨 **Enhanced Styling** - Better province visibility in offline mode

---

## 🚀 Quick Setup (Option 1: Download Tiles)

### **1. Download Iran Map Tiles**

```bash
# Download tiles for zoom levels 6-10 (recommended)
npm run download:tiles

# This will download ~2000-3000 tiles (~30-50MB)
# Tiles are saved to: public/offline-tiles/
```

### **2. Enable Offline Mode**

- Open your application
- Click the **Dashboard** button (bottom right)
- Toggle **"حالت آفلاین"** switch
- Map will now use local tiles

### **3. Build Windows Package**

```bash
# Build with offline tiles included
npm run package:windows

# Tiles will be automatically included in the build
```

---

## 🛠️ Advanced Configuration

### **Customize Download Settings**

Edit `scripts/download-iran-tiles.js`:

```javascript
// Zoom levels (more = better detail, larger size)
const ZOOM_LEVELS = [6, 7, 8, 9, 10, 11]; // Add 11 for more detail

// Iran bounds (expand for neighboring countries)
const IRAN_BOUNDS = {
  north: 41, // Extend north
  south: 23, // Extend south
  east: 65, // Extend east
  west: 42, // Extend west
};
```

### **Download Progress**

The script shows real-time progress:

```
🗺️  Iran Map Tile Downloader
==============================
📁 Downloading tiles to: /public/offline-tiles
🌍 Bounds: N:40 S:24 E:64 W:43
🔍 Zoom levels: 6, 7, 8, 9, 10
📊 Total tiles to download: 2847
📊 Estimated size: ~42 MB

🚀 Starting download...
📥 Downloading zoom level 6...
   📊 Progress: 15% (Downloaded: 156, Skipped: 0, Errors: 0)
```

---

## 🎯 Alternative Options

### **Option 2: Smaller Download (Basic)**

For smaller package size, edit the download script:

```javascript
// Minimal tiles - just province outlines
const ZOOM_LEVELS = [6, 7, 8]; // Only basic levels (~500 tiles, ~8MB)
```

### **Option 3: Pre-built Offline Package**

- Download a pre-built tile package (if available)
- Extract to `public/offline-tiles/`
- No download needed

### **Option 4: No-Tile Offline Mode**

The app works in offline mode even without tiles:

- Shows province boundaries on patterned background
- All functionality works except base map imagery
- Smallest package size

---

## 📱 User Experience

### **Online Mode (Default):**

- 🌐 Full OpenStreetMap with cities, roads, landmarks
- 🔄 Requires internet connection
- 📊 Shows "حالت آنلاین" in dashboard

### **Offline Mode:**

- 📡 Shows "حالت آفلاین" indicator
- 🗺️ Uses local tiles if available
- 🎨 Enhanced province styling for better visibility
- ⚡ Works without internet

### **Auto-Detection:**

- 📶 Automatically switches to offline when internet is lost
- 🔄 Switches back to online when internet returns
- 🎛️ Manual override available in dashboard

---

## 📊 Package Sizes

| Configuration       | Tiles  | Download Time | Package Size |
| ------------------- | ------ | ------------- | ------------ |
| **No Tiles**        | 0      | Instant       | ~21MB        |
| **Basic (6-8)**     | ~500   | 2-3 minutes   | ~30MB        |
| **Standard (6-10)** | ~2800  | 10-15 minutes | ~65MB        |
| **Detailed (6-12)** | ~11000 | 30-45 minutes | ~150MB       |

---

## 🔧 Technical Details

### **File Structure:**

```
public/
├── offline-tiles/
│   ├── 6/
│   │   ├── 34/
│   │   │   ├── 25.png
│   │   │   └── 26.png
│   │   └── 35/
│   ├── 7/
│   ├── 8/
│   ├── 9/
│   └── 10/
```

### **Tile URL Pattern:**

- **Online:** `https://a.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Offline:** `/offline-tiles/{z}/{x}/{y}.png`

### **Automatic Fallback:**

1. Check if online → use OpenStreetMap
2. Check if offline tiles exist → use local tiles
3. Fallback → show provinces only

---

## 🛡️ Legal Considerations

### **OpenStreetMap Usage:**

- ✅ **Allowed:** Personal/internal business use
- ✅ **Attribution:** Automatically included
- ⚠️ **Rate Limiting:** Script includes respectful delays
- ⚠️ **Terms:** Review [OSM terms](https://www.openstreetmap.org/copyright) for commercial use

### **Recommendations:**

- Use downloaded tiles for internal business only
- For commercial distribution, consider:
  - [Mapbox](https://www.mapbox.com/) commercial tiles
  - [OpenMapTiles](https://openmaptiles.org/) self-hosted
  - Other commercial providers

---

## 🐛 Troubleshooting

### **Tiles not loading:**

```bash
# Check if tiles directory exists
ls public/offline-tiles/

# Verify tiles were downloaded
ls public/offline-tiles/6/34/

# Re-download if empty
npm run download:tiles
```

### **Download interrupted:**

```bash
# Script resumes automatically - skips existing tiles
npm run download:tiles

# To force re-download, delete tiles directory first
rm -rf public/offline-tiles/
npm run download:tiles
```

### **Package too large:**

```bash
# Use smaller zoom range
# Edit scripts/download-iran-tiles.js
const ZOOM_LEVELS = [6, 7, 8]; // Reduce from [6,7,8,9,10]
```

### **Offline mode not working:**

1. Check offline toggle in dashboard
2. Verify tiles exist in `public/offline-tiles/`
3. Check browser console for tile loading errors
4. Test with browser dev tools offline mode

---

## 🚀 Build Commands

### **Development:**

```bash
npm start                    # Development server
npm run download:tiles       # Download offline tiles
```

### **Production:**

```bash
npm run build               # Build React app
npm run package:windows     # Create Windows executable (includes tiles)
```

### **Testing Offline:**

```bash
# Test offline mode in browser
# 1. Open Chrome DevTools
# 2. Go to Network tab
# 3. Check "Offline" checkbox
# 4. Reload application
```

---

## 📈 Performance Tips

### **Optimize Download:**

- Run during off-peak hours
- Use stable internet connection
- Script automatically retries failed downloads

### **Optimize Package:**

- Choose appropriate zoom levels for your needs
- Consider your users' storage constraints
- Test on target Windows 7 systems

### **Optimize Runtime:**

- Offline tiles load faster than online
- Less bandwidth usage for users
- Better performance on slow connections

---

## 🎯 Quick Reference

### **Enable Offline Mode:**

1. Dashboard → Toggle "حالت آفلاین"
2. Or disconnect internet (auto-detection)

### **Download Fresh Tiles:**

```bash
npm run download:tiles
```

### **Check Package Size:**

```bash
# Check tiles size
du -sh public/offline-tiles/

# Check final package
ls -lh iran-map-windows-final.zip
```

### **Test Windows 7 Compatibility:**

- Use Node.js 14 target ✅
- Include offline tiles for offline operation ✅
- Test on actual Windows 7 machine if possible

---

**🎉 Enjoy your fully offline-capable Iran Map application!**

Now your Windows 7 users can use the app even without internet connection!
