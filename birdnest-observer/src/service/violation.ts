import { redis } from "../db.ts";
import { ViolationDTO,  ViolationUpdateDTO } from "../dto/violation.dto.ts";

export const persistViolation = async (serialNumber: string) => {
  console.log(`Persisting violation for drone ${serialNumber}`);

  await redis.expire(`violation:${serialNumber}`, 600);
};

export const addViolation = async (violation: ViolationDTO) => {
  await redis.eval(
    `
    local serialNumber = ARGV[1]
    local name = ARGV[2]
    local email = ARGV[3]
    local phoneNumber = ARGV[4]
    local distance = ARGV[5]

    redis.call('HMSET', KEYS[1], 'serialNumber', serialNumber, 'name', name, 'email', email, 'phoneNumber', phoneNumber, 'distance', distance)
    redis.call('EXPIRE', KEYS[1], 600)

    redis.call('PUBLISH', 'violation:new', cjson.encode({
      serialNumber = serialNumber,
      name = name,
      email = email,
      phoneNumber = phoneNumber,
      distance = tonumber(distance)
    }))
    `,
    [`violation:${violation.serialNumber}`],
    [
      violation.serialNumber,
      violation.name,
      violation.email,
      violation.phoneNumber,
      violation.distance,
    ]
  );
};

export const updateViolation = async (data: ViolationUpdateDTO) => {
  await redis.eval(
    `
    local serialNumber = ARGV[1]
    local distance = ARGV[2]

    local previousDistance = redis.call('HGET', KEYS[1], 'distance')
    if tonumber(previousDistance) > tonumber(distance) then
      redis.call('HSET', KEYS[1], 'distance', distance)

      redis.call('PUBLISH', 'violation:updated', cjson.encode({
        serialNumber = serialNumber,
        distance = tonumber(distance)
      }))
    end
    redis.call('EXPIRE', KEYS[1], 600)
    `,
    [`violation:${data.serialNumber}`],
    [data.serialNumber, data.distance]
  );
};

export const didDroneViolate = async (
  serialNumber: string
): Promise<boolean> => {
  return !!(await redis.exists(`violation:${serialNumber}`));
};
