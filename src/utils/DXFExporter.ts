import { GPUCase } from '../types';

export class DXFExporter {
  export(model: GPUCase): string {
    // This is a simplified DXF export
    // A real implementation would require a more complete DXF library
    
    const { length, width, height } = model.dimensions;
    
    let dxf = `999
DXF created by GPU Case Designer
0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
`;

    // Add bottom panel
    dxf += this.addRectangle(0, height, length, width);
    
    // Add top panel
    dxf += this.addRectangle(0, height + width, length, width);
    
    // Add front panel
    dxf += this.addRectangle(0, 0, length, height);
    
    // Add back panel
    dxf += this.addRectangle(0, height + width * 2, length, height);
    
    // Add side panels
    dxf += this.addRectangle(length, height, width, height);
    dxf += this.addRectangle(length + width, height, width, height);
    
    // Add GPU cutouts and air ducts (simplified)
    if (model.gpuSlots.length > 0 && model.thermalManagement.hasDuct) {
      const slotSpacing = length / (model.gpuSlots.length + 1);
      
      model.gpuSlots.forEach((gpu, index) => {
        const gpuX = slotSpacing * (index + 1) - gpu.width / 2;
        const gpuY = height + width / 2 - gpu.length / 2;
        
        dxf += this.addRectangle(gpuX, gpuY, gpu.width, gpu.length);
      });
    }
    
    dxf += `0
ENDSEC
0
EOF`;
    
    return dxf;
  }
  
  private addRectangle(x: number, y: number, width: number, height: number): string {
    // Create a simple polyline rectangle in DXF format
    return `0
POLYLINE
8
0
66
1
0
VERTEX
8
0
10
${x}
20
${y}
0
VERTEX
8
0
10
${x + width}
20
${y}
0
VERTEX
8
0
10
${x + width}
20
${y + height}
0
VERTEX
8
0
10
${x}
20
${y + height}
0
VERTEX
8
0
10
${x}
20
${y}
0
SEQEND
`;
  }
}