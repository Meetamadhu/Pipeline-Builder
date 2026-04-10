import React from 'react';
import { BaseNode } from './BaseNode';
import type { HttpNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface HttpNodeProps {
  id: string;
  data: HttpNodeData;
}

export const HttpNode: React.FC<HttpNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle showSourceHandle>
      <div className="node-field">
        <label className="node-label">URL</label>
        <input
          className="node-input"
          placeholder="https://api.example.com"
          value={data.url}
          onChange={(event) =>
            updateNodeData(id, { url: event.target.value } as Partial<HttpNodeData>)
          }
        />
      </div>

      <div className="node-field-inline">
        <label className="node-label">Method</label>
        <select
          className="node-select"
          value={data.method}
          onChange={(event) =>
            updateNodeData(id, { method: event.target.value as HttpNodeData['method'] })
          }
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>

      <div className="node-field">
        <label className="node-label">Headers</label>
        <textarea
          className="node-textarea"
          rows={2}
          placeholder='{"Authorization": "Bearer ..."}'
          value={data.headers}
          onChange={(event) =>
            updateNodeData(id, { headers: event.target.value } as Partial<HttpNodeData>)
          }
        />
      </div>
    </BaseNode>
  );
});

HttpNode.displayName = 'HttpNode';