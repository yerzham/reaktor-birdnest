import { redis } from "../db.ts";
import { isTypeViolation, ViolationDTO } from "../dto/violation.dto.ts";

export const getViolations = async () => {
  const keys = await redis.keys("violation:*");
  const violations: ViolationDTO[] = [];
  for (const key of keys) {
    const violationRaw = await redis.hmget(
      key,
      "serialNumber",
      "name",
      "email",
      "phoneNumber",
      "distance"
    );
    const violation = {
      serialNumber: violationRaw[0],
      name: violationRaw[1],
      email: violationRaw[2],
      phoneNumber: violationRaw[3],
      distance: violationRaw[4] ? parseFloat(violationRaw[4]) : 0,
    };
    if (isTypeViolation(violation)) {
      violations.push(violation);
    } else {
      console.log("Invalid violation found in Redis");
      await redis.del(key); // Maybe do not delete if important
    }
  }
  return violations;
};