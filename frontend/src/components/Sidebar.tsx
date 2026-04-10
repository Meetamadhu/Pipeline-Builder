import React, { useMemo, useState } from 'react';
import { useNodeDefs } from '../utils/nodeDefs';
import { NODE_GROUPS } from '../utils/nodeDefs';

export const Sidebar: React.FC = () => {
  const { defs: NODE_DEFS } = useNodeDefs();
  const [search, setSearch] = useState('');

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NODE_GROUPS;
    return NODE_GROUPS.map((group) => ({
      ...group,
      kinds: group.kinds.filter(
        (kind) =>
          kind.toLowerCase().includes(q) ||
          NODE_DEFS[kind].label.toLowerCase().includes(q)
      ),
    })).filter((g) => g.kinds.length > 0);
  }, [search, NODE_DEFS]);

  return (
    <aside
      className="sidebar-panel flex-shrink-0 overflow-hidden flex flex-col"
      style={{ width: 'var(--sidebar-width)' }}
      role="navigation"
      aria-label="Node library"
    >
      <div className="p-4 flex flex-col gap-3 flex-1 min-h-0">
        <h2 className="sidebar-title">Node Library</h2>

        <label className="sr-only" htmlFor="node-search">
          Search nodes
        </label>
        <input
          id="node-search"
          type="search"
          placeholder="Search nodes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sidebar-search"
          aria-label="Search nodes"
        />

        <div className="flex flex-col gap-4 overflow-y-auto flex-1 pr-1">
          {filteredGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-2">
              <h3 className="sidebar-group-title">{group.title}</h3>
              <div className="flex flex-col gap-2">
                {group.kinds.map((kind) => {
                  const def = NODE_DEFS[kind];
                  return (
                    <div
                      key={kind}
                      role="button"
                      tabIndex={0}
                      draggable
                      className="sidebar-node-item"
                      style={{
                        ['--node-color' as string]: def.color,
                        ['--node-accent' as string]: def.accent,
                      }}
                      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                        e.dataTransfer.setData('application/reactflow', kind);
                        e.dataTransfer.effectAllowed = 'move';
                      }}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          (e.currentTarget as HTMLElement).focus();
                        }
                      }}
                      aria-label={`Add ${def.label} node`}
                    >
                      <span className="sidebar-node-icon" aria-hidden>
                        {def.icon}
                      </span>
                      <span>{def.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};