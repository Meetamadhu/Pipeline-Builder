import { create } from 'zustand';
import {
  Edge,
  Node,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  NodeChange,
  EdgeChange,
} from 'reactflow';

import { uid } from '../utils/nodeDefs';
import { NodeKind as NodeKindDef } from '../utils/nodeDefs';
export type NodeKind = NodeKindDef;

export interface BaseNodeData {
  label: string;
  kind: NodeKind;
}

export interface InputNodeData extends BaseNodeData {
  kind: 'input';
  value: string;
}

export interface OutputNodeData extends BaseNodeData {
  kind: 'output';
  outputType: 'text' | 'json';
}

export interface LLMNodeData extends BaseNodeData {
  kind: 'llm';
  model: string;
  temperature: number;
  prompt: string;
}

export interface TextNodeData extends BaseNodeData {
  kind: 'text';
  text: string;
  variables: string[];
}

export interface HttpNodeData extends BaseNodeData {
  kind: 'http';
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers: string;
}

export interface TransformNodeData extends BaseNodeData {
  kind: 'transform';
  expression: string;
}

export interface BranchNodeData extends BaseNodeData {
  kind: 'branch';
  condition: string;
}

export interface DatabaseNodeData extends BaseNodeData {
  kind: 'database';
  connectionId: string;
  query: string;
}

export interface LoggerNodeData extends BaseNodeData {
  kind: 'logger';
  message: string;
}

export type PipelineNodeData =
  | InputNodeData
  | OutputNodeData
  | LLMNodeData
  | TextNodeData
  | HttpNodeData
  | TransformNodeData
  | BranchNodeData
  | DatabaseNodeData
  | LoggerNodeData;

export type PipelineEdge = Edge;
export type PipelineNode = Node<PipelineNodeData>;

interface PipelineState {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  nodeIdCounter: number;
  intersectingNodeIds: Record<string, string[]>;
  /** When user is dragging from a handle, set so targets can highlight */
  connectionSource: { nodeId: string; handleId: string | null; handleType: 'source' | 'target' } | null;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, data: Partial<PipelineNodeData>) => void;
  deleteNode: (id: string) => void;
  addEdge: (connection: Connection, label?: string) => void;
  deleteEdge: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  setNodes: (nodes: PipelineNode[]) => void;
  setEdges: (edges: PipelineEdge[]) => void;
  setIntersectingNodeIds: (intersectingNodeIds: Record<string, string[]>) => void;
  setConnectionSource: (cs: PipelineState['connectionSource']) => void;
}

const STORAGE_KEY = 'pipeline-builder-state';

const ROTATABLE_TYPE = 'rotatable';

const loadInitialState = (): Pick<PipelineState, 'nodes' | 'edges' | 'nodeIdCounter'> => {
  if (typeof window === 'undefined') return { nodes: [], edges: [], nodeIdCounter: 1 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [], nodeIdCounter: 1 };
    const parsed = JSON.parse(raw) as { nodes?: PipelineNode[]; edges?: PipelineEdge[]; nodeIdCounter?: number };
    const allNodes = parsed.nodes ?? [];
    const allEdges = parsed.edges ?? [];
    // Remove deprecated rotatable nodes and any edges touching them
    const rotatableIds = new Set(allNodes.filter((n) => n.type === ROTATABLE_TYPE).map((n) => n.id));
    const nodes = allNodes.filter((n) => n.type !== ROTATABLE_TYPE);
    const edges = allEdges.filter((e) => !rotatableIds.has(e.source) && !rotatableIds.has(e.target));
    return {
      nodes,
      edges,
      nodeIdCounter: parsed.nodeIdCounter ?? (parsed.nodes?.length ?? 0) + 1,
    };
  } catch {
    return { nodes: [], edges: [], nodeIdCounter: 1 };
  }
};

function persist(nodes: PipelineNode[], edges: PipelineEdge[], nodeIdCounter: number) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges, nodeIdCounter }));
  }
}

function buildNodeData(kind: NodeKind): PipelineNodeData {
  const label = kind.toUpperCase();
  switch (kind) {
    case 'input':     return { kind, label, value: '' };
    case 'output':    return { kind, label, outputType: 'text' };
    case 'llm':       return { kind, label, model: 'gpt-4', temperature: 0.7, prompt: '' };
    case 'text':      return { kind, label, text: '', variables: [] };
    case 'http':      return { kind, label, url: 'https://api.example.com', method: 'GET', headers: '' };
    case 'transform': return { kind, label, expression: 'output = input' };
    case 'branch':    return { kind, label, condition: 'score > 0.8' };
    case 'database':  return { kind, label, connectionId: 'default', query: 'SELECT * FROM table' };
    case 'logger':    return { kind, label, message: '' };
  }
}

export const usePipelineStore = create<PipelineState>((set) => ({
  ...loadInitialState(),
  intersectingNodeIds: {},
  connectionSource: null,

  addNode: (kind, position) =>
    set((state) => {
      const id = uid();
      const node: PipelineNode = { id, type: kind, data: buildNodeData(kind), position };
      const nodes = [...state.nodes, node];
      const nodeIdCounter = state.nodeIdCounter + 1;
      persist(nodes, state.edges, nodeIdCounter);
      return { nodes, nodeIdCounter };
    }),

  updateNodeData: (id, data) =>
    set((state) => {
      const nodes = state.nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...data } as PipelineNodeData } : n,
      );
      persist(nodes, state.edges, state.nodeIdCounter);
      return { nodes };
    }),

  deleteNode: (id) =>
    set((state) => {
      const nodes = state.nodes.filter((n) => n.id !== id);
      const edges = state.edges.filter((e) => e.source !== id && e.target !== id);
      const intersectingNodeIds = { ...state.intersectingNodeIds };
      delete intersectingNodeIds[id];
      for (const nodeId in intersectingNodeIds) {
        intersectingNodeIds[nodeId] = intersectingNodeIds[nodeId].filter((nId) => nId !== id);
        if (intersectingNodeIds[nodeId].length === 0) delete intersectingNodeIds[nodeId];
      }
      persist(nodes, edges, state.nodeIdCounter);
      return { nodes, edges, intersectingNodeIds };
    }),

  addEdge: (connection, label) =>
    set((state) => {
      const edge: PipelineEdge = {
        id: uid(),
        source: connection.source ?? '',
        target: connection.target ?? '',
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        ...(label != null && { label }),
      };
      if (state.edges.some((e) => e.id === edge.id)) return state;
      const edges = [...state.edges, edge];
      persist(state.nodes, edges, state.nodeIdCounter);
      return { edges };
    }),

  deleteEdge: (id) =>
    set((state) => {
      const edges = state.edges.filter((e) => e.id !== id);
      persist(state.nodes, edges, state.nodeIdCounter);
      return { edges };
    }),

  onNodesChange: (changes) =>
    set((state) => {
      const nodes = applyNodeChanges(changes, state.nodes) as PipelineNode[];
      persist(nodes, state.edges, state.nodeIdCounter);
      return { nodes };
    }),

  onEdgesChange: (changes) =>
    set((state) => {
      const edges = applyEdgeChanges(changes, state.edges) as PipelineEdge[];
      persist(state.nodes, edges, state.nodeIdCounter);
      return { edges };
    }),

  setNodes: (nodes) =>
    set((state) => {
      persist(nodes, state.edges, state.nodeIdCounter);
      return { nodes };
    }),

  setEdges: (edges) =>
    set((state) => {
      persist(state.nodes, edges, state.nodeIdCounter);
      return { edges };
    }),

  setIntersectingNodeIds: (intersectingNodeIds) =>
    set(() => ({ intersectingNodeIds })),
  setConnectionSource: (connectionSource) =>
    set(() => ({ connectionSource })),
}));