import React, { useEffect, useMemo, useRef } from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { TextNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';
import { isValidTargetForConnectionSource } from '../utils/connectionValidation';

const HANDLE_COLORS = [
  '#e879f9', '#60a5fa', '#4ade80', '#fbbf24',
  '#fb7185', '#34d399', '#a78bfa', '#38bdf8',
];

/** Once the node reaches this width, it only grows vertically (text wraps). */
const MAX_NODE_WIDTH = 400;
const MIN_NODE_WIDTH = 168;

function extractVars(text = ''): string[] {
  const re = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
  const seen = new Set<string>();
  const vars: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (!seen.has(m[1])) { seen.add(m[1]); vars.push(m[1]); }
  }
  return vars;
}

interface TextNodeProps {
  id: string;
  data: TextNodeData;
}

export const TextNode: React.FC<TextNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((s) => s.updateNodeData);
  const connectionSource = usePipelineStore((s) => s.connectionSource);
  const nodes = usePipelineStore((s) => s.nodes);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const text = data.text ?? '';

  const variables = useMemo(() => extractVars(text), [text]);

  // Grow horizontally up to MAX_NODE_WIDTH, then grow vertically only (text wraps)
  const nodeWidth = useMemo(() => {
    const longest = Math.max(...text.split('\n').map(l => l.length), 15);
    return Math.min(Math.max(MIN_NODE_WIDTH, longest * 7.5 + 60), MAX_NODE_WIDTH);
  }, [text]);

  // auto-grow height
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = taRef.current.scrollHeight + 'px';
  }, [text]);

  return (
    // Outer div owns the dynamic width; all handles are children of BaseNode
    // so they share the same positioning root as every other node type.
    <div style={{ width: nodeWidth, position: 'relative' }}>
      <BaseNode id={id} data={data}>
        <div className="node-field">
          <label className="node-label">Text (use {'{{variable}}'} for inputs)</label>
          <textarea
            ref={taRef}
            rows={1}
            value={text}
            placeholder="Hello {{name}}…"
            className="node-textarea node-mono overflow-hidden"
            style={{ lineHeight: 1.6, width: '100%', boxSizing: 'border-box' }}
            wrap="soft"
            onChange={(e) => updateNodeData(id, { text: e.target.value } as Partial<TextNodeData>)}
          />
        </div>

        {/* Variable list */}
        {variables.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="node-chip-label">Variables</span>
            {variables.map((v, i) => (
              <div key={v} className="node-chip-row">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: HANDLE_COLORS[i % HANDLE_COLORS.length],
                    boxShadow: `0 0 6px ${HANDLE_COLORS[i % HANDLE_COLORS.length]}`,
                  }}
                />
                <span
                  className="text-[7px] node-mono"
                  style={{ color: HANDLE_COLORS[i % HANDLE_COLORS.length] }}
                >
                  {v}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Source handle — wrapped consistently like all other source handles */}
        <div className="handle-wrapper handle-wrapper-right">
          <Handle
            type="source"
            position={Position.Right}
            id="src"
            className="node-handle node-handle-source"
          />
        </div>

        {/* Per-variable target handles — wrapped consistently like all other target handles */}
        {variables.map((v, i) => {
          const top = variables.length === 1
            ? '50%'
            : `${20 + (i / Math.max(variables.length - 1, 1)) * 60}%`;
          const isHighlight =
            connectionSource &&
            isValidTargetForConnectionSource(connectionSource, id, v, nodes);
          return (
            <div
              key={v}
              className={`handle-wrapper text-node-handle ${isHighlight ? 'handle-valid-target' : ''}`}
              style={{ top, transform: 'translateY(-50%)' }}
            >
              <Handle
                type="target"
                position={Position.Left}
                id={v}
                className="node-handle"
                style={{
                  top: '50%',
                  background: HANDLE_COLORS[i % HANDLE_COLORS.length],
                  borderColor: '#ffffff',
                  boxShadow: `0 0 8px ${HANDLE_COLORS[i % HANDLE_COLORS.length]}`,
                }}
              />
            </div>
          );
        })}
      </BaseNode>
    </div>
  );
});

TextNode.displayName = 'TextNode';