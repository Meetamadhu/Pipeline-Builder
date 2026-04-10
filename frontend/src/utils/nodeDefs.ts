import { create } from 'zustand';

// ─── Base definitions (read-only source of truth) ────────────────────────────

export interface NodeDefEntry {
  label: string;
  color: string;
  accent: string;
  icon: string;
}

export const NODE_DEFS_BASE = {
  input:     { label: 'Input',     color: '#7c3aed', accent: '#a78bfa', icon: '▶' },
  text:      { label: 'Text',      color: '#ca8a04', accent: '#facc15', icon: 'T' },
  llm:       { label: 'LLM',       color: '#1d4ed8', accent: '#60a5fa', icon: '✦' },
  output:    { label: 'Output',    color: '#c2410c', accent: '#fb923c', icon: '◀' },
  http:      { label: 'HTTP',      color: '#0e7490', accent: '#22d3ee', icon: '↑' },
  transform: { label: 'Transform', color: '#16a34a', accent: '#4ade80', icon: '⇌' },
  branch:    { label: 'Branch',    color: '#881337', accent: '#fb7185', icon: '⑂' },
  database:  { label: 'Database',  color: '#1e3a5f', accent: '#38bdf8', icon: '⊞' },
  logger:    { label: 'Logger',    color: '#854d0e', accent: '#eab308', icon: '▣' },
} as const satisfies Record<string, NodeDefEntry>;

export type NodeKind = keyof typeof NODE_DEFS_BASE;

// ─── Sidebar grouping ─────────────────────────────────────────────────────────

export const NODE_GROUPS: { title: string; kinds: NodeKind[] }[] = [
  { title: 'Inputs',  kinds: ['input'] },
  { title: 'Logic',   kinds: ['text', 'transform', 'branch', 'logger'] },
  { title: 'Data',    kinds: ['http', 'database'] },
  { title: 'AI',      kinds: ['llm'] },
  { title: 'Output',  kinds: ['output'] },
];

// ─── Override store (Zustand) ─────────────────────────────────────────────────

type Overrides = Partial<Record<NodeKind, Partial<NodeDefEntry>>>;

interface NodeDefsStore {
  overrides: Overrides;
  setOverride: (kind: NodeKind, patch: Partial<NodeDefEntry>) => void;
  resetOverrides: () => void;
}

const useNodeDefsStore = create<NodeDefsStore>((set) => ({
  overrides: {},
  setOverride: (kind, patch) =>
    set((s) => ({
      overrides: {
        ...s.overrides,
        [kind]: { ...s.overrides[kind], ...patch },
      },
    })),
  resetOverrides: () => set({ overrides: {} }),
}));

// ─── Public hook ──────────────────────────────────────────────────────────────

export function useNodeDefs() {
  const { overrides, setOverride, resetOverrides } = useNodeDefsStore();

  // Merge base defs with any per-kind overrides reactively
  const defs = Object.fromEntries(
    (Object.keys(NODE_DEFS_BASE) as NodeKind[]).map((k) => [
      k,
      { ...NODE_DEFS_BASE[k], ...overrides[k] },
    ]),
  ) as Record<NodeKind, NodeDefEntry>;

  return {
    defs,
    getNodeDef: (k: NodeKind) => defs[k],
    setOverride,
    resetOverrides,
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function uid(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function extractVars(text: string): string[] {
  const matches = text.match(/\{\{(\w+)\}\}/g) ?? [];
  return matches.map((m) => m.slice(2, -2));
}