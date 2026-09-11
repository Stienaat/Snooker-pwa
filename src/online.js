const cleanName = (value) => value.trim().replace(/\s+/g, ' ').slice(0, 20);
const cleanCode = (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);

function createPlayerToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
}

export class OnlineLobby {
  constructor({ status, message, onRoom, onLeave, onReady, onGameEvent, onPresence, onChallenge }) {
    this.onStatus = status;
    this.onMessage = message;
    this.onRoom = onRoom;
    this.onLeave = onLeave;
    this.onReady = onReady;
    this.onGameEvent = onGameEvent;
    this.onPresence = onPresence;
    this.onChallenge = onChallenge;
    this.socket = null;
    this.playerName = '';
    this.roomCode = '';
    this.requestedSeat = '';
    this.playerToken = localStorage.getItem('snooker-player-token') || createPlayerToken();
    this.readyKey = '';
    this.manualLeave = false;
    this.reconnectTimer = 0;
    this.presenceStatus = '';
    this.heartbeatTimer = setInterval(() => {
      if (this.presenceStatus) this.send('HEARTBEAT', { status: this.presenceStatus });
    }, 15000);
    localStorage.setItem('snooker-player-token', this.playerToken);
  }

  get serverUrl() {
    const configured = window.SNOOKER_SERVER_URL?.trim();
    if (configured) return configured;
    return `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/ws`;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.socket?.readyState === WebSocket.CONNECTING) return this.connecting;

    this.onStatus('VERBINDEN…');
    this.connecting = new Promise((resolve, reject) => {
      const socket = new WebSocket(this.serverUrl);
      this.socket = socket;
      const timeout = setTimeout(() => {
        socket.close();
        reject(new Error('De spelserver antwoordt niet.'));
      }, 8000);

      socket.addEventListener('open', () => {
        clearTimeout(timeout);
        this.connecting = null;
        this.onStatus('IK BEN ONLINE');
        resolve();
      }, { once: true });

      socket.addEventListener('error', () => {
        clearTimeout(timeout);
        this.connecting = null;
        reject(new Error('Geen verbinding met de spelserver.'));
      }, { once: true });

      socket.addEventListener('message', (event) => this.receive(event));
      socket.addEventListener('close', () => {
        this.socket = null;
        this.connecting = null;
        if ((this.roomCode || this.presenceStatus) && !this.manualLeave) {
          this.onStatus('OPNIEUW VERBINDEN…');
          this.onMessage('VERBINDING VERBROKEN');
          this.scheduleReconnect();
        } else {
          this.onStatus('OFFLINE');
        }
      });
    });
    return this.connecting;
  }

  async create(name) {
    this.manualLeave = false;
    this.playerName = cleanName(name);
    if (!this.playerName) throw new Error('Vul eerst uw naam in.');
    this.requestedSeat = 'player1';
    await this.connect();
    this.presenceStatus = 'busy';
    this.send('CREATE_ROOM');
  }

  async join(name, code) {
    this.manualLeave = false;
    this.playerName = cleanName(name);
    this.roomCode = cleanCode(code);
    if (!this.playerName) throw new Error('Vul eerst uw naam in.');
    if (this.roomCode.length !== 6) throw new Error('Vul een geldige kamercode in.');
    this.requestedSeat = 'player2';
    await this.connect();
    this.presenceStatus = 'busy';
    this.send('JOIN_ROOM', { roomCode: this.roomCode });
  }

  async setPresence(name, status = 'available') {
    const cleaned = cleanName(name);
    if (!cleaned) return;
    this.manualLeave = false;
    this.playerName = cleaned;
    this.presenceStatus = status;
    await this.connect();
    this.send('PRESENCE', { status });
  }

  challenge(targetToken) {
    this.requestedSeat = 'player1';
    this.send('CHALLENGE', { targetToken });
  }

  acceptChallenge(challengerToken) {
    this.requestedSeat = 'player2';
    this.send('ACCEPT_CHALLENGE', { challengerToken });
  }

  declineChallenge(challengerToken) {
    this.send('DECLINE_CHALLENGE', { challengerToken });
  }

  leave() {
    clearTimeout(this.reconnectTimer);
    if (this.socket?.readyState === WebSocket.OPEN) this.send('LEAVE_ROOM');
    this.roomCode = '';
    this.readyKey = '';
    this.presenceStatus = 'available';
    this.send('PRESENCE', { status: 'available' });
    this.onLeave();
  }

  scheduleReconnect() {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(async () => {
      if (this.manualLeave || !this.roomCode) return;
      try {
        await this.connect();
        if (this.roomCode) this.send('JOIN_ROOM', { roomCode: this.roomCode });
        else if (this.presenceStatus) this.send('PRESENCE', { status: this.presenceStatus });
      } catch {
        this.scheduleReconnect();
      }
    }, 1500);
  }

  sendPlacement(position) { this.send('PLACE_WHITE', { position }); }
  sendShot(shot) { this.send('GAME_SHOT', { shot }); }
  sendState(state) { this.send('GAME_STATE', { state }); }
  sendReset() { this.send('GAME_RESET'); }
  sendCue(cue) { this.send('CUE_STATE', { cue }); }
  sendFrame(frame) { this.send('PHYSICS_FRAME', { frame }); }

  send(type, extra = {}) {
    if (this.socket?.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify({
      type,
      playerName: this.playerName,
      playerToken: this.playerToken,
      ...extra
    }));
    return true;
  }

  receive(event) {
    let data;
    try { data = JSON.parse(event.data); } catch { return; }

    if (data.type === 'ERROR') {
      this.onMessage(data.message || 'Er ging iets mis.');
      return;
    }
    if (data.type === 'PRESENCE_LIST') this.onPresence?.(data.players || []);
    if (data.type === 'CHALLENGE_RECEIVED') this.onChallenge?.({ token: data.fromToken, name: data.fromName });
    if (data.type === 'CHALLENGE_SENT') this.onMessage(`UITDAGING VERSTUURD NAAR ${data.targetName.toUpperCase()}`);
    if (data.type === 'CHALLENGE_DECLINED') this.onMessage(`${data.byName.toUpperCase()} HEEFT GEWEIGERD`);
    if (data.type === 'ROOM_STATE') {
      this.roomCode = data.roomCode;
      this.presenceStatus = 'busy';
      const opponent = data.players.find((player) => player.token !== this.playerToken);
      this.onStatus(opponent ? `VERBONDEN MET ${opponent.name}` : 'WACHT OP TEGENSTANDER');
      this.onMessage(opponent ? 'DE TAFEL IS KLAAR' : 'DEEL DE KAMERCODE');
      this.onRoom({ code: data.roomCode, opponent: opponent?.name || '' });
      if (opponent) {
        const key = `${data.roomCode}:${data.players.map((player) => player.token).sort().join(':')}`;
        if (key !== this.readyKey) {
          this.readyKey = key;
          this.onReady?.({
            seat: this.requestedSeat || data.yourSeat,
            turnSeat: data.turnSeat,
            player1Name: data.players.find((player) => player.seat === 'player1')?.name || 'SPELER 1',
            player2Name: data.players.find((player) => player.seat === 'player2')?.name || 'SPELER 2'
          });
        } else {
          this.onGameEvent?.({ type: 'ROOM_RESUMED', turnSeat: data.turnSeat });
        }
      }
    }
    if (data.type === 'OPPONENT_LEFT') {
      this.onStatus('TEGENSTANDER OFFLINE');
      this.onMessage('WACHT OP OPNIEUW VERBINDEN');
      this.onRoom({ code: this.roomCode, opponent: '' });
      this.onGameEvent?.({ type: 'OPPONENT_LEFT' });
    }
    if (data.type === 'PLACE_WHITE' || data.type === 'CUE_STATE' || data.type === 'GAME_SHOT' ||
        data.type === 'PHYSICS_FRAME' || data.type === 'GAME_STATE' || data.type === 'GAME_RESET') {
      this.onGameEvent?.(data);
    }
  }
}
