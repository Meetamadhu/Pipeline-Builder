import React, { useState, useCallback } from 'react';
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from 'reactflow';
import type { PipelineNodeData } from '../store/pipelineStore';
import { useToast } from './ToastProvider';

const BACKEND_URL = 'http://localhost:8000/pipelines/parse';

export const SubmitButton: React.FC<{
  nodes: ReactFlowNode<PipelineNodeData>[];
  edges: ReactFlowEdge[];
}> = ({ nodes, edges }) => {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!nodes.length) {
      showToast('Add at least one node first.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const apiNodes = nodes.map(n => ({
        id: n.id,
        kind: n.data.kind,
        pos: n.position,
        data: n.data,
      }));
      const apiEdges = edges.map(e => ({
        id: e.id,
        source: e.source,
        sourceHandle: e.sourceHandle || 'default',
        target: e.target,
        targetHandle: e.targetHandle || 'default',
      }));

      const res = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes: apiNodes, edges: apiEdges }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const d = await res.json();
      showToast(
        `Pipeline: ${d.num_nodes} nodes · ${d.num_edges} edges · DAG: ${d.is_dag ? 'Yes ✓' : 'No (cycle detected) ✗'}`,
        d.is_dag ? 'success' : 'error',
      );
    } catch (err) {
      console.error('Submit error:', err);
      showToast('Backend unreachable. Run: uvicorn main:app --reload', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [nodes, edges, showToast]);

  return (
    <button
      type="button"
      onClick={handleSubmit}
      disabled={submitting}
      className="submit-btn"
      data-tooltip={submitting ? 'Submitting…' : 'Validate pipeline and check if it is a DAG'}
      aria-label={submitting ? 'Submitting pipeline' : 'Submit pipeline to validate and check DAG'}
    >
      {submitting ? 'Submitting…' : 'Submit Pipeline →'}
    </button>
  );
};