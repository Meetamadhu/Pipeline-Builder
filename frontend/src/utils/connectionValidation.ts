import type { Connection, Node } from 'reactflow';
import type { PipelineNodeData } from '../store/pipelineStore';

/** Data types that can flow through handles (simplified for validation) */
export type PortType = 'any' | 'text' | 'json';

/** For each node kind: handle id -> port type. Source handles output this type; target handles accept this type. */
const HANDLE_TYPES: Record<string, Record<string, PortType>> = {
  input: { src: 'any' },
  output: { tgt: 'any' },
  llm: { tgt: 'text', src: 'text' },
  text: { src: 'text' }, // target handles are dynamic (variable names) - all accept 'text'
  http: { tgt: 'any', src: 'json' },
  transform: { tgt: 'any', src: 'any' },
  branch: { tgt: 'any', true: 'any', false: 'any' },
  database: { tgt: 'any', src: 'json' },
  logger: { tgt: 'any', src: 'any' },
};

function getHandleType(
  nodeKind: string,
  handleId: string | null | undefined,
  handleType: 'source' | 'target'
): PortType {
  const handleKey = handleId ?? (handleType === 'source' ? 'src' : 'tgt');
  const map = HANDLE_TYPES[nodeKind];
  if (!map) return 'any';
  if (nodeKind === 'text' && handleType === 'target') return 'text';
  return map[handleKey] ?? 'any';
}

function isCompatible(sourceType: PortType, targetType: PortType): boolean {
  if (sourceType === 'any' || targetType === 'any') return true;
  return sourceType === targetType;
}

export function isValidConnectionType(
  connection: Connection,
  nodes: Node<PipelineNodeData>[]
): boolean {
  const { source, target, sourceHandle, targetHandle } = connection;
  if (!source || !target || source === target) return false;

  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  if (!sourceNode || !targetNode) return false;

  const sourceKind = sourceNode.data?.kind ?? '';
  const targetKind = targetNode.data?.kind ?? '';

  const outType = getHandleType(sourceKind, sourceHandle ?? undefined, 'source');
  const inType = getHandleType(targetKind, targetHandle ?? undefined, 'target');

  return isCompatible(outType, inType);
}

export function wouldCreateCycle(
  connection: Connection,
  _nodes: Node<unknown>[],
  edges: { source: string; target: string }[]
): boolean {
  const { source, target } = connection;
  if (!source || !target) return false;
  if (source === target) return true;

  const newEdges = [...edges, { source, target }];
  const adjacency = new Map<string, string[]>();
  for (const e of newEdges) {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    adjacency.get(e.source)!.push(e.target);
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function hasPathTo(from: string, to: string): boolean {
    if (from === to) return true;
    if (stack.has(from)) return false;
    if (visited.has(from)) return false;
    visited.add(from);
    stack.add(from);
    const neighbors = adjacency.get(from) ?? [];
    for (const n of neighbors) {
      if (hasPathTo(n, to)) {
        stack.delete(from);
        return true;
      }
    }
    stack.delete(from);
    return false;
  }

  return hasPathTo(target, source);
}

export function getEdgeLabel(
  connection: Connection,
  nodes: Node<PipelineNodeData>[]
): string {
  const { sourceHandle, targetHandle } = connection;
  const sourceNode = nodes.find((n) => n.id === connection.source);
  const kind = sourceNode?.data?.kind;

  if (kind === 'text' && targetHandle) return targetHandle;
  if (kind === 'branch' && sourceHandle) return sourceHandle;
  const sourceLabel = sourceHandle && sourceHandle !== 'src' ? sourceHandle : 'output';
  const targetLabel = targetHandle && targetHandle !== 'tgt' ? targetHandle : 'input';
  return `${sourceLabel} → ${targetLabel}`;
}

export function isValidTargetForConnectionSource(
  connectionSource: { nodeId: string; handleId: string | null; handleType: 'source' | 'target' } | null,
  targetNodeId: string,
  targetHandleId: string,
  nodes: Node<PipelineNodeData>[]
): boolean {
  if (!connectionSource || connectionSource.handleType !== 'source') return false;
  return isValidConnectionType(
    {
      source: connectionSource.nodeId,
      sourceHandle: connectionSource.handleId ?? null,
      target: targetNodeId,
      targetHandle: targetHandleId,
    },
    nodes
  );
}
