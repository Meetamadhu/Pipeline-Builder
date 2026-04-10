import React from 'react';
import { BaseNode } from './BaseNode';
import type { TransformNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface TransformNodeProps {
  id: string;
  data: TransformNodeData;
}

export const TransformNode: React.FC<TransformNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle showSourceHandle>
      <div className="node-field">
        <label className="node-label">Transform expression</label>
        <textarea
          className="node-textarea node-mono"
          rows={3}
          placeholder="output = { name: input.name.toUpperCase() }"
          value={data.expression}
          onChange={(event) =>
            updateNodeData(id, { expression: event.target.value } as Partial<TransformNodeData>)
          }
        />
      </div>
    </BaseNode>
  );
});

TransformNode.displayName = 'TransformNode';