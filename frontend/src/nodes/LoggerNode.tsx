import React from 'react';
import { BaseNode } from './BaseNode';
import type { LoggerNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface LoggerNodeProps {
  id: string;
  data: LoggerNodeData;
}

export const LoggerNode: React.FC<LoggerNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle showSourceHandle>
      <div className="node-field">
        <label className="node-label">Log message</label>
        <input
          className="node-input"
          placeholder="Log entry..."
          value={data.message}
          onChange={(event) =>
            updateNodeData(id, { message: event.target.value } as Partial<LoggerNodeData>)
          }
        />
      </div>
    </BaseNode>
  );
});

LoggerNode.displayName = 'LoggerNode';
