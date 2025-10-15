import React, {
  useCallback,
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Sample WBS data with 40 nodes across different levels
const sampleWBSData = [
  // WBS7 Level - Categorie Opera (Parents)
  {
    id: 12250,
    code: "G1",
    short_description: "Impianti termici e di condizionamento",
    level: { id: 3, name: "WBS7", description: "Categorie Opera" },
    parents: [],
    children: [12330, 12331, 12332, 12333],
  },
  {
    id: 12251,
    code: "G2",
    short_description: "Impianti elettrici",
    level: { id: 3, name: "WBS7", description: "Categorie Opera" },
    parents: [],
    children: [12334, 12335, 12336, 12337],
  },
  {
    id: 12252,
    code: "G3",
    short_description: "Impianti idrici e sanitari",
    level: { id: 3, name: "WBS7", description: "Categorie Opera" },
    parents: [],
    children: [12717],
  },
  {
    id: 12253,
    code: "G4",
    short_description: "Strutture e fondazioni",
    level: { id: 3, name: "WBS7", description: "Categorie Opera" },
    parents: [],
    children: [],
  },
  {
    id: 12330,
    code: "ELT",
    short_description: "Elettricità generale",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12250],
    children: [],
  },
  {
    id: 12331,
    code: "ILL",
    short_description: "Illuminazione",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12250],
    children: [],
  },
  {
    id: 12332,
    code: "ANT",
    short_description: "Antenne e telecomunicazioni",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12250],
    children: [],
  },
  {
    id: 12333,
    code: "SEC",
    short_description: "Sicurezza e videosorveglianza",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12250],
    children: [],
  },
  {
    id: 12334,
    code: "IDR",
    short_description: "Impianti idrici",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12251],
    children: [],
  },
  {
    id: 12335,
    code: "SAN",
    short_description: "Impianti sanitari",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12251],
    children: [],
  },
  {
    id: 12336,
    code: "SCA",
    short_description: "Scarichi e fognature",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12251],
    children: [],
  },
  {
    id: 12337,
    code: "FON",
    short_description: "Fondazioni e strutture",
    level: { id: 4, name: "WBS8", description: "Categorie di Lavorazione" },
    parents: [12251],
    children: [],
  },

  {
    id: 12717,
    code: "PAV01T",
    short_description: "Pavimenti ceramica",
    level: {
      id: 35,
      name: "WBS9",
      description: "Sottocategoria di Lavorazione",
    },
    parents: [12341],
    children: [],
  },
];

// Generate WBS nodes and edges from data
const generateWBSNodes = (wbsData) => {
  const nodes = [];
  const edges = [];
  const levelColumns = {};
  const nodePositions = {};

  // Group items by level name
  wbsData.forEach((item) => {
    const levelName = item.level.name;
    if (!levelColumns[levelName]) {
      levelColumns[levelName] = [];
    }
    levelColumns[levelName].push(item);
  });

  // Calculate column positions
  const levelNames = Object.keys(levelColumns).sort();
  const columnWidth = 300;
  const startX = 100;

  // Generate nodes for each level
  levelNames.forEach((levelName, levelIndex) => {
    const items = levelColumns[levelName];
    const x = startX + levelIndex * columnWidth;
    const nodeSpacing = 80;

    items.forEach((item, itemIndex) => {
      const nodeId = `wbs-${item.id}`;
      const y = 50 + itemIndex * nodeSpacing;

      nodes.push({
        id: nodeId,
        type: "wbs",
        data: {
          label: item.code,
          description: item.short_description,
          level: levelName,
          levelDescription: item.level.description,
          originalData: item,
        },
        position: { x, y },
      });

      nodePositions[item.id] = { nodeId, levelName };
    });
  });

  // Generate edges for parent-child relationships
  const edgeIds = new Set(); // Track unique edge IDs

  wbsData.forEach((item) => {
    const sourceNodeId = `wbs-${item.id}`;

    // Connect to children (only create edges in one direction to avoid duplicates)
    if (item.children && item.children.length > 0) {
      item.children.forEach((childId) => {
        const targetNodeId = `wbs-${childId}`;
        const edgeId = `edge-${item.id}-${childId}`;

        // Only add edge if it doesn't already exist
        if (!edgeIds.has(edgeId)) {
          edgeIds.add(edgeId);
          edges.push({
            id: edgeId,
            source: sourceNodeId,
            target: targetNodeId,
            sourceHandle: "source",
            targetHandle: "target",
          });
        }
      });
    }
  });

  return { nodes, edges, levelColumns };
};

// WBS Node Component
const WBSNode = React.memo(({ data, selected }) => (
  <div
    style={{
      padding: "12px",
      background: selected ? "#ff6b6b" : "#4ecdc4",
      color: "white",
      borderRadius: "8px",
      border: "2px solid #333",
      minWidth: "120px",
      textAlign: "center",
      fontSize: "11px",
      position: "relative",
      boxShadow: selected
        ? "0 4px 8px rgba(0,0,0,0.3)"
        : "0 2px 4px rgba(0,0,0,0.2)",
    }}
  >
    <Handle
      type="source"
      position={Position.Right}
      id="source"
      style={{ background: "#555", width: "8px", height: "8px" }}
    />
    <Handle
      type="target"
      position={Position.Left}
      id="target"
      style={{ background: "#555", width: "8px", height: "8px" }}
    />
    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>{data.label}</div>
    <div style={{ fontSize: "9px", opacity: 0.9, lineHeight: "1.2" }}>
      {data.description}
    </div>
    <div style={{ fontSize: "8px", opacity: 0.7, marginTop: "2px" }}>
      {data.level}
    </div>
  </div>
));

// Memoized node types
const nodeTypes = {
  wbs: WBSNode,
};

// Performance monitoring component
const PerformanceMonitor = ({
  nodeCount,
  edgeCount,
  renderTime,
  fps,
  selectedNodeId,
  totalEdges,
  levelInfo,
}) => {
  const getColumnInfo = () => {
    if (levelInfo) {
      return `📋 WBS Levels: ${Object.keys(levelInfo).join(", ")}`;
    }
    return `📊 WBS Structure: ${nodeCount} items`;
  };

  const getEdgeInfo = () => {
    if (selectedNodeId) {
      return `🔗 Showing connections for: ${selectedNodeId}`;
    } else {
      return `🔗 Total connections: ${totalEdges} (click item to view)`;
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "5px",
        fontFamily: "monospace",
        fontSize: "12px",
        zIndex: 1000,
        minWidth: "280px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        📊 WBS Performance Monitor
      </div>
      <div>{getColumnInfo()}</div>
      <div>Items: {nodeCount}</div>
      <div>Visible Connections: {edgeCount}</div>
      <div>{getEdgeInfo()}</div>
      <div>Render Time: {renderTime}ms</div>
      <div>FPS: {fps}</div>
      <div style={{ marginTop: "5px", fontSize: "10px", opacity: 0.7 }}>
        {nodeCount > 100 && "⚠️ Large WBS - consider optimization"}
        {selectedNodeId &&
          "👆 Click same item to hide, different item to switch connections"}
      </div>
    </div>
  );
};

const WBSFlowTest = () => {
  const {
    nodes: initialNodes,
    edges: allEdges,
    levelColumns,
  } = generateWBSNodes(sampleWBSData);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [allEdgesData, setAllEdgesData] = useState(allEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    fps: 60,
    lastFrameTime: performance.now(),
  });

  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(performance.now());
  const renderStartTimeRef = useRef(0);

  // Performance monitoring
  useEffect(() => {
    const updateFPS = () => {
      frameCountRef.current++;
      const now = performance.now();

      if (now - lastFpsUpdateRef.current >= 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) / (now - lastFpsUpdateRef.current)
        );
        setPerformanceMetrics((prev) => ({ ...prev, fps }));
        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      requestAnimationFrame(updateFPS);
    };

    updateFPS();
  }, []);

  // Measure render time
  useEffect(() => {
    const startTime = performance.now();
    renderStartTimeRef.current = startTime;

    const measureRender = () => {
      const endTime = performance.now();
      const renderTime = endTime - renderStartTimeRef.current;
      setPerformanceMetrics((prev) => ({
        ...prev,
        renderTime: Math.round(renderTime * 100) / 100,
      }));
    };

    const timeoutId = setTimeout(measureRender, 0);
    return () => clearTimeout(timeoutId);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => {
      // Only allow connections when no node is selected (manual mode)
      if (!selectedNodeId) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, selectedNodeId]
  );

  // Handle node click to show/hide edges
  const onNodeClick = useCallback(
    (event, node) => {
      const nodeId = node.id;

      if (selectedNodeId === nodeId) {
        // Hide edges if clicking same node
        setSelectedNodeId(null);
        setEdges([]);
      } else {
        // Show edges for clicked node (this will replace all edges)
        setSelectedNodeId(nodeId);
        const connectedEdges = allEdgesData.filter(
          (edge) => edge.source === nodeId || edge.target === nodeId
        );
        setEdges(connectedEdges);
      }
    },
    [selectedNodeId, allEdgesData, setEdges]
  );

  // Toggle all edges visibility
  const toggleAllEdges = useCallback(() => {
    if (edges.length === 0) {
      // Show all edges
      setEdges(allEdgesData);
      setSelectedNodeId("all");
    } else {
      // Hide all edges
      setEdges([]);
      setSelectedNodeId(null);
    }
  }, [edges.length, allEdgesData, setEdges]);

  // Reset to original WBS structure
  const resetWBS = useCallback(() => {
    setNodes(initialNodes);
    setAllEdgesData(allEdges);
    setEdges([]);
    setSelectedNodeId(null);
  }, [initialNodes, allEdges, setNodes, setEdges, setAllEdgesData]);

  // Memoized controls
  const controls = useMemo(
    () => (
      <div
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "10px",
          borderRadius: "5px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: "5px",
        }}
      >
        <button
          onClick={toggleAllEdges}
          style={{
            padding: "5px 10px",
            background: "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          {edges.length === 0
            ? "👁️ Show All Connections"
            : "🙈 Hide All Connections"}
        </button>
        <button
          onClick={resetWBS}
          style={{
            padding: "5px 10px",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          🔄 Reset WBS
        </button>
      </div>
    ),
    [toggleAllEdges, resetWBS, edges.length]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <PerformanceMonitor
        nodeCount={nodes.length}
        edgeCount={edges.length}
        renderTime={performanceMetrics.renderTime}
        fps={performanceMetrics.fps}
        selectedNodeId={selectedNodeId}
        totalEdges={allEdgesData.length}
        levelInfo={levelColumns}
      />
      {controls}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={selectedNodeId ? undefined : onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        nodeTypes={nodeTypes}
        onlyRenderVisibleElements={true}
        nodesDraggable={true}
        nodesConnectable={!selectedNodeId}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default WBSFlowTest;
