# React Flow Hierarchical Structure

## 🏗️ 3-Column Layout Structure

The React Flow component now features a **default 40-node hierarchical structure** organized in 3 columns with parent-child relationships.

### 📊 Structure Overview

```
Column 1 (Parents)     Column 2 (Children)     Column 3 (Grandchildren)
┌─────────────┐        ┌─────────────┐        ┌─────────────┐
│ Parent 1    │ ──────▶│ Child 1     │ ──────▶│ Grandchild 1│
│ Parent 2    │ ──────▶│ Child 2     │ ──────▶│ Grandchild 2│
│ Parent 3    │ ──────▶│ Child 3     │ ──────▶│ Grandchild 3│
│ ...         │        │ Child 4     │        │ ...         │
│ Parent 10   │        │ ...         │        │ Grandchild 10│
└─────────────┘        │ Child 20    │        └─────────────┘
                       └─────────────┘
```

### 🎯 Column Details

| Column       | Node Count | Node Type     | Position | Spacing       |
| ------------ | ---------- | ------------- | -------- | ------------- |
| **Column 1** | 10 nodes   | Parents       | x: 100   | 60px vertical |
| **Column 2** | 20 nodes   | Children      | x: 400   | 30px vertical |
| **Column 3** | 10 nodes   | Grandchildren | x: 700   | 60px vertical |

### 🔗 Relationship Structure

#### **Column 1 → Column 2 (Parent-Child)**

- Each of the 20 children in Column 2 is **randomly connected** to a parent in Column 1
- Multiple children can connect to the same parent
- Creates a **many-to-one** relationship pattern

#### **Column 2 → Column 3 (Child-Grandchild)**

- Each of the 10 grandchildren in Column 3 is **randomly connected** to a child in Column 2
- Multiple grandchildren can connect to the same child
- Creates a **many-to-one** relationship pattern

### 🎨 Visual Layout

```
x: 100    x: 400    x: 700
   │         │         │
   ▼         ▼         ▼
┌─────┐   ┌─────┐   ┌─────┐
│ P1  │──▶│ C1  │──▶│ GC1 │
└─────┘   └─────┘   └─────┘
┌─────┐   ┌─────┐   ┌─────┐
│ P2  │──▶│ C2  │   │ GC2 │
└─────┘   └─────┘   └─────┘
┌─────┐   ┌─────┐   ┌─────┐
│ P3  │   │ C3  │──▶│ GC3 │
└─────┘   └─────┘   └─────┘
   ...       ...       ...
┌─────┐   ┌─────┐   ┌─────┐
│ P10 │   │ C20 │   │ GC10│
└─────┘   └─────┘   └─────┘
```

## 🚀 Interactive Features

### 🔄 **Regenerate Structure Button**

- **Function**: Creates new random parent-child connections
- **Effect**: Maintains the same 40-node structure but with different relationships
- **Use Case**: Test different hierarchical patterns

### 🔄 **Reset to 40 Nodes Button**

- **Function**: Resets to the original structured layout
- **Effect**: Returns to the default 3-column structure
- **Use Case**: Clear any additional nodes and return to base structure

### ➕ **Add More Nodes Buttons**

- **+10 Nodes**: Adds 10 random nodes to the existing structure
- **+50 Nodes**: Adds 50 random nodes for stress testing
- **+100 Nodes**: Adds 100 random nodes for performance testing

## 📊 Performance Characteristics

### **Default 40-Node Structure**

- **Nodes**: 40 total (10 + 20 + 10)
- **Edges**: 30 total (20 + 10)
- **Expected FPS**: 55-60 FPS
- **Render Time**: 8-15ms
- **Status**: 🟢 Excellent Performance

### **Performance Monitoring**

The performance monitor now shows:

- **📋 3-Column Structure: 10-20-10** when at default 40 nodes
- **📈 Extended: X total nodes** when additional nodes are added
- **✅ Optimal structured layout** indicator for 40-node structure

## 🎯 Use Cases

### **1. Hierarchical Data Visualization**

- Organization charts
- Family trees
- Process workflows
- Decision trees

### **2. Performance Testing**

- Test React Flow performance with structured data
- Compare performance between structured vs. random layouts
- Monitor how performance degrades with additional nodes

### **3. Layout Algorithm Testing**

- Test different parent-child relationship patterns
- Experiment with column spacing and positioning
- Validate edge routing and connection patterns

## 🛠️ Technical Implementation

### **Node Generation Function**

```javascript
const generateStructuredNodes = () => {
  // Creates 3 columns with specific node counts
  // Generates random parent-child relationships
  // Returns nodes and edges arrays
};
```

### **Random Relationship Logic**

```javascript
// Column 1 → Column 2
const randomParent =
  column1Nodes[Math.floor(Math.random() * column1Nodes.length)];

// Column 2 → Column 3
const randomChild =
  column2Nodes[Math.floor(Math.random() * column2Nodes.length)];
```

### **Performance Optimizations**

- **React.memo** for node components
- **useMemo** for control buttons
- **useCallback** for event handlers
- **Memoized nodeTypes** to prevent recreation

## 🎨 Visual Enhancements

### **Node Styling**

- **Custom styled nodes** with proper handles
- **Visual feedback** for selected nodes
- **Consistent spacing** within each column
- **Clear visual hierarchy** between columns

### **Edge Styling**

- **Proper handle connections** with defined source/target handles
- **Clean edge routing** between columns
- **Visual flow direction** from left to right

## 🚀 Access the Hierarchical Structure

**URL**: `http://localhost:3000/react-flow-test`

**Features**:

- ✅ **40-node default structure** with 3 columns
- ✅ **Random parent-child relationships** between columns
- ✅ **Interactive regeneration** of relationship patterns
- ✅ **Performance monitoring** with structure indicators
- ✅ **Extensible design** for adding more nodes
- ✅ **No authentication required** (guest route)

The hierarchical structure provides an excellent foundation for testing React Flow performance with realistic, structured data patterns!
