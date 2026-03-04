# Pipeline Builder

A visual node-based pipeline builder for creating, managing, and validating data processing workflows. Build complex data pipelines by dragging and connecting nodes on an interactive canvas.

## Features

- **Visual Pipeline Design** - Drag-and-drop node editor for intuitive pipeline creation
- **Node Types** - Input, Output, Transform, LLM, HTTP, Text, Branch, and Database nodes
- **Real-time Validation** - Validate pipelines as DAGs (Directed Acyclic Graphs) with cycle detection
- **Node Editing** - Click nodes to edit their properties and configuration
- **Edge Management** - Connect nodes with handles to create data flow pipelines
- **Stats Tracking** - Monitor node and edge counts in real-time
- **Responsive UI** - Modern dark theme with violet accents

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python 3.8+ (for backend)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will open at `http://localhost:5173`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

The backend API will be available at `http://localhost:8001`

## How to Use

1. **Add Nodes** - Drag a node type from the sidebar onto the canvas
2. **Connect Nodes** - Draw edges by connecting output handles (→) to input handles (←)
3. **Configure Nodes** - Click on a node to edit its properties
4. **Delete** - Press Delete or Backspace to remove selected nodes/edges
5. **Submit** - Click "Submit Pipeline" to validate your DAG and check for cycles

### Example Pipeline

```
Input ("hello world")
  ↓
Transform (output = input.toUpperCase())
  ↓
Transform (output = input.split(' ').reverse().join(' '))
  ↓
Output
```

## Project Structure

```
frontend/
  src/
    components/     - React components
    nodes/          - Node type implementations
    store/          - State management (Zustand)
    utils/          - Helper functions
    App.tsx         - Main app component
backend/
  main.py           - FastAPI server with DAG validation
```

## Technologies

- **Frontend** - React, TypeScript, React Flow, Tailwind CSS, Vite
- **Backend** - FastAPI, Python
- **Validation** - Depth-First Search (DFS) cycle detection

## API Endpoints

### `POST /pipelines/parse`

Validates a pipeline structure and checks if it's a valid DAG.

**Request:**
```json
{
  "nodes": [
    { "id": "1", "kind": "input", "pos": { "x": 0, "y": 0 }, "data": {} }
  ],
  "edges": [
    { "id": "e1", "source": "1", "target": "2", "sourceHandle": "default", "targetHandle": "default" }
  ]
}
```

**Response:**
```json
{
  "num_nodes": 1,
  "num_edges": 0,
  "is_dag": true
}
```

## License

MIT
