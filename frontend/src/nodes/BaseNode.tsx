import React, { useRef, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';
import type { PipelineNodeData } from '../store/pipelineStore';
import { useNodeDefs } from '../utils/nodeDefs';
import { usePipelineStore } from '../store/pipelineStore';
import { isValidTargetForConnectionSource } from '../utils/connectionValidation';

export interface BaseNodeProps {
  id: string;
  data: PipelineNodeData;
  children?: React.ReactNode;
  showSourceHandle?: boolean;
  showTargetHandle?: boolean;
  rotation?: number;
  onRotationChange?: (rotation: number) => void;
  showRotateControl?: boolean;
}

export const BaseNode: React.FC<BaseNodeProps> = React.memo(
  ({ id, data, children, showSourceHandle = false, showTargetHandle = false, rotation = 0, onRotationChange, showRotateControl = false }) => {
    const { defs } = useNodeDefs();
    const deleteNode = usePipelineStore((state) => state.deleteNode);
    const intersectingNodeIds = usePipelineStore((state) => state.intersectingNodeIds);
    const connectionSource = usePipelineStore((state) => state.connectionSource);
    const nodes = usePipelineStore((state) => state.nodes);
    const rotateControlRef = useRef<HTMLDivElement>(null);
    const nodeRef = useRef<HTMLDivElement>(null);

    const targetHighlight =
      showTargetHandle &&
      connectionSource &&
      isValidTargetForConnectionSource(connectionSource, id, 'tgt', nodes);

    const dragState = useRef({
      startAngle: 0,
    });

    // Setup rotation drag handler
    useEffect(() => {
      if (!showRotateControl || !rotateControlRef.current || !nodeRef.current) return;

      const dragBehavior = drag<HTMLDivElement, unknown>()
        .on('start', function (event: any) {
          if (!nodeRef.current) return;
          
          // Get node center
          const rect = nodeRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate initial angle from center to mouse
          const dx = event.sourceEvent.clientX - centerX;
          const dy = event.sourceEvent.clientY - centerY;
          dragState.current.startAngle = Math.atan2(dy, dx) * (180 / Math.PI);
        })
        .on('drag', function (event: any) {
          if (!nodeRef.current || !onRotationChange) return;

          // Get node center
          const rect = nodeRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate current angle from center to mouse
          const dx = event.sourceEvent.clientX - centerX;
          const dy = event.sourceEvent.clientY - centerY;
          const currentAngle = Math.atan2(dy, dx) * (180 / Math.PI);

          // Calculate rotation change
          const angleDelta = currentAngle - dragState.current.startAngle;

          // Normalize angle to 0-360
          let newRotation = (rotation + angleDelta) % 360;
          if (newRotation < 0) newRotation += 360;

          onRotationChange(newRotation);
        });

      select(rotateControlRef.current).call(dragBehavior);

      return () => {
        select(rotateControlRef.current).on('.drag', null);
      };
    }, [showRotateControl, rotation, onRotationChange]);

    const isIntersecting =
      (intersectingNodeIds[id]?.length ?? 0) > 0 ||
      Object.entries(intersectingNodeIds).some(([otherId, ids]) => otherId !== id && ids.includes(id));

    const def = defs[data.kind];

    return (
      <div
        ref={nodeRef}
        data-id={id}
        className="node-card min-w-[168px] transition-all duration-150"
        style={{
          ['--node-color' as string]: def.color,
          ['--node-accent' as string]: def.accent,
          borderColor: isIntersecting ? 'var(--color-error)' : 'var(--node-color)',
          boxShadow: isIntersecting
            ? 'var(--node-overlap-shadow)'
            : 'var(--node-shadow)',
          position: 'relative',
          transform: showRotateControl ? `rotate(${rotation}deg)` : undefined,
          transformOrigin: 'center',
          transition: showRotateControl ? 'none' : undefined,
        }}
      >
        {isIntersecting && (
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 text-[6px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--color-error) 20%, transparent)',
              border: '1px solid color-mix(in srgb, var(--color-error) 45%, transparent)',
              color: 'var(--color-error)',
              whiteSpace: 'nowrap',
            }}
          >
            overlapping
          </div>
        )}

        <div className="node-card-header">
          <span className="node-card-title">
            <span>{def.icon}</span>
            {data.label}
          </span>

          <div className="flex items-center gap-1.5">
            {showRotateControl && (
              <div
                ref={rotateControlRef}
                className="w-4 h-4 rounded-full cursor-grab active:cursor-grabbing transition-all hover:scale-110 flex items-center justify-center"
                style={{
                  touchAction: 'none',
                  userSelect: 'none',
                  fontSize: '5px',
                  background: 'var(--color-primary)',
                }}
                title={`Rotate (${Math.round(rotation)}°)`}
              >
                <span className="text-white font-bold text-[5px]">↻</span>
              </div>
            )}

            <span
              className="node-card-kind"
              style={{ borderColor: def.accent, color: 'var(--color-text-muted)' }}
            >
              {data.kind}
            </span>

            <button
              type="button"
              onClick={() => deleteNode(id)}
              title="Remove node"
              aria-label="Remove node"
              className="nodrag flex items-center justify-center w-5 h-5 rounded-full text-[9px] leading-none transition-all hover:scale-110 node-delete-btn"
            >
              ×
            </button>
          </div>
        </div>

        <div className="node-card-body nodrag">{children}</div>

        {showSourceHandle && (
          <div className="handle-wrapper handle-wrapper-right">
            <Handle type="source" position={Position.Right} id="src" className="node-handle node-handle-source" />
          </div>
        )}
        {showTargetHandle && (
          <div className={targetHighlight ? 'handle-wrapper handle-valid-target' : 'handle-wrapper'}>
            <Handle type="target" position={Position.Left} id="tgt" className="node-handle node-handle-target" />
          </div>
        )}
      </div>
    );
  },
);

BaseNode.displayName = 'BaseNode';