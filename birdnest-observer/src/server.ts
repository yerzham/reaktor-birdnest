import {
  getDistance,
  getDroneOwner,
  getDrones,
  isInNoFlyZone,
} from "./service/drone.ts";
import {
  didDroneViolate,
  addViolation,
  updateViolation,
  persistViolation,
} from "./service/violation.ts";

console.log("Application running in the background...");

// Can be dynamically obtained and updated from an external source
const noFlyZone = {
  x: 250000,
  y: 250000,
  radius: 100000,
};

setInterval(async () => {
  const drones = await getDrones();
  await Promise.all(
    drones.map(async (drone) => {
      const violated = await didDroneViolate(drone.serialNumber);
      if (isInNoFlyZone(drone.positionX, drone.positionY, noFlyZone)) {
        const distance = getDistance(
          drone.positionX,
          drone.positionY,
          noFlyZone
        );

        // Get the owner of the drone only if it has not violated before when inside NDZ, i.e decrease the number of requests.
        // Based on the assumption that the owner of the drone does not change.
        if (violated) {
          const data = {
            serialNumber: drone.serialNumber,
            distance,
          };
          await updateViolation(data);
        } else {
          const owner = await getDroneOwner(drone.serialNumber);
          if (owner === null) {
            console.error(
              `Could not get owner for drone ${drone.serialNumber}`
            );
            return;
          }

          const data = {
            serialNumber: drone.serialNumber,
            name: owner.firstName + " " + owner.lastName,
            email: owner.email,
            phoneNumber: owner.phoneNumber,
            distance,
          };
          await addViolation(data);
        }
      } else if (violated) {
        // Persist the pilot information for 10 minutes since their drone was last seen by the equipment
        await persistViolation(drone.serialNumber);
      }
    })
  );
}, 2000);
