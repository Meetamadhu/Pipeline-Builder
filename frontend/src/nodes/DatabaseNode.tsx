import React from 'react';
import { BaseNode } from './BaseNode';
import type { DatabaseNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface DatabaseNodeProps {
  id: string;
  data: DatabaseNodeData;
}

export const DatabaseNode: React.FC<DatabaseNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle showSourceHandle>
      <div className="node-field">
        <label className="node-label">Connection ID</label>
        <input
          className="node-input"
          placeholder="default"
          value={data.connectionId}
          onChange={(event) =>
            updateNodeData(id, { connectionId: event.target.value } as Partial<DatabaseNodeData>)
          }
        />
      </div>

      <div className="node-field">
        <label className="node-label">Query</label>
        <textarea
          className="node-textarea node-mono"
          rows={3}
          placeholder="SELECT * FROM table WHERE id = {{id}}"
          value={data.query}
          onChange={(event) =>
            updateNodeData(id, { query: event.target.value } as Partial<DatabaseNodeData>)
          }
        />
      </div>
    </BaseNode>
  );
});

DatabaseNode.displayName = 'DatabaseNode';

