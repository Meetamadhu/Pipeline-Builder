import React from 'react';
import { BaseNode } from './BaseNode';
import type { InputNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface InputNodeProps {
  id: string;
  data: InputNodeData;
}

export const InputNode: React.FC<InputNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showSourceHandle>
      <div className="node-field">
        <label className="node-label">Value</label>
        <input
          className="node-input"
          placeholder="Enter input value"
          value={data.value}
          onChange={(event) => updateNodeData(id, { value: event.target.value } as Partial<InputNodeData>)}
        />
      </div>
    </BaseNode>
  );
});

InputNode.displayName = 'InputNode';