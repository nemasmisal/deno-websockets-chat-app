import { WebSocket, isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.83.0/uuid/mod.ts";

const sockets = new Map<string, WebSocket>();

interface BroadcastObj {
  name: string;
  msg: string;
}

const broadcastEvent = (obj: BroadcastObj) => {
  sockets.forEach((ws: WebSocket) => {
    ws.send(JSON.stringify(obj));
  })
}

const chatConnection = async (ws: WebSocket) => {
  const uid = v4.generate();
  sockets.set(uid, ws);

  for await (const evt of ws) {

    if(isWebSocketCloseEvent(evt)) {
      sockets.delete(uid);
    }

    if(typeof evt === 'string') {
      const evtObj = JSON.parse(evt);
      broadcastEvent(evtObj);
    }
  }
}

export { chatConnection };