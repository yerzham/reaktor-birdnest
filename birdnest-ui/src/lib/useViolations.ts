import { isTypeViolation, isTypeViolationUpdate, ViolationDTO, ViolationUpdateDTO } from "@/dto/violation.dto"
import { useCallback, useEffect, useRef, useState } from "react"

export const useViolations = (initialViolations: ViolationDTO[], webSocketUrl: string) => {
  const [violations, setViolations] = useState(initialViolations.sort((a, b) => a.distance - b.distance))
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null)
  const [webSocketError, setWebSocketError] = useState<Error | null>(null)
  const [webSocketConnected, setWebSocketConnected] = useState(false)
  const wsConnected = useRef(false)

  const sortedIndex = useCallback(<T>(array: Array<T>, value: T, comparator?: (a: T, b: T) => number) => {
    var low = 0,
        high = array.length;
  
    while (low < high) {
        var mid = (low + high) >>> 1;
        if (comparator ? comparator(array[mid], value) < 0 : array[mid] < value) low = mid + 1;
        else high = mid;
    }
    return low;
  }, [])
  
  const sortedInsert = useCallback(<T>(array: Array<T>, value: T, comparator?: (a: T, b: T) => number) => {
    const index = sortedIndex(array, value, comparator);
    array.splice(index, 0, value);
  }, [sortedIndex]);

  const insertViolation = useCallback((violation: ViolationDTO) => {
    const newViolations = [...violations]
    sortedInsert(newViolations, violation, (a, b) => a.distance - b.distance)
    setViolations(newViolations)
  }, [sortedInsert, violations])

  const updateViolation = useCallback((violation: ViolationUpdateDTO) => {
    const newViolations = [...violations]
    const index = violations.findIndex((v) => v.serialNumber === violation.serialNumber)
    if (index !== -1) {
      newViolations.splice(index, 1)
      sortedInsert(newViolations, { ...violations[index], ...violation }, (a, b) => a.distance - b.distance)
      setViolations(newViolations)
    }
  }, [sortedInsert, violations])

  const removeViolation = useCallback((serialNumber: string) => {
    const newViolations = [...violations]
    const index = violations.findIndex((v) => v.serialNumber === serialNumber)
    if (index !== -1) {
      newViolations.splice(index, 1)
      setViolations(newViolations)
    }
  }, [violations])

  const handleWebsocketMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "violation:new": {
        const violation = data.payload;
        if (isTypeViolation(violation)){
          insertViolation(data.payload);
        } else {
          console.log(`Cannot parse websocket message: ${data.payload}`);
        }
        break;
      }
      case "violation:updated": {
        const violationUpdate = data.payload;
        if (isTypeViolationUpdate(violationUpdate)){
          updateViolation(violationUpdate);
        } else {
          console.log(`Cannot parse websocket message: ${data.payload}`);
        }
        break;
      }
      case "violation:expired": {
        const serialNumber = data.payload;
        if (typeof serialNumber === "string"){
          removeViolation(serialNumber);
        } else {
          console.log(`Cannot parse websocket message: ${data.payload}`);
        }
        break;
      }
      default:
        console.log(`Unknown websocket message type: ${data.type}`);
    }
  }, [insertViolation, updateViolation, removeViolation]);

  useEffect(() => {
    const ws = new WebSocket(webSocketUrl);

    async function register(ws: WebSocket) {
      if (wsConnected.current) {
        console.log("Websocket already connected");
        return;
      }
      setWebSocket(ws);
      setWebSocketConnected(true);
      wsConnected.current = true;
    }

    register(ws);

    return () => {
      if (ws) {
        ws.close();
        setWebSocket(null);
        setWebSocketConnected(false);
        wsConnected.current = false;
      }
    }
  }, [webSocketUrl]);

  useEffect(() => {
    if (webSocket) {
      webSocket.onmessage = handleWebsocketMessage;
      webSocket.onerror = (event) => {
        console.log(`Websocket error: ${event}`);
        setWebSocketError(new Error(event.toString()));
      }
      webSocket.onclose = (event) => {
        console.log(`Websocket closed: ${event}`);
        setWebSocket(null);
        setWebSocketConnected(false);
        wsConnected.current = false;
      }
      webSocket.onopen = (event) => {
        console.log(`Websocket opened: ${event}`);
      }
    }
  }, [webSocket, handleWebsocketMessage]);

  return { violations, webSocket, webSocketError, webSocketConnected }
}