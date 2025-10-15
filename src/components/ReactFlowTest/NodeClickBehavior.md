# Node Click Behavior - WBS Flow

## 🎯 Corrected Behavior

The WBS Flow component now has the correct node click behavior as requested:

### **Click Behavior Rules**

1. **Click on any node** → Shows only that node's connections (hides all other connections)
2. **Click on the same node again** → Hides all connections
3. **Click on a different node** → Hides previous connections, shows new node's connections

## 🔄 How It Works

### **State Management**

```javascript
const onNodeClick = useCallback(
  (event, node) => {
    const nodeId = node.id;

    if (selectedNodeId === nodeId) {
      // Hide edges if clicking same node
      setSelectedNodeId(null);
      setEdges([]);
    } else {
      // Show edges for clicked node (automatically hides previous connections)
      setSelectedNodeId(nodeId);
      const connectedEdges = allEdgesData.filter(
        (edge) => edge.source === nodeId || edge.target === nodeId
      );
      setEdges(connectedEdges); // This replaces all edges with only the new node's edges
    }
  },
  [selectedNodeId, allEdgesData, setEdges]
);
```

### **Key Points**

- **`setEdges(connectedEdges)`** replaces ALL edges with only the edges connected to the clicked node
- **Previous connections are automatically hidden** when clicking a new node
- **Only one node's connections are visible at a time** (except when "Show All Connections" is used)

## 🎮 User Experience

### **Step-by-Step Example**

1. **Initial State**: No edges visible, no node selected
2. **Click Node G1**: Shows G1's connections (5 edges to its children)
3. **Click Node DIS**: Hides G1's connections, shows DIS's connections (1 edge to parent + 5 edges to children)
4. **Click Node SRD**: Hides DIS's connections, shows SRD's connections (1 edge to parent + 2 edges to children)
5. **Click Node SRD again**: Hides all connections, returns to clean state

### **Visual Feedback**

- **Selected Node**: Highlighted with red background
- **Connected Edges**: Only edges connected to the selected node are visible
- **Performance Monitor**: Shows which node is selected and connection count

## 📊 Performance Monitor Updates

### **Enhanced Information**

- **🔗 Showing connections for: wbs-12325** - When a node is selected
- **🔗 Total connections: 23 (click item to view)** - When no node is selected
- **👆 Click same item to hide, different item to switch connections** - Interactive hint

### **Real-time Updates**

- **Visible Connections**: Shows count of currently visible edges
- **Selected Node ID**: Shows which node is currently selected
- **Connection Status**: Clear indication of current state

## 🎯 Benefits of This Behavior

### **Clean Interface**

- **No Visual Clutter**: Only relevant connections are shown
- **Focused Exploration**: Users can focus on one node's relationships at a time
- **Clear Navigation**: Easy to understand which node is being explored

### **Intuitive Interaction**

- **Predictable Behavior**: Clicking a new node always shows its connections
- **Easy Reset**: Clicking the same node hides connections
- **Smooth Transitions**: Clean switching between different nodes

### **Performance Benefits**

- **Reduced Rendering**: Only necessary edges are rendered
- **Better Performance**: Fewer DOM elements to manage
- **Smooth Animations**: Less visual complexity for better frame rates

## 🚀 Usage Instructions

### **How to Use**

1. **Start Clean**: View opens with no edges visible
2. **Explore Node**: Click any node to see its connections
3. **Switch Focus**: Click different node to see its connections (previous ones hide automatically)
4. **Hide Connections**: Click the same node again to hide all connections
5. **Get Overview**: Use "Show All Connections" to see complete structure

### **Best Practices**

- **Click nodes systematically** to explore the hierarchy
- **Use "Show All Connections"** for overview of complete structure
- **Click same node** to return to clean view when done exploring
- **Use performance monitor** to track which node is selected

## 🎨 Visual Example

### **Before Click (Clean State)**

```
WBS7          WBS8          WBS9
┌─────┐       ┌─────┐       ┌─────┐
│ G1  │       │ DIS │       │DIS01│
└─────┘       └─────┘       └─────┘
┌─────┐       ┌─────┐       ┌─────┐
│ G2  │       │ SRD │       │DIS02│
└─────┘       └─────┘       └─────┘
```

### **After Clicking G1 (Shows G1's Connections)**

```
WBS7          WBS8          WBS9
┌─────┐       ┌─────┐       ┌─────┐
│ G1  │ ─────▶│ DIS │ ─────▶│DIS01│
└─────┘       └─────┘       └─────┘
┌─────┐       ┌─────┐       ┌─────┐
│ G2  │       │ SRD │       │DIS02│
└─────┘       └─────┘       └─────┘
              ┌─────┐
              │ CLM │
              └─────┘
              ┌─────┐
              │ VNT │
              └─────┘
              ┌─────┐
              │ GAS │
              └─────┘
```

### **After Clicking DIS (Hides G1's, Shows DIS's Connections)**

```
WBS7          WBS8          WBS9
┌─────┐       ┌─────┐       ┌─────┐
│ G1  │ ─────▶│ DIS │ ─────▶│DIS01│
└─────┘       └─────┘       └─────┘
              ┌─────┐       ┌─────┐
              │ SRD │       │DIS02│
              └─────┘       └─────┘
              ┌─────┐       ┌─────┐
              │ CLM │       │DIS03│
              └─────┘       └─────┘
              ┌─────┐       ┌─────┐
              │ VNT │       │DIS04│
              └─────┘       └─────┘
              ┌─────┐       ┌─────┐
              │ GAS │       │DIS05│
              └─────┘       └─────┘
```

The node click behavior now works exactly as requested - clicking a new node automatically hides previous connections and shows only the new node's connections!
