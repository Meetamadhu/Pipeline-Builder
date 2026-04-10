import { Node } from 'reactflow';
import { PipelineNodeData } from '../store/pipelineStore';

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Get the bounding box of a node
 * Uses actual DOM measurements for accuracy
 */
export const getNodeBounds = (node: Node<PipelineNodeData>): NodeBounds => {
  // Try to get the actual rendered element dimensions
  const element = document.querySelector(`[data-id="${node.id}"]`);
  
  let width = 200;
  let height = 110;
  
  if (element) {
    const rect = element.getBoundingClientRect();
    // Get the actual rendered size
    width = rect.width;
    height = rect.height;
  }
  
  return {
    x: node.position.x,
    y: node.position.y,
    width,
    height,
  };
};

/**
 * Check if two rectangular bounds intersect
 * Uses Axis-Aligned Bounding Box (AABB) collision detection
 */
export const boundsIntersect = (bounds1: NodeBounds, bounds2: NodeBounds): boolean => {
  return !(
    bounds1.x + bounds1.width < bounds2.x ||
    bounds2.x + bounds2.width < bounds1.x ||
    bounds1.y + bounds1.height < bounds2.y ||
    bounds2.y + bounds2.height < bounds1.y
  );
};

/**
 * Check if a node intersects with any other node in the list
 * Excludes the node itself from the check
 */
export const checkNodeIntersection = (
  nodeId: string,
  node: Node<PipelineNodeData>,
  allNodes: Node<PipelineNodeData>[],
): string | null => {
  const nodeBounds = getNodeBounds(node);

  for (const otherNode of allNodes) {
    if (otherNode.id === nodeId) continue; // Skip self

    const otherBounds = getNodeBounds(otherNode);
    
    if (boundsIntersect(nodeBounds, otherBounds)) {
      return otherNode.id;
    }
  }

  return null;
};

/**
 * Check all nodes that intersect with a given node
 * Returns an array of intersecting node IDs
 */
export const getIntersectingNodes = (
  nodeId: string,
  node: Node<PipelineNodeData>,
  allNodes: Node<PipelineNodeData>[],
): string[] => {
  const nodeBounds = getNodeBounds(node);
  const intersecting: string[] = [];

  for (const otherNode of allNodes) {
    if (otherNode.id === nodeId) continue; // Skip self

    const otherBounds = getNodeBounds(otherNode);
    
    if (boundsIntersect(nodeBounds, otherBounds)) {
      intersecting.push(otherNode.id);
    }
  }

  return intersecting;
};

/**
 * Check if a point is within a node's bounds
 */
export const pointInBounds = (x: number, y: number, bounds: NodeBounds): boolean => {
  return x >= bounds.x && x <= bounds.x + bounds.width &&
         y >= bounds.y && y <= bounds.y + bounds.height;
};

/**
 * Get the closest node to a given position (within an optional search radius)
 */
export const getClosestNode = (
  x: number,
  y: number,
  nodes: Node<PipelineNodeData>[],
  maxDistance?: number,
): { node: Node<PipelineNodeData>; distance: number } | null => {
  let closest: { node: Node<PipelineNodeData>; distance: number } | null = null;

  for (const node of nodes) {
    const bounds = getNodeBounds(node);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    
    const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

    if (maxDistance && distance > maxDistance) continue;

    if (!closest || distance < closest.distance) {
      closest = { node, distance };
    }
  }

  return closest;
};

/**
 * Calculate overlap area between two bounds
 * Returns 0 if no intersection
 */
export const getOverlapArea = (bounds1: NodeBounds, bounds2: NodeBounds): number => {
  const x1 = Math.max(bounds1.x, bounds2.x);
  const y1 = Math.max(bounds1.y, bounds2.y);
  const x2 = Math.min(bounds1.x + bounds1.width, bounds2.x + bounds2.width);
  const y2 = Math.min(bounds1.y + bounds1.height, bounds2.y + bounds2.height);

  if (x2 <= x1 || y2 <= y1) return 0;
  
  return (x2 - x1) * (y2 - y1);
};
