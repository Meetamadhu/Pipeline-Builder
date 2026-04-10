import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Connection,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { usePipelineStore } from './store/pipelineStore';
import type { PipelineEdge } from './store/pipelineStore';
import { NodeKind, useNodeDefs } from './utils/nodeDefs';
import { useToast } from './components/ToastProvider';
import {
  isValidConnectionType,
  getEdgeLabel,
} from './utils/connectionValidation';

import {
  InputNode,
  OutputNode,
  LLMNode,
  TextNode,
  HttpNode,
  TransformNode,
  BranchNode,
  DatabaseNode,
  LoggerNode,
} from './nodes';

import { Sidebar } from './components/Sidebar';
import { SubmitButton } from './components/SubmitButton';
import { CustomConnectionLine } from './components/CustomConnectionLine';

const nodeTypes = {
  input: InputNode,
  output: OutputNode,
  llm: LLMNode,
  text: TextNode,
  http: HttpNode,
  transform: TransformNode,
  branch: BranchNode,
  database: DatabaseNode,
  logger: LoggerNode,
};

export default function App() {
  const {
    nodes,
    edges,
    addNode,
    addEdge,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    setConnectionSource,
  } = usePipelineStore();

  const { defs: NODE_DEFS } = useNodeDefs();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { zoomIn, zoomOut, fitView: fitCanvas } = useReactFlow();

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const kind = e.dataTransfer.getData('application/reactflow') as NodeKind;
    if (!kind) return;

    const bounds = (e.target as HTMLElement).closest('.react-flow')?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: e.clientX - bounds.left - 110,
      y: e.clientY - bounds.top - 50,
    };

    addNode(kind, position);
    showToast(`✓ ${kind} node added`);
  }, [addNode, showToast]);

  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;
      if (!isValidConnectionType(connection, nodes)) return false;
      return true;
    },
    [nodes]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      if (!isValidConnectionType(connection, nodes)) {
        showToast('Invalid connection: port types do not match', 'error');
        return;
      }
      const label = getEdgeLabel(connection, nodes);
      addEdge(connection, label);
      showToast('✓ Edge connected');
    },
    [nodes, addEdge, showToast]
  );

  const onConnectStart = useCallback(
    (_: React.MouseEvent | React.TouchEvent, params: { nodeId: string | null; handleId: string | null; handleType: 'source' | 'target' | null }) => {
      if (params.handleType === 'source' && params.nodeId) {
        setConnectionSource({
          nodeId: params.nodeId,
          handleId: params.handleId,
          handleType: 'source',
        });
      }
    },
    [setConnectionSource]
  );

  const onConnectEnd = useCallback(() => {
    setConnectionSource(null);
  }, [setConnectionSource]);

  const handleExport = useCallback(() => {
    try {
      const data = JSON.stringify({ nodes, edges }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pipeline.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('✓ Pipeline exported as pipeline.json');
    } catch (e) {
      console.error('Export error', e);
      showToast('Failed to export pipeline', 'error');
    }
  }, [nodes, edges, showToast]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleImportFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result || '');
          const parsed = JSON.parse(text) as { nodes?: any[]; edges?: any[] };
          if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
            showToast('Invalid pipeline file format', 'error');
            return;
          }
          setNodes(parsed.nodes as any);
          setEdges(parsed.edges as any);
          showToast('✓ Pipeline loaded from file');
        } catch (e) {
          console.error('Import error', e);
          showToast('Failed to load pipeline file', 'error');
        } finally {
          event.target.value = '';
        }
      };
      reader.readAsText(file);
    },
    [setNodes, setEdges, showToast]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: PipelineEdge) => {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      const sourceName = sourceNode?.data?.label ?? sourceNode?.data?.kind ?? 'Unknown';
      const targetName = targetNode?.data?.label ?? targetNode?.data?.kind ?? 'Unknown';
      showToast(`🔗 ${sourceName} → ${targetName}`);
    },
    [nodes, showToast]
  );

  return (
    <div className="flex flex-col h-screen w-screen font-sans overflow-hidden app-root">
      <style>{`
        .app-root { background: var(--color-bg); }
        .react-flow { background: var(--color-bg); }
        .react-flow__node-input {
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          box-shadow: none !important;
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .react-flow__controls { bottom: 20px !important; left: 20px !important; }
        .react-flow__edge-path { stroke: var(--color-primary-light); }
        .react-flow__edge-text { fill: var(--color-text-muted); font-size: 10px; }
      `}</style>

      {/* Header */}
      <header
        className="header-panel flex items-center justify-between px-8 flex-shrink-0 z-50"
        style={{ height: 'var(--header-height)' }}
        role="banner"
      >
        {/* Left — logo + title */}
        <div className="flex items-center gap-4">
          <div className="header-logo" aria-hidden>⚡</div>
          <div className="header-divider" aria-hidden />
          <div className="leading-none">
            <div className="header-title">Pipeline Builder</div>
          </div>
        </div>

        {/* Center — live stats */}
        <div className="header-stats" aria-live="polite">
          <span className="header-stat">
            <span className="header-stat-value">{nodes.length}</span>
            <span className="header-stat-label">nodes</span>
          </span>
          <span className="header-stat-sep">·</span>
          <span className="header-stat">
            <span className="header-stat-value">{edges.length}</span>
            <span className="header-stat-label">edges</span>
          </span>
        </div>

        {/* Center-right — canvas controls */}
        <div className="flex items-center gap-1 header-zoom-group">
          <button type="button" onClick={() => zoomIn()} className="header-zoom-btn" data-tooltip="Zoom in" aria-label="Zoom in">＋</button>
          <button type="button" onClick={() => zoomOut()} className="header-zoom-btn" data-tooltip="Zoom out" aria-label="Zoom out">－</button>
          <button type="button" onClick={() => fitCanvas({ padding: 0.2 })} className="header-zoom-btn header-zoom-fit" data-tooltip="Fit canvas to nodes" aria-label="Fit view">⊡</button>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={handleImportClick} className="header-btn" data-tooltip="Load pipeline from a JSON file" aria-label="Load pipeline from a JSON file">
            <span aria-hidden>↑</span> Load
          </button>
          <button type="button" onClick={handleExport} className="header-btn" data-tooltip="Export pipeline as JSON" aria-label="Export pipeline as JSON">
            <span aria-hidden>↓</span> Export
          </button>
          <div className="header-divider" aria-hidden />
          <SubmitButton nodes={nodes} edges={edges} />
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges as PipelineEdge[]}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={handleConnect}
            onConnectStart={onConnectStart}
            onConnectEnd={onConnectEnd}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEdgeClick={handleEdgeClick}
            isValidConnection={isValidConnection}
            connectionLineComponent={CustomConnectionLine}
            nodesDraggable
            elementsSelectable
            nodeDragThreshold={0}
            fitView
            deleteKeyCode={['Delete', 'Backspace']}
          >
            <MiniMap
              position="bottom-right"
              className="minimap-panel"
              maskColor="var(--color-primary-bg)"
              nodeColor={(node) => {
                const kind = node.data?.kind as NodeKind;
                const def = kind ? NODE_DEFS[kind] : undefined;
                return def ? def.color : 'var(--color-primary)';
              }}
            />
          </ReactFlow>

          {/* Empty state */}
          {nodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 gap-6" role="status" aria-label="Canvas empty">
              <div className="p-8 text-center rounded-3xl border-2 border-dashed empty-state-card">
                <div className="text-5xl mb-4" aria-hidden>⚡</div>
                <div className="text-xl font-bold text-violet-200 mb-2 tracking-tight">Start building your pipeline in one line</div>
                <div className="text-sm text-slate-400">Drag nodes from the sidebar onto the canvas</div>
              </div>
              <div className="p-6 text-center rounded-2xl border empty-state-card min-w-96">
                <div className="text-xs font-bold text-violet-400/60 uppercase tracking-widest mb-4">How to use</div>
                <div className="flex flex-col gap-3 text-left">
                  {([
                    ['①', 'Drag a node from the sidebar onto the canvas'],
                    ['②', 'Connect output handles (→) to input handles (←). Green line = valid, red = invalid.'],
                    ['③', 'Edit node properties by clicking on them'],
                    ['④', 'Press Delete to remove selected nodes or edges'],
                    ['⑤', 'Hit Submit Pipeline to validate your DAG'],
                  ] as [string, string][]).map(([n, t]) => (
                    <div key={n} className="flex items-center gap-3">
                      <span className="text-lg text-violet-500 font-bold flex-shrink-0 w-6 text-center">{n}</span>
                      <span className="text-xs text-slate-400 leading-relaxed">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}