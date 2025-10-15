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

// Generate structured nodes in 3 columns
const generateStructuredNodes = () => {
  const nodes = [];
  const edges = [];

  // Column 1: 10 nodes (Parents)
  const column1Nodes = [];
  for (let i = 1; i <= 10; i++) {
    const nodeId = `col1-${i}`;
    column1Nodes.push(nodeId);
    nodes.push({
      id: nodeId,
      type: "custom",
      data: { label: `Parent ${i}` },
      position: { x: 100, y: 50 + (i - 1) * 60 },
    });
  }

  // Column 2: 20 nodes (Children of Column 1)
  const column2Nodes = [];
  for (let i = 1; i <= 20; i++) {
    const nodeId = `col2-${i}`;
    column2Nodes.push(nodeId);
    nodes.push({
      id: nodeId,
      type: "custom",
      data: { label: `Child ${i}` },
      position: { x: 400, y: 30 + (i - 1) * 30 },
    });

    // Randomly connect to Column 1 parents
    const randomParent =
      column1Nodes[Math.floor(Math.random() * column1Nodes.length)];
    edges.push({
      id: `edge-${randomParent}-${nodeId}`,
      source: randomParent,
      target: nodeId,
      sourceHandle: "source",
      targetHandle: "target",
    });
  }

  // Column 3: 10 nodes (Children of Column 2)
  const column3Nodes = [];
  for (let i = 1; i <= 10; i++) {
    const nodeId = `col3-${i}`;
    column3Nodes.push(nodeId);
    nodes.push({
      id: nodeId,
      type: "custom",
      data: { label: `Grandchild ${i}` },
      position: { x: 700, y: 50 + (i - 1) * 60 },
    });

    // Randomly connect to Column 2 children
    const randomChild =
      column2Nodes[Math.floor(Math.random() * column2Nodes.length)];
    edges.push({
      id: `edge-${randomChild}-${nodeId}`,
      source: randomChild,
      target: nodeId,
      sourceHandle: "source",
      targetHandle: "target",
    });
  }

  return { nodes, edges };
};

const { nodes: initialNodes, edges: allEdges } = generateStructuredNodes();
// Start with no visible edges
const initialEdges = [];

// Performance monitoring component
const PerformanceMonitor = ({
  nodeCount,
  edgeCount,
  renderTime,
  fps,
  selectedNodeId,
  totalEdges,
}) => {
  const getColumnInfo = () => {
    if (nodeCount === 40) {
      return "📋 3-Column Structure: 10-20-10";
    } else if (nodeCount > 40) {
      return `📈 Extended: ${nodeCount} total nodes`;
    } else {
      return `📊 Custom: ${nodeCount} nodes`;
    }
  };

  const getEdgeInfo = () => {
    if (selectedNodeId) {
      return `🔗 Showing edges for: ${selectedNodeId}`;
    } else {
      return `🔗 Total edges: ${totalEdges} (click node to view)`;
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
        minWidth: "250px",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
        📊 Performance Monitor
      </div>
      <div>{getColumnInfo()}</div>
      <div>Nodes: {nodeCount}</div>
      <div>Visible Edges: {edgeCount}</div>
      <div>{getEdgeInfo()}</div>
      <div>Render Time: {renderTime}ms</div>
      <div>FPS: {fps}</div>
      <div style={{ marginTop: "5px", fontSize: "10px", opacity: 0.7 }}>
        {nodeCount > 100 && "⚠️ High node count - consider optimization"}
        {nodeCount === 40 && "✅ Optimal structured layout"}
        {selectedNodeId && "👆 Click same node to hide edges"}
      </div>
    </div>
  );
};

// Optimized node component
const OptimizedNode = React.memo(({ data, selected }) => (
  <div
    style={{
      padding: "10px",
      background: selected ? "#ff6b6b" : "#4ecdc4",
      color: "white",
      borderRadius: "5px",
      border: "2px solid #333",
      minWidth: "100px",
      textAlign: "center",
      fontSize: "12px",
      position: "relative",
    }}
  >
    <Handle
      type="source"
      position={Position.Right}
      id="source"
      style={{ background: "#555" }}
    />
    <Handle
      type="target"
      position={Position.Left}
      id="target"
      style={{ background: "#555" }}
    />
    {data.label}
  </div>
));

// Memoized node types to prevent recreation on every render
const nodeTypes = {
  custom: OptimizedNode,
};

const ReactFlowTest = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
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
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node click to show/hide edges
  const onNodeClick = useCallback(
    (event, node) => {
      const nodeId = node.id;

      if (selectedNodeId === nodeId) {
        // If clicking the same node, hide all edges
        setSelectedNodeId(null);
        setEdges([]);
      } else {
        // Show edges connected to the clicked node
        setSelectedNodeId(nodeId);
        const connectedEdges = allEdgesData.filter(
          (edge) => edge.source === nodeId || edge.target === nodeId
        );
        console.log('=== REACT FLOW DEBUG ===');
        console.log('Clicked node ID:', nodeId);
        console.log('All edges data:', allEdgesData);
        console.log('Connected edges found:', connectedEdges);
        console.log('Current edges before:', edges);
        setEdges(connectedEdges);
        console.log('Edges set to:', connectedEdges);
      }
    },
    [selectedNodeId, allEdgesData, setEdges]
  );

  // Generate random nodes
  const addRandomNodes = useCallback(
    (count = 10) => {
      const newNodes = [];
      const newEdges = [];

      for (let i = 0; i < count; i++) {
        const nodeId = `node-${Date.now()}-${i}`;
        newNodes.push({
          id: nodeId,
          type: "custom",
          data: { label: `Node ${nodes.length + i + 1}` },
          position: {
            x: Math.random() * 800,
            y: Math.random() * 600,
          },
        });

        // Randomly connect to existing nodes
        if (nodes.length > 0 && Math.random() > 0.7) {
          const randomExistingNode =
            nodes[Math.floor(Math.random() * nodes.length)];
          newEdges.push({
            id: `edge-${nodeId}-${randomExistingNode.id}`,
            source: nodeId,
            target: randomExistingNode.id,
            sourceHandle: "source",
            targetHandle: "target",
          });
        }
      }

      setNodes((prev) => [...prev, ...newNodes]);
      setEdges((prev) => [...prev, ...newEdges]);
    },
    [nodes, setNodes, setEdges]
  );

  // Clear all nodes and reset to structured layout
  const clearAllNodes = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = generateStructuredNodes();
    setNodes(newNodes);
    setAllEdgesData(newEdges);
    setEdges([]); // Hide all edges by default
    setSelectedNodeId(null);
  }, [setNodes, setEdges, setAllEdgesData]);

  // Regenerate structured layout with new random connections
  const regenerateStructure = useCallback(() => {
    const { nodes: newNodes, edges: newEdges } = generateStructuredNodes();
    setNodes(newNodes);
    setAllEdgesData(newEdges);
    setEdges([]); // Hide all edges by default
    setSelectedNodeId(null);
  }, [setNodes, setEdges, setAllEdgesData]);

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
          onClick={() => addRandomNodes(10)}
          style={{
            padding: "5px 10px",
            background: "#4ecdc4",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          +10 Nodes
        </button>
        <button
          onClick={() => addRandomNodes(50)}
          style={{
            padding: "5px 10px",
            background: "#45b7aa",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          +50 Nodes
        </button>
        <button
          onClick={() => addRandomNodes(100)}
          style={{
            padding: "5px 10px",
            background: "#ff6b6b",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          +100 Nodes
        </button>
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
          {edges.length === 0 ? "👁️ Show All Edges" : "🙈 Hide All Edges"}
        </button>
        <button
          onClick={regenerateStructure}
          style={{
            padding: "5px 10px",
            background: "#9b59b6",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          🔄 Regenerate Structure
        </button>
        <button
          onClick={clearAllNodes}
          style={{
            padding: "5px 10px",
            background: "#666",
            color: "white",
            border: "none",
            borderRadius: "3px",
            cursor: "pointer",
          }}
        >
          Reset to 40 Nodes
        </button>
      </div>
    ),
    [
      addRandomNodes,
      clearAllNodes,
      regenerateStructure,
      toggleAllEdges,
      edges.length,
    ]
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
      />
      {controls}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        nodeTypes={nodeTypes}
        // Performance optimizations
        onlyRenderVisibleElements={true}
        nodesDraggable={true}
        nodesConnectable={true}
        elementsSelectable={true}
      >
        <Controls />
        <MiniMap />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default ReactFlowTest;
