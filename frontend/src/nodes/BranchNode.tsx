import React from 'react';
import { Handle, Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import type { BranchNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface BranchNodeProps {
  id: string;
  data: BranchNodeData;
}

export const BranchNode: React.FC<BranchNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle>
      <div className="node-field">
        <label className="node-label">Condition</label>
        <input
          className="node-input"
          placeholder="score > 0.8"
          value={data.condition}
          onChange={(event) =>
            updateNodeData(id, { condition: event.target.value } as Partial<BranchNodeData>)
          }
        />
      </div>

      {/* true branch — wrapped consistently like all other source handles */}
      <div className="handle-wrapper handle-wrapper-right" style={{ top: '40%' }}>
        <Handle
          id="true"
          type="source"
          position={Position.Right}
          className="node-handle"
          style={{ background: '#16a34a', boxShadow: '0 0 0 1px rgba(22,163,74,0.45)' }}
        />
      </div>
      <span className="absolute right-3 top-[31%] text-[6px] font-semibold text-emerald-600 pointer-events-none">
        true
      </span>

      {/* false branch — wrapped consistently like all other source handles */}
      <div className="handle-wrapper handle-wrapper-right" style={{ top: '60%' }}>
        <Handle
          id="false"
          type="source"
          position={Position.Right}
          className="node-handle"
          style={{ background: '#dc2626', boxShadow: '0 0 0 1px rgba(220,38,38,0.4)' }}
        />
      </div>
      <span className="absolute right-3 top-[53%] text-[6px] font-semibold text-rose-600 pointer-events-none">
        false
      </span>
    </BaseNode>
  );
});

BranchNode.displayName = 'BranchNode';