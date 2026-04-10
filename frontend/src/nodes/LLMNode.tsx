import React from 'react';
import { BaseNode } from './BaseNode';
import type { LLMNodeData } from '../store/pipelineStore';
import { usePipelineStore } from '../store/pipelineStore';

interface LLMNodeProps {
  id: string;
  data: LLMNodeData;
}

const MODELS = ['gpt-3.5', 'gpt-4', 'gpt-4-turbo'];

export const LLMNode: React.FC<LLMNodeProps> = React.memo(({ id, data }) => {
  const updateNodeData = usePipelineStore((state) => state.updateNodeData);

  return (
    <BaseNode id={id} data={data} showTargetHandle showSourceHandle>
      <div className="node-field">
        <label className="node-label">Model</label>
          <select
            className="node-select"
            value={data.model}
            onChange={(event) => updateNodeData(id, { model: event.target.value } as Partial<LLMNodeData>)}
          >
            {MODELS.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
      </div>

      <div className="node-field">
        <label className="node-label">Temperature ({data.temperature.toFixed(2)})</label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={data.temperature}
            className="node-range"
            onChange={(event) =>
              updateNodeData(id, { temperature: Number(event.target.value) } as Partial<LLMNodeData>)
            }
          />
      </div>

      <div className="node-field">
        <label className="node-label">Prompt</label>
          <textarea
            className="node-textarea"
            rows={3}
            placeholder="Enter prompt..."
            value={data.prompt}
            onChange={(event) => updateNodeData(id, { prompt: event.target.value } as Partial<LLMNodeData>)}
          />
      </div>
    </BaseNode>
  );
});

LLMNode.displayName = 'LLMNode';