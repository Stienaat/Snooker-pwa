import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';

const root = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 8080);
const rooms = new Map();
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml'
};

function roomCode() {
  let code;
  do {
    code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  } while (rooms.has(code));
  return code;
}

function send(socket, message) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
}

function publish(room) {
  const players = room.players.map(({ name, token, seat }) => ({ name, token, seat }));
  const turnSeat = room.players.find((player) => player.token === room.turnToken)?.seat || 'player1';
  room.players.forEach(({ socket, seat }) => send(socket, {
    type: 'ROOM_STATE', roomCode: room.code, players, yourSeat: seat, turnSeat
  }));
}

function relay(room, sender, message) {
  room.players
    .filter((player) => player.socket !== sender)
    .forEach(({ socket }) => send(socket, message));
}

function leave(socket, notify = true) {
  const code = socket.roomCode;
  if (!code) return;
  const room = rooms.get(code);
  socket.roomCode = '';
  if (!room) return;
  room.players = room.players.filter((player) => player.socket !== socket);
  if (room.turnToken === socket.playerToken) room.shotInProgress = false;
  if (!room.players.length) {
    clearTimeout(room.cleanupTimer);
    room.cleanupTimer = setTimeout(() => rooms.delete(code), 60000);
  } else if (notify) room.players.forEach(({ socket: peer }) => send(peer, { type: 'OPPONENT_LEFT' }));
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url, `http://${request.headers.host}`).pathname;
  const wanted = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = normalize(join(root, wanted));
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    response.writeHead(404).end('Niet gevonden');
    return;
  }
  response.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
  createReadStream(file).pipe(response);
});

const wss = new WebSocketServer({ server, path: '/ws' });
wss.on('connection', (socket) => {
  socket.on('message', (bytes) => {
    let data;
    try { data = JSON.parse(bytes.toString()); } catch { return; }
    const name = String(data.playerName || '').trim().slice(0, 20);
    const token = String(data.playerToken || '').slice(0, 80);
    if (!name || !token) return send(socket, { type: 'ERROR', message: 'Naam ontbreekt.' });

    if (data.type === 'CREATE_ROOM') {
      leave(socket, false);
      const code = roomCode();
      const room = {
        code,
        players: [{ name, token, seat: 'player1', socket }],
        turnToken: token,
        shotInProgress: false,
        state: null,
        seatByToken: new Map([[token, 'player1']]),
        cleanupTimer: null
      };
      rooms.set(code, room);
      socket.playerToken = token;
      socket.roomCode = code;
      publish(room);
    }

    if (data.type === 'JOIN_ROOM') {
      const code = String(data.roomCode || '').toUpperCase();
      const room = rooms.get(code);
      if (!room) return send(socket, { type: 'ERROR', message: 'Kamer niet gevonden.' });
      if (room.players.some((player) => player.token === token)) {
        const old = room.players.find((player) => player.token === token);
        old.socket.roomCode = '';
        old.socket.close();
        old.socket = socket;
      } else if (room.players.length >= 2) {
        return send(socket, { type: 'ERROR', message: 'Deze kamer is vol.' });
      } else {
        const seat = room.seatByToken.get(token) ||
          (room.players.some((player) => player.seat === 'player1') ? 'player2' : 'player1');
        room.seatByToken.set(token, seat);
        room.players.push({ name, token, seat, socket });
      }
      clearTimeout(room.cleanupTimer);
      room.cleanupTimer = null;
      socket.playerToken = token;
      socket.roomCode = code;
      publish(room);
      if (room.state) send(socket, { type: 'GAME_STATE', state: room.state });
    }

    if (data.type === 'LEAVE_ROOM') leave(socket);

    const room = rooms.get(socket.roomCode);
    if (!room) return;
    const sender = room.players.find((player) => player.socket === socket);
    if (!sender) return;

    if (data.type === 'PLACE_WHITE' && room.turnToken === token && !room.shotInProgress) {
      const { x, y } = data.position || {};
      if (Number.isFinite(x) && Number.isFinite(y)) relay(room, socket, { type: 'PLACE_WHITE', position: { x, y } });
    }

    if (data.type === 'CUE_STATE' && room.turnToken === token && !room.shotInProgress) {
      const cue = data.cue || {};
      if ([cue.angle, cue.power, cue.topSpin, cue.sideSpin].every(Number.isFinite)) {
        relay(room, socket, { type: 'CUE_STATE', cue });
      }
    }

    if (data.type === 'GAME_SHOT' && room.turnToken === token && !room.shotInProgress) {
      const shot = data.shot || {};
      if ([shot.angle, shot.power, shot.topSpin, shot.sideSpin].every(Number.isFinite) && shot.power >= 0 && shot.power <= 1) {
        room.shotInProgress = true;
        relay(room, socket, { type: 'GAME_SHOT', shot });
      }
    }

    if (data.type === 'PHYSICS_FRAME' && room.turnToken === token && room.shotInProgress) {
      const frame = data.frame;
      if (Array.isArray(frame?.balls) && frame.balls.length <= 22) {
        relay(room, socket, { type: 'PHYSICS_FRAME', frame });
      }
    }

    if (data.type === 'GAME_STATE' && room.turnToken === token && room.shotInProgress) {
      const state = data.state;
      const next = room.players.find((player) => player.seat === state?.currentPlayer);
      if (next && Array.isArray(state.balls) && state.balls.length <= 22) {
        room.shotInProgress = false;
        room.turnToken = next.token;
        room.state = state;
        relay(room, socket, { type: 'GAME_STATE', state });
        publish(room);
      }
    }

    if (data.type === 'GAME_RESET' && !room.shotInProgress) {
      room.turnToken = room.players.find((player) => player.seat === 'player1')?.token || room.turnToken;
      room.state = null;
      relay(room, socket, { type: 'GAME_RESET' });
      publish(room);
    }
  });
  socket.on('close', () => leave(socket));
});

server.listen(port, () => console.log(`Snooker Online luistert op poort ${port}`));
