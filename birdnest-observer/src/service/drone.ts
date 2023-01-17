import { parse } from "../deps.ts";
import { DroneCaptureDTO, DroneOwnerDTO, isTypeDroneCapture, isTypeDroneOwner, parseDrones } from "../dto/drone.dto.ts";

export interface NoFlyZone {
  x: number;
  y: number;
  radius: number;
}

const getDroneCapture = async (): Promise<DroneCaptureDTO | null> => {
  try {
    const res = await fetch("https://assignments.reaktor.com/birdnest/drones");
    const data = await res.text();
    const xml = parse(data);
    if (!(xml.report && typeof xml.report === "object" && xml.report.capture)) {
      return null;
    }
    if (!isTypeDroneCapture(xml.report.capture)) {
      throw new Error("Drone capture is not valid");
    }

    return xml.report.capture;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const getDrones = async () => {
  const droneCapture = await getDroneCapture();
  if (!droneCapture) {
    return [];
  }

  return parseDrones(droneCapture);
};

export const getDroneOwner = async (
  serialNumber: string
): Promise<DroneOwnerDTO | null> => {
  try {
    const res = await fetch(
      `https://assignments.reaktor.com/birdnest/pilots/${serialNumber}`
    );
    if (res.status === 404) {
      return null;
    }

    const owner = await res.json();
    if (!isTypeDroneOwner(owner)) {
      throw new Error("Drone owner is not valid");
    }

    return owner;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getDistance = (x: number, y: number, noFlyZone: NoFlyZone): number => {
  return Math.sqrt(
    Math.pow(x - noFlyZone.x, 2) +
      Math.pow(y - noFlyZone.y, 2)
  );
};

export const isInNoFlyZone = (
  x: number,
  y: number,
  noFlyZone: NoFlyZone
): boolean => {
  const distance = getDistance(x, y, noFlyZone);
  return distance < noFlyZone.radius;
};
