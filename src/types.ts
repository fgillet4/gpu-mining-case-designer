export interface GPUSlot {
  name: string;
  length: number;
  height: number;
  width: number;
  tdp?: number;
}

export interface GPUCase {
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  material: {
    thickness: number;
  };
  gpuSlots: GPUSlot[];
  thermalManagement: {
    hasDuct: boolean;
    hasTempSensors: boolean;
  };
}
