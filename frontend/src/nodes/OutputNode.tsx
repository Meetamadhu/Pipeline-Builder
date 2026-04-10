import React from 'react';
import { BaseNode } from './BaseNode';
import type { OutputNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface OutputNodeProps {
  id: string;
  data: OutputNodeData;
}

export const OutputNode: React.FC<OutputNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle>
      <div className="node-field">
        <label className="node-label">Output type</label>
        <select
          className="node-select"
          value={data.outputType}
          onChange={(event) =>
            updateNodeData(id, { outputType: event.target.value as OutputNodeData['outputType'] })
          }
        >
          <option value="text">Text</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </BaseNode>
  );
});

OutputNode.displayName = 'OutputNode';