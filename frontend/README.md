# Pipeline Builder Frontend

A React-based visual pipeline builder with TypeScript and Tailwind CSS.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Features

- Visual pipeline editor with drag-and-drop nodes
- Multiple node types (Input, Output, Transform, LLM, Database, HTTP, Branch, Text)
- Real-time pipeline updates
- Responsive UI with Tailwind CSS
- TypeScript support

## Project Structure

- `src/` - Source code
  - `components/` - Reusable React components
  - `nodes/` - Node type definitions
  - `store/` - State management
  - `utils/` - Utility functions
- `public/` - Static assets
