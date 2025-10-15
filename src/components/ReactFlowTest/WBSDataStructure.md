# WBS Data Visualization Structure

## 🎯 Overview

I've created a new React Flow component specifically for your WBS (Work Breakdown Structure) data that organizes items by level names and shows parent-child relationships interactively.

## 📊 Data Structure Understanding

### **Your WBS Data Format**

```json
{
  "id": 12325,
  "code": "DIS",
  "short_description": "Distribuzione idrica sanitaria",
  "level": {
    "id": 4,
    "name": "WBS8",
    "description": "Categorie di Lavorazione"
  },
  "parents": [
    {
      "id": 12250,
      "code": "G1",
      "short_description": "Impianti termici e di condizionamento",
      "level": {
        "name": "WBS7",
        "description": "Categorie Opera"
      }
    }
  ],
  "children": [
    {
      "id": 12671,
      "code": "DIS01D",
      "short_description": "Accessori di linea acqua",
      "level": {
        "name": "WBS9",
        "description": "Sottocategoria di Lavorazione"
      }
    }
  ]
}
```

## 🏗️ Column Organization

### **Level-Based Columns**

- **WBS7**: Categorie Opera (Parents)
- **WBS8**: Categorie di Lavorazione (Children)
- **WBS9**: Sottocategoria di Lavorazione (Grandchildren)

### **Visual Layout**

```
WBS7 (Parents)          WBS8 (Children)         WBS9 (Grandchildren)
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ G1              │────▶│ DIS             │────▶│ DIS01D          │
│ Impianti        │     │ Distribuzione   │     │ Accessori       │
│ termici         │     │ idrica          │     │ di linea acqua  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                        │ SRD             │     │ DIS02D          │
                        │ Sistemi         │     │ Tubo Acciaio    │
                        │ radianti        │     └─────────────────┘
                        └─────────────────┘     │ DIS03D          │
                                                │ Tubo Rame       │
                                                └─────────────────┘
```

## 🎮 Interactive Features

### **Node Display**

Each node shows:

- **Code**: WBS code (e.g., "DIS", "G1")
- **Description**: Short description
- **Level**: WBS level name (e.g., "WBS8")

### **Click Behavior**

- **Click Node**: Shows parent-child connections
- **Click Same Node**: Hides connections
- **Click Different Node**: Shows new connections

### **Control Buttons**

- **👁️ Show All Connections**: Reveals all parent-child relationships
- **🙈 Hide All Connections**: Returns to clean view
- **🔄 Reset WBS**: Returns to original structure

## 🚀 Performance Features

### **Optimized Rendering**

- **Hidden Edges by Default**: Clean, uncluttered view
- **Selective Edge Display**: Only show relevant connections
- **Real-time Performance Monitoring**: FPS, render time, node count

### **Performance Monitor**

- **📋 WBS Levels**: Shows available level names
- **Items**: Total WBS items count
- **Visible Connections**: Currently displayed edges
- **🔗 Total connections**: Available relationships
- **👆 Click same item to hide connections**: Interactive hint

## 🛠️ Technical Implementation

### **Data Processing**

```javascript
// Group items by level name
const levelColumns = {};
wbsData.forEach((item) => {
  const levelName = item.level.name;
  if (!levelColumns[levelName]) {
    levelColumns[levelName] = [];
  }
  levelColumns[levelName].push(item);
});

// Generate nodes for each level
levelNames.forEach((levelName, levelIndex) => {
  const items = levelColumns[levelName];
  const x = startX + levelIndex * columnWidth;
  // ... create nodes
});
```

### **Edge Generation**

```javascript
// Connect to parents
if (item.parents && item.parents.length > 0) {
  item.parents.forEach((parent) => {
    edges.push({
      id: `edge-${parent.id}-${item.id}`,
      source: `wbs-${parent.id}`,
      target: `wbs-${item.id}`,
    });
  });
}

// Connect to children
if (item.children && item.children.length > 0) {
  item.children.forEach((child) => {
    edges.push({
      id: `edge-${item.id}-${child.id}`,
      source: `wbs-${item.id}`,
      target: `wbs-${child.id}`,
    });
  });
}
```

## 🎨 Node Styling

### **WBS Node Design**

- **Background**: Teal color (#4ecdc4)
- **Selected**: Red color (#ff6b6b)
- **Border**: Dark border with shadow
- **Content**: Code, description, and level name
- **Handles**: Source and target connection points

### **Visual Hierarchy**

- **Code**: Bold, prominent display
- **Description**: Smaller, secondary text
- **Level**: Smallest, level indicator

## 🚀 Usage Instructions

### **Access the WBS Visualization**

**URL**: `http://localhost:3000/wbs-flow-test`

### **How to Use**

1. **View Structure**: See WBS items organized by level columns
2. **Explore Relationships**: Click any item to see its connections
3. **Navigate Hierarchy**: Click different items to explore the structure
4. **Get Overview**: Use "Show All Connections" for complete view
5. **Reset**: Use "Reset WBS" to return to clean state

### **Integration with Your Data**

To use your actual 500-item WBS data:

1. Replace `sampleWBSData` with your real data array
2. The component will automatically organize by level names
3. All parent-child relationships will be preserved
4. Performance will scale with your data size

## 📈 Scalability

### **Performance Expectations**

- **Small WBS (< 100 items)**: Excellent performance
- **Medium WBS (100-300 items)**: Good performance
- **Large WBS (300-500 items)**: Acceptable performance
- **Very Large WBS (> 500 items)**: May need optimization

### **Optimization Strategies**

- **Virtualization**: For very large datasets
- **Level-based Filtering**: Show/hide specific levels
- **Search and Filter**: Find specific items quickly
- **Lazy Loading**: Load levels progressively

The WBS visualization provides an intuitive way to explore your hierarchical work breakdown structure with clean, interactive navigation!
