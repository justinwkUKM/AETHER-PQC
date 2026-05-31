"use client";

import React, { useState, useEffect, useRef } from "react";
import type { GraphSnapshot, GraphNode, GraphEdge } from "@/types/graph";
import { Shield, Zap, Info, RotateCcw, Activity, MousePointerClick } from "lucide-react";

type PositionedNode = GraphNode & {
  x: number;
  y: number;
};

const categoryConfig = {
  BusinessProcess: { color: "#10b981", label: "Business Process", glow: "rgba(16,185,129,0.25)" },
  Application: { color: "#3b82f6", label: "Application", glow: "rgba(59,130,246,0.25)" },
  SoftwareComponent: { color: "#8b5cf6", label: "Software Component", glow: "rgba(139,92,246,0.25)" },
  DataAsset: { color: "#fb923c", label: "Data Asset", glow: "rgba(251,146,60,0.25)" },
  CryptoAsset: { color: "#ec4899", label: "Crypto Asset", glow: "rgba(236,72,153,0.25)" },
  ExternalService: { color: "#14b8a6", label: "External Service", glow: "rgba(20,184,166,0.25)" }
};

export function RiskGraph({ graph }: { graph: GraphSnapshot }) {
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [graphMode, setGraphMode] = useState<"effective" | "exposure" | "vulnerability">("effective");

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // 1. Initial coordinates positioning (Concentric layers to avoid jumbling on load)
  useEffect(() => {
    if (graph.nodes.length === 0) return;

    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth || 800,
        height: 500
      });
    }

    const width = containerRef.current?.clientWidth || 800;
    const height = 500;

    const initialNodes: PositionedNode[] = graph.nodes.map((node, i) => {
      // Arrange into visual hierarchy: high-level cores in the center, libraries/components outer
      const isCore = ["BusinessProcess", "Application", "ExternalService"].includes(node.label);
      const angle = (i / graph.nodes.length) * 2 * Math.PI;
      const radius = isCore ? 100 : 180;

      return {
        ...node,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius
      };
    });

    setNodes(initialNodes);

    if (initialNodes.length > 0) {
      const highestRisk = [...initialNodes].sort((a, b) => (b.effectiveRiskScore || b.vulnerabilityScore) - (a.effectiveRiskScore || a.vulnerabilityScore))[0];
      setSelectedNode(highestRisk);
    }
  }, [graph]);

  // 2. Direct Mouse Interaction Handlers for drag-and-drop
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    e.preventDefault(); // Prevents browser text-select ghosting during drag
    setDraggedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !svgRef.current) return;
    e.preventDefault();

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = dimensions.width / rect.width;
    const scaleY = dimensions.height / rect.height;

    // Direct screen pixel to viewBox coordinate conversion
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // Lock position inside virtual SVG viewport bounds
    const x = Math.max(30, Math.min(dimensions.width - 30, mouseX));
    const y = Math.max(30, Math.min(dimensions.height - 30, mouseY));

    setNodes((prev) =>
      prev.map((n) => {
        if (n.id === draggedNodeId) {
          return { ...n, x, y };
        }
        return n;
      })
    );
  };

  const handleMouseUpOrLeave = () => {
    setDraggedNodeId(null);
  };

  if (graph.nodes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/12 bg-white/3 p-12 text-center text-slate-400">
        <Shield className="mx-auto h-8 w-8 text-slate-500 mb-3" />
        <p className="text-sm">No topological risk entities extracted. Ingest an assessment artifact to render.</p>
      </div>
    );
  }

  // Highlight determination helpers
  const isNodeHighlighted = (nodeId: string) => {
    if (!hoveredNode) return true;
    if (hoveredNode === nodeId) return true;
    return graph.edges.some(
      (e) => (e.source === hoveredNode && e.target === nodeId) || (e.target === hoveredNode && e.source === nodeId)
    );
  };

  const isEdgeHighlighted = (edge: GraphEdge) => {
    if (!hoveredNode) return true;
    return edge.source === hoveredNode || edge.target === hoveredNode;
  };

  // Reset node layout
  const resetLayout = () => {
    const width = dimensions.width;
    const height = dimensions.height;
    const resetNodes = nodes.map((n, i) => {
      const isCore = ["BusinessProcess", "Application", "ExternalService"].includes(n.label);
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = isCore ? 100 : 180;
      return {
        ...n,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius
      };
    });
    setNodes(resetNodes);
  };

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const displayScore = (node: GraphNode) => {
    if (graphMode === "exposure") return node.exposureScore;
    if (graphMode === "vulnerability") return node.vulnerabilityScore;
    return node.effectiveRiskScore || node.vulnerabilityScore;
  };
  const colorForScore = (score: number, fallback: string) => {
    if (score >= 8) return "#f43f5e";
    if (score >= 5) return "#fb923c";
    if (score > 0) return "#facc15";
    return fallback;
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]" ref={containerRef}>
      {/* Topology Canvas Screen */}
      <div className="relative rounded-lg border border-white/10 bg-[#030712] overflow-hidden group shadow-[inset_0_2px_24px_rgba(0,0,0,0.85)]">

        {/* Style Overrides for static flows */}
        <style>{`
          @keyframes link-flow {
            to {
              stroke-dashoffset: -20;
            }
          }
          .active-link-flow {
            stroke-dasharray: 6, 4;
            animation: link-flow 0.8s linear infinite;
          }
        `}</style>

        {/* Control toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={() => setShowLabels(!showLabels)}
            className="flex items-center gap-1.5 rounded border border-white/10 bg-[#08111f]/90 px-2.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
            title="Toggle Text Labels"
          >
            <Activity className="h-3.5 w-3.5" />
            <span>{showLabels ? "Hide Labels" : "Show Labels"}</span>
          </button>
          <button
            onClick={resetLayout}
            className="flex items-center gap-1.5 rounded border border-white/10 bg-[#08111f]/90 px-2.5 py-1.5 text-xs text-slate-300 hover:text-slate-100 hover:bg-white/5 transition-all"
            title="Reset Simulation Positions"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Layout</span>
          </button>
          <div className="flex overflow-hidden rounded border border-white/10 bg-[#08111f]/90 text-xs text-slate-300">
            {[
              ["effective", "Effective Risk"],
              ["exposure", "Exposure"],
              ["vulnerability", "Vulnerability"]
            ].map(([mode, label]) => (
              <button
                key={mode}
                onClick={() => setGraphMode(mode as typeof graphMode)}
                className={`px-2.5 py-1.5 transition-colors ${graphMode === mode ? "bg-[#32e6ff]/15 text-[#32e6ff]" : "hover:bg-white/5 hover:text-slate-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Interaction Help Badge */}
        <div className="absolute top-4 right-4 z-10 hidden items-center gap-1.5 rounded-full bg-slate-950/70 border border-[#32e6ff]/20 px-2.5 py-1 font-mono text-[9px] text-[#32e6ff] tracking-wide sm:flex">
          <MousePointerClick className="h-3 w-3 animate-pulse" />
          <span>Interactive Canvas: Drag nodes to position</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-10 hidden flex-wrap gap-2.5 bg-[#050b16]/75 px-3 py-2 rounded-md border border-white/5 backdrop-blur-md md:flex">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }}></span>
              <span className="text-slate-400 font-mono">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Canvas SVG */}
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full select-none cursor-grab active:cursor-grabbing"
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        >
          <defs>
            {/* Dynamic glowing drop-shadow filters */}
            {Object.keys(categoryConfig).map((key) => (
              <filter id={`glow-${key}`} key={key} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}

            {/* Custom arrow definitions */}
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="23"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="rgba(255,255,255,0.12)" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="23"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#32e6ff" />
            </marker>
          </defs>

          {/* Sci-fi tech grid */}
          <pattern id="svg-grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#svg-grid)" />

          {/* 1. Connections Layer */}
          <g>
            {graph.edges.map((edge, idx) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const active = isEdgeHighlighted(edge);
              const strokeColor = active ? "#32e6ff" : "rgba(255, 255, 255, 0.06)";
              const strokeWidth = active ? 2 : 1.2;

              return (
                <g key={`edge-${idx}`}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={active && hoveredNode ? "url(#arrow-active)" : "url(#arrow)"}
                    className={`transition-all duration-300 ${active && hoveredNode ? "active-link-flow" : ""}`}
                  />
                </g>
              );
            })}
          </g>

          {/* 2. Interactive Nodes Layer */}
          <g>
            {nodes.map((node) => {
              const active = isNodeHighlighted(node.id);
              const isSelected = selectedNode?.id === node.id;
              const isBeingDragged = draggedNodeId === node.id;
              const config = categoryConfig[node.label] || categoryConfig.SoftwareComponent;

              const score = displayScore(node);
              const scoreColor = colorForScore(score, config.color);
              const exposureRadius = 18 + Math.max(0, node.exposureScore) * 1.25;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-grab active:cursor-grabbing transition-opacity duration-300"
                  style={{ opacity: active ? 1 : 0.25 }}
                >
                  {/* Transparent Target circle for generous touch/mouse target area with absolute mouse capturing */}
                  <circle r="25" fill="rgba(0,0,0,0)" pointerEvents="all" className="cursor-grab active:cursor-grabbing" />

                  {/* Outer glow during drag / selection */}
                  {(hoveredNode === node.id || isSelected || isBeingDragged) && (
                    <circle
                      r={exposureRadius}
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth={1 + Math.max(0, node.exposureScore) / 5}
                      strokeDasharray="4,4"
                      className="animate-spin"
                      style={{ animationDuration: "12s" }}
                    />
                  )}

                  {/* Soft Background blur fill */}
                  <circle
                    r="15"
                    fill={config.glow}
                    className="transition-all duration-300"
                    style={{
                      transform: hoveredNode === node.id || isSelected ? "scale(1.3)" : "scale(1)"
                    }}
                  />

                  {/* Node Core circle */}
                  <circle
                    r="9.5"
                    fill="#030712"
                    stroke={scoreColor}
                    strokeWidth={isSelected || isBeingDragged ? 3.5 : 2.5}
                    filter={`url(#glow-${node.label})`}
                    className="transition-all duration-200"
                  />

                  {/* Score Indicator core */}
                  {node.vulnerabilityScore > 0 && (
                    <circle
                      r="3.5"
                      fill={scoreColor}
                    />
                  )}

                  {/* Dynamic Floating labels */}
                  {showLabels && (
                    <g transform="translate(0, 24)" className="select-none">
                      <rect
                        x={-Math.min(100, node.name.length * 4) - 6}
                        y="-10"
                        width={Math.min(200, node.name.length * 8) + 12}
                        height="16"
                        fill="rgba(3, 7, 18, 0.9)"
                        rx="4"
                        stroke="rgba(255,255,255,0.07)"
                        strokeWidth="0.8"
                      />
                      <text
                        textAnchor="middle"
                        fill={active ? "#f8fafc" : "#94a3b8"}
                        fontSize="9"
                        fontWeight={isSelected ? "bold" : "normal"}
                        className="font-mono tracking-wider"
                      >
                        {node.name.length > 20 ? `${node.name.slice(0, 17)}...` : node.name}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Details Sidepanel (Glassmorphism card) */}
      <aside className="flex flex-col gap-4">
        {selectedNode ? (
          <div className="aether-panel flex-1 rounded-lg border border-white/10 bg-[#08111f]/95 p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between">
            {/* Header info */}
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#32e6ff]">
                    {categoryConfig[selectedNode.label]?.label || selectedNode.label}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-100">{selectedNode.name}</h3>
                </div>
                <span className="font-mono text-xs text-slate-500">ID: {selectedNode.id}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-md border border-white/5 bg-[#050a14] p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Effective Risk</p>
                  <div className="mt-2 flex items-center justify-center gap-1.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full`}
                      style={{ backgroundColor: colorForScore(selectedNode.effectiveRiskScore || selectedNode.vulnerabilityScore, "#10b981") }}
                    ></span>
                    <span className="font-mono text-base font-bold text-slate-200">
                      {(selectedNode.effectiveRiskScore || selectedNode.vulnerabilityScore).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="rounded-md border border-white/5 bg-[#050a14] p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Exposure</p>
                  <p className="mt-2 text-base font-bold text-slate-200">
                    {selectedNode.exposureScore.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-md border border-white/5 bg-[#050a14] p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Vulnerability</p>
                  <p className="mt-2 text-base font-bold text-slate-200">
                    {selectedNode.vulnerabilityScore.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-md border border-white/5 bg-[#050a14] p-3 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 font-mono">Confidence</p>
                  <p className="mt-2 text-base font-bold text-slate-200">
                    {(selectedNode.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Attributes / Details */}
              <div className="space-y-4">
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    Exposure Context
                  </p>
                  <div className="rounded-md border border-white/5 bg-black/20 p-3 text-sm text-slate-300">
                    <p className="font-mono text-xs text-slate-200">{selectedNode.exposureLevel}</p>
                    {selectedNode.exposurePath?.length ? (
                      <p className="mt-2 text-xs leading-5 text-slate-400">{selectedNode.exposurePath.join(" -> ")}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(selectedNode.exposureReasons.length ? selectedNode.exposureReasons : ["No explicit exposure evidence detected."]).map((reason) => (
                        <span key={reason} className="rounded border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[9px] text-slate-400">
                          {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    Cryptographic Primitives
                  </p>
                  <div className="rounded-md border border-white/5 bg-black/20 p-3 leading-6 text-sm text-slate-300">
                    {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                        {Object.entries(selectedNode.attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-white/5 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-500">{key}</span>
                            <span className="text-slate-200 text-right truncate max-w-[160px]">
                              {typeof value === "object" ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Info className="h-4 w-4" />
                        <span>No raw primitive attributes annotated on this node.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Source mapping */}
                {selectedNode.sourceArtifactIds && selectedNode.sourceArtifactIds.length > 0 && (
                  <div>
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">Source Evidence</p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {selectedNode.sourceArtifactIds.map((id) => (
                        <span
                          key={id}
                          className="rounded border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[9px] text-slate-400"
                        >
                          {id.slice(0, 8)}...
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint */}
            <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#32e6ff] shrink-0" />
              <span>Click and drag nodes to arrange. Click anywhere on canvas to pan.</span>
            </div>
          </div>
        ) : (
          <div className="aether-panel flex-1 rounded-lg border border-white/10 bg-[#08111f]/95 p-6 backdrop-blur-md flex flex-col items-center justify-center text-center text-slate-500">
            <Info className="h-8 w-8 text-slate-600 mb-3" />
            <p className="text-sm">Select a topology node to inspect cryptographic details and active exposure scores.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
