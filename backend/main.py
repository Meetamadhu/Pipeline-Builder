from typing import List, Dict, Any, Set

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


class Pipeline(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]


def is_dag(num_nodes: int, edges: List[Dict[str, Any]]) -> bool:
    """
    Validate that the graph described by the edges is a DAG using DFS.
    Edges are expected to contain at least 'source' and 'target' keys.
    """
    adjacency: Dict[str, List[str]] = {}
    nodes_set: Set[str] = set()

    for edge in edges:
        source = str(edge.get("source"))
        target = str(edge.get("target"))
        if source is None or target is None:
            continue

        nodes_set.add(source)
        nodes_set.add(target)

        adjacency.setdefault(source, []).append(target)
        adjacency.setdefault(target, [])

    visited: Set[str] = set()
    in_stack: Set[str] = set()

    def dfs(node_id: str) -> bool:
        if node_id in in_stack:
            # cycle detected
            return False
        if node_id in visited:
            return True

        visited.add(node_id)
        in_stack.add(node_id)

        for neighbor in adjacency.get(node_id, []):
            if not dfs(neighbor):
                return False

        in_stack.remove(node_id)
        return True

    for node_id in adjacency.keys():
        if node_id not in visited:
            if not dfs(node_id):
                return False

    return True


app = FastAPI(title="Pipeline Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/pipelines/parse")
def parse_pipeline(pipeline: Pipeline) -> Dict[str, Any]:
    num_nodes = len(pipeline.nodes)
    num_edges = len(pipeline.edges)
    dag = is_dag(num_nodes=num_nodes, edges=pipeline.edges)

    return {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "is_dag": dag,
    }


@app.get("/")
def healthcheck() -> Dict[str, str]:
    return {"status": "ok"}
