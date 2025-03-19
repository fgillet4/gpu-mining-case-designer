# GPU Mining Case Designer

A web-based tool for designing custom GPU rig with laser-cutting export capabilities.

## Overview

This application enables users to:
- Design custom cases for cryptocurrency mining rigs
- Design custom case for renderfarms/Local LLM setups
- Configure case dimensions and material properties
- Add and arrange multiple GPUs (up to 12)
- Visualize the design in real-time 3D
- Export designs as SVG or DXF files optimized for laser cutting

## Features

- **Case Designer**: Configure physical dimensions and material thickness
- **GPU Configurator**: Select GPU models with accurate dimensions (RTX 3060-4090, AMD options)
- **3D Visualization**: Real-time preview of your case design
- **Export Options**: Generate files for laser cutting with proper finger joints and cutouts
- **Thermal Management**: Configure airflow, temperature sensors, and cooling solutions

## Technical Implementation

Built with modern web technologies:
- React 18 with TypeScript
- Three.js with React Three Fiber for 3D visualization
- SVG/DXF export utilities for laser cutting
- Vite for fast development and building

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gpu-mining-case-designer.git
cd gpu-mining-case-designer
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

## Usage Workflow

1. Set case dimensions and material thickness
2. Configure GPU count and models
3. Adjust thermal management settings
4. Preview the 3D model
5. Configure export settings (joint type, kerf/tolerance)
6. Export your design for laser cutting

## License

MIT

## Contributing

Feel free to help