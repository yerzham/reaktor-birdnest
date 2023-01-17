import { redisEvents } from "./db.ts";
import { isTypeViolationUpdate, isTypeViolation } from "./dto/violation.dto.ts";

const sub = await redisEvents.subscribe("violation:new", "violation:updated", "__keyevent@0__:expired");

const sockets = new Set<WebSocket>();

(async function () {
  console.log("Listening for violation expiry keyspace events...");
  for await (const { channel, message } of sub.receive()) {
    console.log(`Received message: ${message} on channel: ${channel}`);
    switch (channel) {
      case "__keyevent@0__:expired": {
        for (const socket of sockets) {
          const serialNumber = message.split(":")[1];
          socket.send(JSON.stringify({ type: "violation:expired", payload: serialNumber }));
        }
        break;
      }
      case "violation:new": {
        const parsedMessage = JSON.parse(message);
        if (!isTypeViolation(parsedMessage)) {
          console.error("Invalid violation found in Redis");
          continue;
        }
        for (const socket of sockets) {
          socket.send(JSON.stringify({ type: "violation:new", payload: parsedMessage }));
        }
        break;
      }
      case "violation:updated": {
        const parsedMessage = JSON.parse(message);
        if (!isTypeViolationUpdate(parsedMessage)) {
          console.error("Invalid update violation found in Redis");
          continue;
        }
        for (const socket of sockets) {
          socket.send(JSON.stringify({ type: "violation:updated", payload: parsedMessage }));
        }
        break;
      }
    }
  }
})();

export const websocketConnection = (req: Request) => {
  const { socket: ws, response } = Deno.upgradeWebSocket(req);
  ws.onclose = () => {
    sockets.delete(ws);
  };

  sockets.add(ws);
  
  return response;
};
