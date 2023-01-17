export interface ViolationDTO {
  serialNumber: string;
  name: string;
  email: string;
  phoneNumber: string;
  distance: number;
}

export interface ViolationUpdateDTO {
  serialNumber: string;
  distance: number;
}

export const isTypeViolation = (violation: unknown): violation is ViolationDTO => {
  return (
    typeof violation === "object" &&
    violation !== null &&
    typeof (violation as { serialNumber: unknown }).serialNumber === "string" &&
    typeof (violation as { name: unknown }).name === "string" &&
    typeof (violation as { email: unknown }).email === "string" &&
    typeof (violation as { phoneNumber: unknown }).phoneNumber === "string" &&
    typeof (violation as { distance: unknown }).distance === "number"
  );
}

export const isTypeViolationUpdate = (
  violation: unknown
): violation is ViolationUpdateDTO => {
  return (
    typeof violation === "object" &&
    violation !== null &&
    typeof (violation as { serialNumber: unknown }).serialNumber === "string" &&
    typeof (violation as { distance: unknown }).distance === "number"
  );
}