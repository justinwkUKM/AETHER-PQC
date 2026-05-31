"use client";

import React, { useState, useEffect, useRef } from "react";
import type { GraphSnapshot, GraphNode, GraphEdge } from "@/types/graph";
import { Shield, Zap, Info, RotateCcw, Activity, MousePointerClick, Network, FileText, GitBranch, X } from "lucide-react";
import {
  confidenceLabel,
  describeEvidence,
  evidenceBadge,
  explainEdge,
  explainNode,
  interpretArchitecture,
  isSyntheticNetworkContext,
  scoreExplanation,
  threatPathSummary,
  type ArtifactEvidence,
  type GraphConnection
} from "@/lib/graph-explanations";

type PositionedNode = GraphNode & {
  x: number;
  y: number;
};

type ArtifactReference = ArtifactEvidence & {
  rawPayload?: string | null;
};

const categoryConfig = {
  BusinessProcess: { color: "#91a7ff", label: "Business Process", glow: "rgba(145,167,255,0.16)" },
  Application: { color: "#74c0fc", label: "Application", glow: "rgba(116,192,252,0.14)" },
  SoftwareComponent: { color: "#b197fc", label: "Software Component", glow: "rgba(177,151,252,0.14)" },
  DataAsset: { color: "#ffd43b", label: "Data Asset", glow: "rgba(255,212,59,0.12)" },
  CryptoAsset: { color: "#f783ac", label: "Crypto Asset", glow: "rgba(247,131,172,0.14)" },
  ExternalService: { color: "#63e6be", label: "External Service", glow: "rgba(99,230,190,0.12)" }
} satisfies Record<GraphNode["label"], { color: string; label: string; glow: string }>;

export function RiskGraph({ projectId, graph, artifacts = [] }: { projectId: string; graph: GraphSnapshot; artifacts?: ArtifactReference[] }) {
  const [nodes, setNodes] = useState<PositionedNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<PositionedNode | null>(null);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [graphMode, setGraphMode] = useState<"effective" | "exposure" | "vulnerability">("effective");

  const [simulatedUpgradedNodeIds, setSimulatedUpgradedNodeIds] = useState<Set<string>>(new Set());
  const [isSandboxMode, setIsSandboxMode] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(false);
  const [inspectingArtifact, setInspectingArtifact] = useState<ArtifactReference | null>(null);

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
      <div className="rounded-lg border border-dashed border-white/12 bg-white/3 p-8 text-center text-slate-400">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#91a7ff]/20 bg-[#91a7ff]/8">
          <Shield className="h-6 w-6 text-[#91a7ff]" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-100">No architecture findings yet</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6">
          Upload architecture diagrams, SBOM/CBOM files, TLS notes, screenshots, PDFs, or text artifacts. AETHER will build a relationship map that explains crypto findings, exposure paths, and source evidence here.
        </p>
        <div className="mx-auto mt-5 grid max-w-2xl gap-2 text-left text-xs leading-5 text-slate-500 sm:grid-cols-3">
          <div className="rounded-md border border-white/8 bg-black/20 p-3">1. Extract systems, services, data assets, and crypto primitives.</div>
          <div className="rounded-md border border-white/8 bg-black/20 p-3">2. Infer exposure from ingress, public APIs, gateways, TLS, and partner paths.</div>
          <div className="rounded-md border border-white/8 bg-black/20 p-3">3. Explain what matters, why it matters, and where evidence came from.</div>
        </div>
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
  const artifactMap = new Map(artifacts.map((artifact) => [artifact.id, artifact]));
  const displayScore = (node: GraphNode) => {
    if (simulatedUpgradedNodeIds.has(node.id)) return 1.0;
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
  const simulatedRiskScore = nodes.length > 0 
    ? nodes.map(n => simulatedUpgradedNodeIds.has(n.id) ? 1.0 : (n.effectiveRiskScore || n.vulnerabilityScore))
        .reduce((sum, s) => sum + s, 0) / nodes.length
    : 0;
  const selectedConnections = selectedNode
    ? graph.edges
        .filter((edge) => edge.source === selectedNode.id || edge.target === selectedNode.id)
        .map((edge) => {
          const otherId = edge.source === selectedNode.id ? edge.target : edge.source;
          return {
            direction: edge.source === selectedNode.id ? "outbound" : "inbound",
            edge,
            node: graph.nodes.find((node) => node.id === otherId)
          };
        })
        .filter((connection): connection is GraphConnection => Boolean(connection.node))
    : [];
  const selectedExplanation = selectedNode ? explainNode(selectedNode) : null;
  const selectedInterpretation = selectedNode ? interpretArchitecture(selectedNode, graph, selectedConnections) : null;
  const selectedEvidence = selectedNode ? describeEvidence(selectedNode, artifactMap) : null;
  const selectedThreatPath = selectedNode ? threatPathSummary(selectedNode, graph, selectedConnections) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]" ref={containerRef}>
      {/* Topology Canvas Screen */}
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[radial-gradient(circle_at_50%_12%,rgba(145,167,255,0.10),transparent_34%),#0b0d14] group">

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
                className={`px-2.5 py-1.5 transition-colors ${graphMode === mode ? "bg-white/10 text-[var(--accent-cyan)]" : "hover:bg-white/5 hover:text-slate-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setIsSandboxMode(!isSandboxMode);
              if (isSandboxMode) {
                setSimulatedUpgradedNodeIds(new Set());
              }
            }}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-all ${
              isSandboxMode 
                ? "border-[var(--border-strong)] bg-white/10 text-[var(--accent-cyan)] font-semibold"
                : "border-white/10 bg-[#08111f]/90 text-slate-300 hover:text-slate-100 hover:bg-white/5"
            }`}
            title="Toggle What-If Simulation Sandbox"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{isSandboxMode ? "Sandbox ACTIVE" : "Sandbox Mode"}</span>
          </button>
        </div>

        {/* Sandbox Risk Calculator HUD */}
        {isSandboxMode && (
          <div className="absolute top-16 left-4 z-10 flex max-w-[240px] flex-col gap-1 rounded border border-[var(--border-strong)] bg-[rgba(13,15,24,0.9)] p-3 text-xs text-[var(--accent-cyan)] shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-[var(--accent-cyan)]" />
              <span className="font-semibold">What-if simulation</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Upgrades: <span className="font-semibold text-[var(--accent-cyan)]">{simulatedUpgradedNodeIds.size} nodes</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Risk:{" "}
              <span className="text-slate-300 line-through">
                {(nodes.reduce((sum, n) => sum + (n.effectiveRiskScore || n.vulnerabilityScore), 0) / (nodes.length || 1)).toFixed(1)}
              </span>
              {" "}➔{" "}
              <span className="font-semibold text-[var(--accent-cyan)]">
                {simulatedRiskScore.toFixed(1)}
              </span>
            </p>
          </div>
        )}

        {/* Interaction Help Badge */}
        <div className="absolute top-4 right-4 z-10 hidden items-center gap-1.5 rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] text-slate-400 backdrop-blur-sm sm:flex">
          <MousePointerClick className="h-3 w-3" />
          <span>Drag nodes to position</span>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 right-4 z-10 hidden flex-wrap gap-2.5 rounded-md border border-white/5 bg-black/25 px-3 py-2 backdrop-blur-md md:flex">
          {Object.entries(categoryConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5 text-[10px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: config.color }}></span>
              <span className="text-slate-400 font-mono">{config.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 text-[10px] text-slate-500">
            <span>Core color = selected score</span>
            <span>Ring size = exposure</span>
            <span>Lines = extracted relationships</span>
          </div>
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
            {/* Minimal particle glow filters */}
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
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#91a7ff" />
            </marker>
          </defs>

          {/* Minimal field background */}
          <pattern id="svg-grid" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M 0 36 C 18 30, 54 42, 72 36" fill="none" stroke="rgba(145,167,255,0.035)" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#svg-grid)" />

          {/* 1. Connections Layer */}
          <g>
            {graph.edges.map((edge, idx) => {
              const src = nodeMap.get(edge.source);
              const tgt = nodeMap.get(edge.target);
              if (!src || !tgt) return null;

              const active = isEdgeHighlighted(edge);
              const strokeColor = active ? "#91a7ff" : "rgba(255, 255, 255, 0.08)";
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
                  >
                    <title>{`${nodeMap.get(edge.source)?.name ?? edge.source} ${edge.type.replaceAll("_", " ").toLowerCase()} ${nodeMap.get(edge.target)?.name ?? edge.target}. ${explainEdge(edge.type, "outbound")}`}</title>
                  </line>
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
              const badge = evidenceBadge(node);

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

                  {/* Simulated Upgrade outer spinning ring */}
                  {simulatedUpgradedNodeIds.has(node.id) && (
                    <circle
                      r="16"
                      fill="none"
                      stroke="#91a7ff"
                      strokeWidth="2.5"
                      strokeDasharray="3,3"
                      className="animate-spin"
                      style={{ animationDuration: "6s" }}
                    />
                  )}

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
                  <title>{`${node.name}: ${badge}. Effective risk ${(node.effectiveRiskScore || node.vulnerabilityScore).toFixed(1)}, exposure ${node.exposureScore.toFixed(1)}, confidence ${(node.confidence * 100).toFixed(0)}%.`}</title>

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
                      {(isSyntheticNetworkContext(node) || node.confidence < 0.6) && (
                        <text
                          y="19"
                          textAnchor="middle"
                          fill={node.confidence < 0.6 ? "#facc15" : "#91a7ff"}
                          fontSize="7"
                          className="font-mono uppercase tracking-wider"
                        >
                          {isSyntheticNetworkContext(node) ? "inferred" : "review"}
                        </text>
                      )}
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
                  <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#91a7ff]">
                    {categoryConfig[selectedNode.label]?.label || selectedNode.label}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-slate-100">{selectedNode.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className="rounded-full border border-[#91a7ff]/20 bg-[#91a7ff]/8 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[#91a7ff]">
                      {evidenceBadge(selectedNode)}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/3 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-400">
                      {selectedNode.exposureLevel.replaceAll("_", " ")}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-500">ID: {selectedNode.id}</span>
              </div>

              {/* Sandbox Upgrade Switch */}
              {isSandboxMode && (
                <div className="mb-4 rounded border border-[#91a7ff]/30 bg-[#91a7ff]/5 p-3 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5 text-[#91a7ff]">
                    <Zap className="h-3.5 w-3.5 animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">What-If Upgrade Mock</span>
                  </div>
                  <button
                    onClick={() => {
                      setSimulatedUpgradedNodeIds((prev) => {
                        const next = new Set(prev);
                        if (next.has(selectedNode.id)) {
                          next.delete(selectedNode.id);
                        } else {
                          next.add(selectedNode.id);
                        }
                        return next;
                      });
                    }}
                    className={`aether-button w-full py-2 text-[10px] font-semibold ${
                      simulatedUpgradedNodeIds.has(selectedNode.id)
                        ? "bg-[#91a7ff]/20 text-[#91a7ff] border-[#91a7ff]/40 animate-pulse"
                        : "bg-[#91a7ff]/10 text-slate-100 border-[#91a7ff]/20 hover:border-[#91a7ff]/60"
                    }`}
                  >
                    <Shield className="h-3.5 w-3.5 shrink-0" />
                    {simulatedUpgradedNodeIds.has(selectedNode.id) ? "Revoke PQC Simulation" : "Simulate PQC Upgrade"}
                  </button>
                </div>
              )}

              {selectedExplanation ? (
                <div className="mb-5 rounded-lg border border-[#91a7ff]/15 bg-[#91a7ff]/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-[#91a7ff]">
                    <Info className="h-4 w-4" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em]">What this means</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-200">{selectedExplanation.summary}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-400">{selectedExplanation.why}</p>
                </div>
              ) : null}

              {selectedInterpretation ? (
                <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-500">Architecture interpretation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">{selectedInterpretation.summary}</p>
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-400">
                    <div>
                      <span className="text-slate-300">Likely threat path: </span>
                      {selectedThreatPath}
                    </div>
                    <div>
                      <span className="text-slate-300">Exposure signal: </span>
                      {selectedInterpretation.exposure}
                    </div>
                    <div>
                      <span className="text-slate-300">Evidence signal: </span>
                      {selectedEvidence}
                    </div>
                    <div>
                      <span className="text-slate-300">Architect action: </span>
                      {selectedInterpretation.action}
                    </div>
                  </div>
                </div>
              ) : null}

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
                  <p className="mt-1 text-[10px] text-slate-500">{confidenceLabel(selectedNode.confidence)}</p>
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
                    <p className="mt-2 text-xs leading-5 text-slate-400">
                      {formatExposurePath(selectedNode, graph)}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {scoreExplanation(selectedNode)}
                    </p>
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
                    Connected Items
                  </p>
                  <div className="rounded-md border border-white/5 bg-black/20 p-3">
                    {selectedConnections.length > 0 ? (
                      <div className="space-y-2">
                        {selectedConnections.slice(0, 6).map(({ direction, edge, node }) => (
                          <div key={`${edge.source}-${edge.target}-${edge.type}`} className="flex items-start gap-2 rounded border border-white/5 bg-white/3 px-2 py-2">
                            <GitBranch className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#91a7ff]" />
                            <div className="min-w-0">
                              <p className="truncate text-xs text-slate-200">
                                {direction === "outbound" ? "This item connects to " : "Connected from "}
                                <span className="text-slate-100">{node.name}</span>
                              </p>
                              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-slate-500">
                                {edge.type.replaceAll("_", " ")} · {direction}
                              </p>
                              <p className="mt-1 text-[10px] leading-4 text-slate-500">{explainEdge(edge.type, direction)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Network className="h-4 w-4" />
                        <span>No relationships were extracted for this item yet.</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">
                    Extracted Details
                  </p>
                  <div className="rounded-md border border-white/5 bg-black/20 p-3 leading-6 text-sm text-slate-300">
                    {selectedNode.attributes && Object.keys(selectedNode.attributes).length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                        {Object.entries(selectedNode.attributes).map(([key, value]) => (
                          <div key={key} className="flex justify-between border-b border-white/5 pb-1 last:border-0 last:pb-0">
                            <span className="text-slate-500">{formatAttributeKey(key)}</span>
                            <span className="text-slate-200 text-right truncate max-w-[160px]">
                              {formatAttributeValue(value)}
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
                    <p className="mb-2 font-mono text-[9px] uppercase tracking-wider text-slate-500">Source Evidence (Audit Tracer)</p>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {selectedNode.sourceArtifactIds.map((id) => {
                        const art = artifactMap.get(id);
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              if (art) {
                                setInspectingArtifact(art);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/3 hover:bg-white/10 hover:border-[#91a7ff]/30 transition px-2 py-1 font-mono text-[9px] text-slate-400 text-left"
                            title={art?.name ?? id}
                          >
                            <FileText className="h-3 w-3 text-[#91a7ff]" />
                            <span className="truncate max-w-[120px]">{art?.name ?? `${id.slice(0, 8)}...`}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Exporter Bridge Panel */}
                {selectedNode && (selectedNode.vulnerabilityScore >= 4.0 || selectedNode.label === "CryptoAsset") && (
                  <div className="mt-4 border-t border-white/5 pt-4 space-y-2">
                    <p className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold">DevSecOps & Compliance Exporter</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const ticketMarkdown = `
# 🚨 PQC MIGRATION TASK: Upgrade Cryptographic Primitives in ${selectedNode.name}

## 📊 Vulnerability Snapshot
* **Affected Component**: \`${selectedNode.name}\`
* **Vulnerable Classical Primitive**: \`${selectedNode.attributes?.encryptionStandard || selectedNode.attributes?.algorithm || "Classical Key Exchange/Signature"}\`
* **Post-Quantum Safe Primitive**: \`${selectedNode.attributes?.targetMigration || "ML-KEM-768 / ML-DSA"}\`
* **Priority Level**: **${selectedNode.vulnerabilityScore >= 8 ? "CRITICAL" : "HIGH"}**

## 🛡️ Threat Vector Description
Network assets are vulnerable to Harvest Now, Decrypt Later (HNDL) attacks. Traffic paths through \`${formatExposurePath(selectedNode, graph)}\` can be compromised.

## 🛠️ Step-by-Step Action Plan
- [ ] 1. Identify active dependencies referencing legacy algorithms.
- [ ] 2. Update config keys to enable dual hybrid key agreements.
- [ ] 3. Deploy PQC compliance patches and revalidate project risk score.

---
*Generated by Aether PQC Compliance Suite*`;
                          navigator.clipboard.writeText(ticketMarkdown);
                          setCopiedIndex(true);
                          setTimeout(() => setCopiedIndex(false), 2000);
                        }}
                        className="aether-button aether-button-secondary flex-1 py-2 text-[10px] bg-white/3 hover:bg-white/10 animate-fade-in"
                      >
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[#91a7ff]" />
                        <span>{copiedIndex ? "Copied Task!" : "Copy Jira Ticket"}</span>
                      </button>

                      <a
                        href={`/api/projects/${projectId}/cbom`}
                        download
                        className="aether-button aether-button-secondary flex-1 py-2 text-[10px] bg-white/3 hover:bg-white/10"
                        title="Download CycloneDX CBOM for this Project"
                      >
                        <Network className="h-3.5 w-3.5 shrink-0 text-[#91a7ff]" />
                        <span>Export CBOM</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Hint */}
            <div className="mt-6 border-t border-white/5 pt-4 text-xs text-slate-500 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[#91a7ff] shrink-0" />
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

      {/* Dynamic Evidence Viewer Modal */}
      {inspectingArtifact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div className="aether-panel w-full max-w-3xl rounded-lg border border-[#91a7ff]/30 bg-[#08111f]/95 p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#91a7ff]">Audit Evidence Payload</p>
                <h3 className="text-base font-bold text-slate-100 mt-1">{inspectingArtifact.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingArtifact(null)}
                className="rounded border border-white/10 p-1.5 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto rounded bg-black/40 border border-white/5 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-5 max-h-[55vh]">
              {inspectingArtifact.rawPayload || "No raw evidence payload was serialised/extracted for this asset."}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatExposurePath(node: GraphNode, graph: GraphSnapshot) {
  if (!node.exposurePath?.length) return "No explicit exposure path was extracted yet.";
  const names = node.exposurePath.map((id) => graph.nodes.find((item) => item.id === id)?.name ?? id);
  return names.join(" -> ");
}

function formatAttributeKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatAttributeValue(value: unknown) {
  if (typeof value === "object" && value !== null) return JSON.stringify(value);
  if (value === "text") return "Detected in extracted text";
  return String(value);
}
