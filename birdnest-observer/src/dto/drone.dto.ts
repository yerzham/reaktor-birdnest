interface Drone {
  serialNumber: string;
  positionX: number;
  positionY: number;
}

export interface DroneCaptureDTO {
  drone: unknown[];
  "@snapshotTimestamp": string;
}

export interface DroneOwnerDTO {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}


export function isTypeDrone (drone: unknown): drone is Drone {
  return (
    typeof drone === "object" &&
    drone !== null &&
    typeof (drone as { serialNumber: unknown }).serialNumber === "string" &&
    typeof (drone as { positionX: unknown }).positionX === "number" &&
    typeof (drone as { positionY: unknown }).positionY === "number"
  );
}

export function isTypeDroneCapture (capture: unknown): capture is DroneCaptureDTO {
  return (
    typeof capture === "object" &&
    capture !== null &&
    Array.isArray((capture as { drone: unknown[] }).drone) &&
    
    typeof (capture as { "@snapshotTimestamp": unknown })[
      "@snapshotTimestamp"
    ] === "string"
  );
}

export function isTypeDroneOwner (droneOwner: unknown): droneOwner is DroneOwnerDTO {
  return (
    typeof droneOwner === "object" &&
    droneOwner !== null &&
    typeof (droneOwner as { firstName: unknown }).firstName === "string" &&
    typeof (droneOwner as { lastName: unknown }).lastName === "string" &&
    typeof (droneOwner as { email: unknown }).email === "string" &&
    typeof (droneOwner as { phoneNumber: unknown }).phoneNumber === "string"
  );
}

export function parseDrones (capture: DroneCaptureDTO): Drone[] {
  return capture.drone.filter((drone) => isTypeDrone(drone)).map((drone) => drone as Drone);
}