import { WebSocket, isWebSocketCloseEvent } from "https://deno.land/std/ws/mod.ts";
import { v4 } from "https://deno.land/std@0.83.0/uuid/mod.ts";

const sockets = new Map<string, WebSocket>();
const rooms = new Map<string, Set<string>>();
const users = new Map<string, Set<string>>();

interface PayloadObj {
  username: string;
  roomname: string;
  msg: string;
}

interface BroadcastObj {
  action: string;
  payload: PayloadObj;
}

const broadcastEvent = (roomname: string, username: string, msg: string) => {
  const room = rooms.get(roomname);
  room?.forEach((id: string) => {
    const ws = sockets.get(id);
    ws?.send(JSON.stringify({ username, msg }));
  })
}

const onJoin = (id: string, payload: PayloadObj) => {
  const { username, roomname, msg } = payload;
  const room = rooms.get(roomname) || rooms.set(roomname, new Set()).get(roomname);
  room?.add(id);
  const user = users.get(id) || users.set(id, new Set()).get(id);
  user?.add(roomname);
  broadcastEvent(roomname, username, msg);
}

const onLeave = (id: string, payload: PayloadObj) => {
  const { username, roomname, msg } = payload;
  const  usersSet = rooms.get(roomname);
  usersSet?.delete(id);
  const roomSet = users.get(id);
  roomSet?.delete(roomname)
  broadcastEvent(roomname, username, msg)
}

const onMsg = (_: string, payload: PayloadObj) => {
  const { username, roomname, msg } = payload;
  broadcastEvent(roomname, username, msg);
}

const chatConnection = async (ws: WebSocket) => {
  const uid = v4.generate();
  sockets.set(uid, ws);

  for await (const evt of ws) {
    if (isWebSocketCloseEvent(evt)) {
      sockets.delete(uid);
    }
    if (typeof evt === 'string') {
      const evtObj: BroadcastObj = JSON.parse(evt);
      if (evtObj.action === 'onjoin') {
        onJoin(uid, evtObj.payload)
      } else if (evtObj.action === 'onleave') {
        onLeave(uid, evtObj.payload);
      } else if (evtObj.action === 'msg') {
        onMsg(uid, evtObj.payload);
      }
    }
  }
}

export { chatConnection };