import { ServerRequest } from "https://deno.land/std@0.83.0/http/server.ts";
import { acceptWebSocket, acceptable } from "https://deno.land/std/ws/mod.ts";
import { Wrapper } from './wrapper.ts';
import { chatConnection } from "./ws/chat-room.ts";

const app = new Wrapper();
const port: number = 8000;

app.get('/', async (req: ServerRequest) => {
  req.respond({ status: 200, body: await Deno.open("./public/index.html") });
})
app.get('/styles.css', async (req: ServerRequest) => {
  const headers = new Headers({ 'content-type': 'text/css' });
  req.respond({ status: 200, body: await Deno.open('./public/styles.css'), headers });
});
app.get('/app.js', async (req: ServerRequest) => {
  req.respond({ status: 200, body: await Deno.open('./public/app.js') });
})
app.get('/ws', async (req: ServerRequest) => {
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
})
app.listen({ port });
