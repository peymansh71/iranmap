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

const initialNodes = [
  {
    id: "1",
    type: "custom",
    data: { label: "Input Node" },
    position: { x: 250, y: 25 },
  },
  {
    id: "2",
    type: "custom",
    data: { label: "Default Node" },
    position: { x: 100, y: 125 },
  },
  {
    id: "3",
    type: "custom",
    data: { label: "Output Node" },
    position: { x: 250, y: 250 },
  },
  {
    id: "4",
    type: "custom",
    data: { label: "Another Node" },
    position: { x: 400, y: 125 },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    sourceHandle: "source",
    targetHandle: "target",
  },
  {
    id: "e1-3",
    source: "1",
    target: "3",
    sourceHandle: "source",
    targetHandle: "target",
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    sourceHandle: "source",
    targetHandle: "target",
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    sourceHandle: "source",
    targetHandle: "target",
  },
];

// Performance monitoring component
const PerformanceMonitor = ({ nodeCount, edgeCount, renderTime, fps }) => (
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
      minWidth: "200px",
    }}
  >
    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
      📊 Performance Monitor
    </div>
    <div>Nodes: {nodeCount}</div>
    <div>Edges: {edgeCount}</div>
    <div>Render Time: {renderTime}ms</div>
    <div>FPS: {fps}</div>
    <div style={{ marginTop: "5px", fontSize: "10px", opacity: 0.7 }}>
      {nodeCount > 100 && "⚠️ High node count - consider optimization"}
    </div>
  </div>
);

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

  // Clear all nodes
  const clearAllNodes = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [setNodes, setEdges]);

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
          Reset
        </button>
      </div>
    ),
    [addRandomNodes, clearAllNodes]
  );

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <PerformanceMonitor
        nodeCount={nodes.length}
        edgeCount={edges.length}
        renderTime={performanceMetrics.renderTime}
        fps={performanceMetrics.fps}
      />
      {controls}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
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
