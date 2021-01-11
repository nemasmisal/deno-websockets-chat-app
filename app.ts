import { serve } from "https://deno.land/std/http/server.ts";
import { chatConnection } from "./ws/chat-room.ts";
import { acceptWebSocket, acceptable } from "https://deno.land/std/ws/mod.ts";

const server = serve({ port: 8000 });
console.log("http://localhost:8000/");

for await (const req of server) {
  if (req.url === '/') {
    req.respond({ status: 200, body: await Deno.open("./public/index.html") });
  } else if (req.url === '/styles.css') {
    req.respond({ status: 200, body: await Deno.open('./public/styles.css') })
  } else if (req.url === '/app.js') {
    const headers = new Headers({ 'content-type': 'text/css' });
    req.respond({ status: 200, body: await Deno.open('./public/app.js'), headers })
    console.log(headers)
  } else if (req.url === '/ws') {
    const { conn, r: bufReader, w: bufWriter, headers } = req;
    if (acceptable(req)) {
      acceptWebSocket({
        conn,
        bufReader,
        bufWriter,
        headers,
      })
        .then(chatConnection)
        .catch(async (err: Error) => {
          console.error(`failed to accept websocket: ${err}`);
          await req.respond({ status: 400 });
        });
    }
  } else {
    req.respond({ status: 404, body: 'Error . Page not found :/' })
  }
}

