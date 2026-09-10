const TABLE_LENGTH = 3569;
const TABLE_WIDTH = 1778;
const BALL_RADIUS = 26.25;
const BALL_VALUES = { red: 1, yellow: 2, green: 3, brown: 4, blue: 5, pink: 6, black: 7 };
const COLOR_ORDER = ['yellow', 'green', 'brown', 'blue', 'pink', 'black'];
const POCKETS = [
  { x: 0, y: 0 }, { x: TABLE_LENGTH / 2, y: 0 }, { x: TABLE_LENGTH, y: 0 },
  { x: 0, y: TABLE_WIDTH }, { x: TABLE_LENGTH / 2, y: TABLE_WIDTH }, { x: TABLE_LENGTH, y: TABLE_WIDTH }
];
const PHONE_LEVELS = {
  novice:   { label: 'NOVICE',    angleError: .075, powerError: .18, choiceNoise: 1050, valueWeight: 0 },
  basic:    { label: 'BASIC',     angleError: .038, powerError: .10, choiceNoise: 520,  valueWeight: 12 },
  advanced: { label: 'GEVORDERD', angleError: .018, powerError: .05, choiceNoise: 120,  valueWeight: 35 },
  expert:   { label: 'EXPERT',    angleError: .007, powerError: .022, choiceNoise: 0,   valueWeight: 95 }
};
const TRAINING_GUIDES = [
  { name: 'STOPBAL', instruction: 'Raak de rode bal vol en kies het raakpunt net onder het centrum.', result: 'Wit stopt vrijwel op het contactpunt; rood loopt door.', topSpin: -.04, sideSpin: 0, power: .42, powerName: 'MIDDEL' },
  { name: 'DOORLOOPBAL', instruction: 'Raak de rode bal volgens de lijn en geef duidelijke topspin.', result: 'Wit blijft na de botsing vooruit rollen.', topSpin: .55, sideSpin: 0, power: .5, powerName: 'MIDDEL' },
  { name: 'TREKBAL', instruction: 'Raak de rode bal vrij vol en geef duidelijke backspin.', result: 'Wit keert na de botsing terug.', topSpin: -.62, sideSpin: 0, power: .62, powerName: 'STEVIG' }
];
const COLOR_SPOTS = {
  yellow: { x: 737, y: TABLE_WIDTH / 2 + 292 },
  green: { x: 737, y: TABLE_WIDTH / 2 - 292 },
  brown: { x: 737, y: TABLE_WIDTH / 2 },
  blue: { x: TABLE_LENGTH * .5, y: TABLE_WIDTH / 2 },
  pink: { x: TABLE_LENGTH * .75, y: TABLE_WIDTH / 2 },
  black: { x: TABLE_LENGTH - 324, y: TABLE_WIDTH / 2 }
};

export class SnookerTable {
  constructor(canvas, onStateChange = () => {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.onStateChange = onStateChange;
    this.mode = null;
    this.balls = [];
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = 'human';
    this.phoneTimer = 0;
    this.phoneLevel = 'advanced';
    this.phoneSequenceActive = false;
    this.online = null;
    this.remoteOnlineShot = false;
    this.lastOnlineFrameAt = 0;
    this.lastOnlineCueAt = 0;
    this.remoteCueReceived = false;
    this.remoteCueLocked = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    this.guideVisible = true;
    this.guideMode = 'normal';
    this.trainingScenario = 0;
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    this.phase = 'idle';
    this.aimAngle = 0;
    this.power = 0;
    this.pointer = null;
    this.lastTime = 0;
    this.animationFrame = 0;
    this.bindControls();
    this.resize();
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bounds = this.canvas.getBoundingClientRect();
    this.canvas.width = Math.round(bounds.width * dpr);
    this.canvas.height = Math.round(bounds.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = bounds.width;
    this.height = bounds.height;
    this.draw();
  }

  showEmptyTable() {
    cancelAnimationFrame(this.animationFrame);
    this.mode = null;
    this.balls = [];
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = 'human';
    clearTimeout(this.phoneTimer);
    this.phoneSequenceActive = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    this.guideVisible = true;
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    this.setPhase('idle');
    this.draw();
  }

  start(mode, level = null) {
    this.mode = mode;
    if (mode === 'computer' && PHONE_LEVELS[level]) this.phoneLevel = level;
    this.reset();
  }

  startOnline(options) {
    this.online = options;
    this.mode = 'online';
    this.reset();
  }

  reset() {
    if (!this.mode) return;
    cancelAnimationFrame(this.animationFrame);
    this.balls = this.mode === 'school' ? trainingBalls(this.trainingScenario) : initialBalls();
    this.potAnimations = [];
    this.whitePotted = false;
    this.score = 0;
    this.phoneScore = 0;
    this.breakScore = 0;
    this.currentPlayer = this.mode === 'online' ? (this.online?.turnSeat || 'player1') : 'human';
    clearTimeout(this.phoneTimer);
    this.phoneSequenceActive = false;
    this.rulePhase = 'red';
    this.clearanceIndex = 0;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.statusMessage = 'FAUL OF GEEN POT';
    this.guideVisible = true;
    this.guideMode = this.mode === 'school' ? 'extra' : 'normal';
    this.effectSelectorOpen = false;
    this.topSpin = 0;
    this.sideSpin = 0;
    if (this.mode === 'school') {
      const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
      this.topSpin = guide.topSpin;
      this.sideSpin = guide.sideSpin;
    }
    this.phase = this.mode === 'school'
      ? 'idle'
      : this.mode === 'online' && this.online?.seat !== this.currentPlayer ? 'waiting' : 'placing';
    this.aimAngle = 0;
    this.power = 0;
    this.pointer = null;
    this.lastTime = 0;
    this.emitState(this.mode === 'school' ? 'SCHOLING' : 'PLAATS WIT IN DE D');
    this.draw();
  }

  setPhase(phase) {
    this.phase = phase;
    this.emitState();
    this.sendOnlineCue(true);
    // Een fasewissel moet onmiddellijk zichtbaar zijn. Zonder deze redraw
    // bleef de witte lijn staan tot de eerstvolgende vingerbeweging.
    this.draw();
  }

  toggleGuide() {
    if (this.mode === 'school') {
      this.guideMode = this.guideMode === 'extra'
        ? 'normal'
        : this.guideMode === 'normal' ? 'off' : 'extra';
      this.guideVisible = this.guideMode !== 'off';
      this.draw();
      return this.guideMode;
    }
    this.guideVisible = !this.guideVisible;
    this.draw();
    return this.guideVisible;
  }

  toggleEffectSelector() {
    if (this.phase !== 'idle') return;
    this.effectSelectorOpen = !this.effectSelectorOpen;
    this.sendOnlineCue(true);
    this.emitState();
    this.draw();
  }

  emitState(message) {
    if (message) this.statusMessage = message;
    this.onStateChange({
      phase: this.phase,
      effectSelectorOpen: this.effectSelectorOpen,
      score: this.score,
      phoneScore: this.phoneScore,
      breakScore: this.breakScore,
      currentPlayer: this.currentPlayer,
      message: this.statusMessage,
      target: this.targetText()
    });
  }

  targetText() {
    if (this.mode === 'school') return 'EFFECTEN';
    if (this.phase === 'placing') return 'PLAATS WIT IN DE D';
    if (this.phase === 'computer') return 'PHONE DENKT';
    if (this.phase === 'waiting') return `${this.onlinePlayerName(this.currentPlayer)} SPEELT`;
    if (this.phase === 'disconnected') return `${this.onlineOpponentName()} OFFLINE`;
    if (this.rulePhase === 'red') return 'SPEEL ROOD';
    if (this.rulePhase === 'color') return 'SPEEL KLEUR';
    if (this.rulePhase === 'clearance') return `SPEEL ${COLOR_ORDER[this.clearanceIndex].toUpperCase()}`;
    return 'FRAME KLAAR';
  }

  onlinePlayerName(seat) {
    if (seat === 'player1') return (this.online?.player1Name || 'SPELER 1').toUpperCase();
    return (this.online?.player2Name || 'SPELER 2').toUpperCase();
  }

  onlineOpponentName() {
    const opponentSeat = this.online?.seat === 'player1' ? 'player2' : 'player1';
    return this.onlinePlayerName(opponentSeat);
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => this.pointerDown(event));
    this.canvas.addEventListener('pointermove', (event) => this.pointerMove(event));
    this.canvas.addEventListener('pointerup', (event) => this.pointerUp(event));
    this.canvas.addEventListener('pointercancel', (event) => this.pointerUp(event, true));
  }

  pointerPosition(event) {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  pointerDown(event) {
    if (!this.mode || this.phase === 'moving' || this.phase === 'computer' || this.phase === 'waiting' || this.phase === 'disconnected' ||
        this.currentPlayer === 'phone' || (this.mode === 'online' && this.currentPlayer !== this.online?.seat)) return;
    const point = this.pointerPosition(event);
    this.canvas.setPointerCapture(event.pointerId);
    this.pointer = {
      id: event.pointerId,
      start: point,
      last: point,
      moved: 0
    };
    if (this.phase === 'placing') this.placeWhiteAt(point);
  }

  pointerMove(event) {
    if (!this.pointer || this.pointer.id !== event.pointerId) return;
    const point = this.pointerPosition(event);
    const dx = point.x - this.pointer.last.x;
    const dy = point.y - this.pointer.last.y;
    this.pointer.moved += Math.hypot(dx, dy);

    if (this.phase === 'placing') {
      this.placeWhiteAt(point);
    } else if (this.phase === 'idle') {
      if (this.effectSelectorOpen) {
        const sensitivity = Math.max(90, Math.min(this.width, this.height) * .18);
        this.sideSpin = Math.max(-1, Math.min(1, this.sideSpin + dx / sensitivity));
        this.topSpin = Math.max(-1, Math.min(1, this.topSpin - dy / sensitivity));
        const length = Math.hypot(this.sideSpin, this.topSpin);
        if (length > 1) {
          this.sideSpin /= length;
          this.topSpin /= length;
        }
      } else {
        const white = this.whiteScreenPosition();
        const previousAngle = Math.atan2(this.pointer.last.y - white.y, this.pointer.last.x - white.x);
        const currentAngle = Math.atan2(point.y - white.y, point.x - white.x);
        this.aimAngle += normalizeAngle(currentAngle - previousAngle);
      }
    } else if (this.phase === 'locked') {
      const totalX = point.x - this.pointer.start.x;
      const totalY = point.y - this.pointer.start.y;
      const backwardX = -Math.cos(this.aimAngle);
      const backwardY = -Math.sin(this.aimAngle);
      const pull = totalX * backwardX + totalY * backwardY;
      const maxPull = Math.max(110, Math.min(this.width, this.height) * .24);
      this.power = Math.max(0, Math.min(1, pull / maxPull));
    }

    this.pointer.last = point;
    this.sendOnlineCue();
    this.draw();
  }

  pointerUp(event, cancelled = false) {
    if (!this.pointer || this.pointer.id !== event.pointerId) return;
    const moved = this.pointer.moved;
    this.pointer = null;
    if (cancelled) {
      this.power = 0;
      this.draw();
      return;
    }

    if (this.phase === 'placing') {
      if (this.mode === 'online') {
        const white = this.balls.find((ball) => ball.kind === 'white');
        this.online?.onPlacement?.({ x: white.x, y: white.y });
      }
      this.power = 0;
      this.statusMessage = 'FAUL OF GEEN POT';
      this.setPhase('idle');
    } else if (this.phase === 'idle' && this.effectSelectorOpen) {
      // De gekozen pomeranspositie blijft bewaard, maar na loslaten
      // sluit de instelmodus zodat de speler meteen weer kan richten.
      this.effectSelectorOpen = false;
      this.emitState();
      // Een gewone tik zonder veegbeweging mag tegelijk de richting
      // vastzetten; zo ontstaat na EFFECT geen extra lege tik.
      if (moved < 12) this.setPhase('locked');
      else this.draw();
    } else if (this.phase === 'idle' && moved < 12) {
      this.setPhase('locked');
    } else if (this.phase === 'locked') {
      if (this.power >= .025) this.shoot();
      else if (moved < 12) {
        // Tik zonder spanning: ontgrendel en laat opnieuw richten.
        this.power = 0;
        this.setPhase('idle');
        this.draw();
      } else {
        // Eerst aangespannen en daarna volledig terug naar nul:
        // geen stoot, maar de gekozen richting blijft vaststaan.
        this.power = 0;
        this.draw();
      }
    }
  }

  shoot(remote = false) {
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    // Een gebogen krachtcurve geeft meer regelruimte bij zachte en
    // middelmatige stoten. De lagere pieksnelheid voorkomt een onnatuurlijk
    // explosieve start; de lagere rolweerstand behoudt toch het volle bereik.
    const shapedPower = Math.pow(this.power, 1.35);
    const speed = 300 + shapedPower * 5300;
    const shot = { angle: this.aimAngle, power: this.power, topSpin: this.topSpin, sideSpin: this.sideSpin };
    if (this.mode === 'online' && !remote) this.online?.onShot?.(shot);
    this.remoteOnlineShot = remote;
    white.vx = Math.cos(this.aimAngle) * speed;
    white.vy = Math.sin(this.aimAngle) * speed;
    white.topSpin = this.topSpin;
    white.sideSpin = this.sideSpin;
    // Bewaar de werkelijke stootsnelheid. Bij een rechte botsing staat de
    // witte bal na de snelheidsoverdracht bijna stil; het resterende
    // topspin/backspin moet daarom uit de snelheid vlak vóór de botsing
    // worden berekend, niet uit de snelheid erna.
    white.shotSpeed = speed;
    this.firstContact = null;
    this.pottedThisShot = [];
    this.power = 0;
    this.setPhase('moving');
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame((time) => this.tick(time));
  }

  sendOnlineCue(force = false) {
    if (this.mode !== 'online' || this.currentPlayer !== this.online?.seat ||
        (this.phase !== 'idle' && this.phase !== 'locked')) return;
    const now = performance.now();
    if (!force && now - this.lastOnlineCueAt < 45) return;
    this.lastOnlineCueAt = now;
    this.online?.onCue?.({
      angle: this.aimAngle,
      power: this.power,
      topSpin: this.topSpin,
      sideSpin: this.sideSpin,
      locked: this.phase === 'locked'
    });
  }

  placeWhiteAt(screenPoint) {
    const g = this.geometry();
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;

    // Zet de schermpositie om naar officiële tafelmillimeters en begrens
    // het middelpunt van wit tot de bruikbare binnenzijde van de D.
    const centerX = 737;
    const centerY = TABLE_WIDTH / 2;
    const usableRadius = 292 - BALL_RADIUS;
    let dx = (screenPoint.x - g.x) / g.scale - centerX;
    let dy = (screenPoint.y - g.y) / g.scale - centerY;
    dx = Math.min(0, dx);
    const distance = Math.hypot(dx, dy);
    if (distance > usableRadius) {
      const factor = usableRadius / distance;
      dx *= factor;
      dy *= factor;
    }

    const x = centerX + dx;
    const y = centerY + dy;
    const free = this.balls.every((ball) => ball === white ||
      Math.hypot(ball.x - x, ball.y - y) >= BALL_RADIUS * 2);
    if (free) {
      white.x = x;
      white.y = y;
    }
    this.draw();
  }

  tick(time) {
    const dt = Math.min(.025, Math.max(0, (time - this.lastTime) / 1000));
    this.lastTime = time;
    const maximumSpeed = this.balls.reduce(
      (maximum, ball) => Math.max(maximum, Math.hypot(ball.vx, ball.vy)),
      0
    );
    const maximumStepDistance = BALL_RADIUS * .45;
    const steps = Math.max(1, Math.min(24, Math.ceil(maximumSpeed * dt / maximumStepDistance)));
    const stepDt = dt / steps;
    for (let step = 0; step < steps; step += 1) this.stepPhysics(stepDt);

    for (const animation of this.potAnimations) animation.age += dt;
    this.potAnimations = this.potAnimations.filter((animation) => animation.age < .42);
    this.draw();
    if (this.mode === 'online' && !this.remoteOnlineShot && time - this.lastOnlineFrameAt >= 40) {
      this.lastOnlineFrameAt = time;
      this.online?.onFrame?.({
        balls: this.balls.map((ball) => ({ ...ball })),
        potAnimations: this.potAnimations.map((animation) => ({ ...animation }))
      });
    }
    if (this.balls.every((ball) => ball.vx === 0 && ball.vy === 0) && this.potAnimations.length === 0) {
      const result = this.finishShot();
      this.continueAfterShot(result);
      return;
    }
    this.animationFrame = requestAnimationFrame((next) => this.tick(next));
  }

  stepPhysics(dt) {
    const restitution = .83;
    // Tijdonafhankelijke rolvertraging. Een hogere basiswaarde betekent
    // minder afremming; zo blijft het gedrag gelijk bij 60 en 120 Hz.
    const friction = Math.pow(.44, dt);
    const remainingBalls = [];
    for (const ball of this.balls) {
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      const pocket = capturedPocket(ball);
      if (pocket) {
        this.potAnimations.push({
          x: ball.x,
          y: ball.y,
          pocketX: pocket.x,
          pocketY: pocket.y,
          color: ball.color,
          age: 0
        });
        if (ball.kind === 'white') this.whitePotted = true;
        else this.pottedThisShot.push({ ...ball });
        continue;
      }

      if (ball.x < BALL_RADIUS) {
        ball.x = BALL_RADIUS;
        ball.vx = Math.abs(ball.vx) * restitution;
        if (ball.kind === 'white') ball.vy -= (ball.sideSpin || 0) * Math.abs(ball.vx) * .18;
      }
      if (ball.x > TABLE_LENGTH - BALL_RADIUS) {
        ball.x = TABLE_LENGTH - BALL_RADIUS;
        ball.vx = -Math.abs(ball.vx) * restitution;
        if (ball.kind === 'white') ball.vy += (ball.sideSpin || 0) * Math.abs(ball.vx) * .18;
      }
      if (ball.y < BALL_RADIUS) {
        ball.y = BALL_RADIUS;
        ball.vy = Math.abs(ball.vy) * restitution;
        if (ball.kind === 'white') ball.vx += (ball.sideSpin || 0) * Math.abs(ball.vy) * .18;
      }
      if (ball.y > TABLE_WIDTH - BALL_RADIUS) {
        ball.y = TABLE_WIDTH - BALL_RADIUS;
        ball.vy = -Math.abs(ball.vy) * restitution;
        if (ball.kind === 'white') ball.vx -= (ball.sideSpin || 0) * Math.abs(ball.vy) * .18;
      }
      remainingBalls.push(ball);
    }
    this.balls = remainingBalls;

    // Gelijke massa's: alleen de snelheid langs de botsingslijn wordt
    // uitgewisseld. Dit is dezelfde wiskundige basis voor mens en pc.
    for (let i = 0; i < this.balls.length; i += 1) {
      for (let j = i + 1; j < this.balls.length; j += 1) {
        const a = this.balls[i];
        const b = this.balls[j];
        const firstWhiteContact = !this.firstContact && ballsOverlap(a, b) &&
          (a.kind === 'white' || b.kind === 'white');
        const white = firstWhiteContact ? (a.kind === 'white' ? a : b) : null;
        const impactVx = white?.vx || 0;
        const impactVy = white?.vy || 0;
        const impactSpeed = Math.hypot(impactVx, impactVy);
        if (firstWhiteContact) this.firstContact = a.kind === 'white' ? b.kind : a.kind;
        resolveBallCollision(a, b);
        if (firstWhiteContact) {
          // De draaiing van de witte bal blijft bij het contact aanwezig.
          // Topspin laat hem in de inkomende richting doorlopen; backspin
          // trekt hem in de tegengestelde richting terug.
          const usableImpact = Math.max(180, impactSpeed);
          const directionX = impactSpeed > 1 ? impactVx / impactSpeed : Math.cos(this.aimAngle);
          const directionY = impactSpeed > 1 ? impactVy / impactSpeed : Math.sin(this.aimAngle);
          const spinVelocity = this.topSpin * usableImpact * .62;
          white.vx += directionX * spinVelocity;
          white.vy += directionY * spinVelocity;
          white.topSpin = 0;
        }
      }
    }

    for (const ball of this.balls) {
      ball.vx *= friction;
      ball.vy *= friction;
      if (ball.kind === 'white') ball.sideSpin = (ball.sideSpin || 0) * Math.pow(.52, dt);
      if (Math.hypot(ball.vx, ball.vy) < 7) { ball.vx = 0; ball.vy = 0; }
    }
  }

  whiteScreenPosition() {
    const g = this.geometry();
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return { x: g.x, y: g.y };
    return { x: g.x + white.x * g.scale, y: g.y + white.y * g.scale };
  }

  replaceWhiteInD() {
    this.balls.push({
      x: 737 - 292 * .48,
      y: TABLE_WIDTH / 2,
      color: '#f3f3e9',
      kind: 'white',
      vx: 0,
      vy: 0
    });
    this.whitePotted = false;
  }

  switchPlayer() {
    if (this.mode === 'computer') this.currentPlayer = this.currentPlayer === 'human' ? 'phone' : 'human';
    if (this.mode === 'online') this.currentPlayer = this.currentPlayer === 'player1' ? 'player2' : 'player1';
  }

  addPoints(player, points) {
    if (player === 'phone' || player === 'player2') this.phoneScore += points;
    else this.score += points;
  }

  continueAfterShot(result) {
    if (this.mode === 'school') {
      this.setPhase('idle');
      return;
    }
    if (this.mode === 'online') {
      const nextPhase = this.currentPlayer === this.online?.seat
        ? (result.whitePotted ? 'placing' : 'idle')
        : 'waiting';
      this.setPhase(nextPhase);
      if (!this.remoteOnlineShot) this.online?.onSettled?.(this.onlineState());
      this.remoteOnlineShot = false;
      return;
    }
    if (this.mode !== 'computer') {
      this.setPhase(result.whitePotted ? 'placing' : 'idle');
      return;
    }
    if (this.currentPlayer === 'phone') {
      this.beginPhoneTurn();
    } else {
      if (this.phoneSequenceActive) {
        this.topSpin = this.savedHumanTopSpin || 0;
        this.sideSpin = this.savedHumanSideSpin || 0;
        this.phoneSequenceActive = false;
      }
      this.setPhase(result.whitePotted ? 'placing' : 'idle');
    }
  }

  receiveOnlinePlacement({ x, y }) {
    if (this.mode !== 'online') return;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    white.x = x;
    white.y = y;
    this.setPhase(this.currentPlayer === this.online?.seat ? 'idle' : 'waiting');
  }

  receiveOnlineShot(shot) {
    if (this.mode !== 'online' || this.phase === 'moving') return;
    this.aimAngle = shot.angle;
    this.power = shot.power;
    this.topSpin = shot.topSpin;
    this.sideSpin = shot.sideSpin;
    this.remoteOnlineShot = true;
    cancelAnimationFrame(this.animationFrame);
    this.setPhase('moving');
  }

  receiveOnlineCue(cue) {
    if (this.mode !== 'online' || this.currentPlayer === this.online?.seat || this.phase === 'moving') return;
    this.aimAngle = cue.angle;
    this.power = cue.power;
    this.topSpin = cue.topSpin;
    this.sideSpin = cue.sideSpin;
    this.remoteCueLocked = Boolean(cue.locked);
    this.remoteCueReceived = true;
    this.draw();
  }

  receiveOnlineFrame(frame) {
    if (this.mode !== 'online' || !this.remoteOnlineShot || !Array.isArray(frame?.balls)) return;
    this.balls = frame.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 }));
    this.potAnimations = Array.isArray(frame.potAnimations)
      ? frame.potAnimations.map((animation) => ({ ...animation })) : [];
    this.draw();
  }

  onlineState() {
    return {
      balls: this.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 })),
      score: this.score,
      phoneScore: this.phoneScore,
      breakScore: this.breakScore,
      currentPlayer: this.currentPlayer,
      rulePhase: this.rulePhase,
      clearanceIndex: this.clearanceIndex,
      statusMessage: this.statusMessage,
      phase: this.phase
    };
  }

  applyOnlineState(state) {
    if (this.mode !== 'online' || !state?.balls) return;
    cancelAnimationFrame(this.animationFrame);
    this.potAnimations = [];
    this.balls = state.balls.map((ball) => ({ ...ball, vx: 0, vy: 0 }));
    this.score = state.score;
    this.phoneScore = state.phoneScore;
    this.breakScore = state.breakScore;
    this.currentPlayer = state.currentPlayer;
    this.rulePhase = state.rulePhase;
    this.clearanceIndex = state.clearanceIndex;
    this.statusMessage = state.statusMessage;
    this.whitePotted = false;
    this.remoteOnlineShot = false;
    this.remoteCueReceived = false;
    const ownPhase = state.phase === 'placing' ? 'placing' : 'idle';
    this.setPhase(this.currentPlayer === this.online?.seat ? ownPhase : 'waiting');
  }

  setOnlineDisconnected() {
    if (this.mode !== 'online') return;
    this.statusMessage = 'VERBINDING VERBROKEN';
    this.setPhase('disconnected');
  }

  resumeOnline(turnSeat) {
    if (this.mode !== 'online') return;
    this.currentPlayer = turnSeat || this.currentPlayer;
    const ownTurn = this.currentPlayer === this.online?.seat;
    this.setPhase(ownTurn ? (this.balls.some((ball) => ball.kind === 'white') ? 'idle' : 'placing') : 'waiting');
  }

  beginPhoneTurn() {
    if (!this.phoneSequenceActive) {
      this.savedHumanTopSpin = this.topSpin;
      this.savedHumanSideSpin = this.sideSpin;
      this.phoneSequenceActive = true;
    }
    this.effectSelectorOpen = false;
    this.power = 0;
    this.setPhase('computer');
    clearTimeout(this.phoneTimer);
    this.phoneTimer = setTimeout(() => {
      if (this.mode !== 'computer' || this.currentPlayer !== 'phone') return;
      const shot = this.choosePhoneShot();
      this.aimAngle = shot.angle;
      this.power = shot.power;
      this.topSpin = shot.topSpin;
      this.sideSpin = 0;
      this.draw();
      this.phoneTimer = setTimeout(() => {
        if (this.mode === 'computer' && this.currentPlayer === 'phone') this.shoot();
      }, 850);
    }, 650);
  }

  newTrainingScenario() {
    if (this.mode !== 'school') return;
    this.trainingScenario = (this.trainingScenario + 1) % 3;
    this.reset();
  }

  choosePhoneShot() {
    const profile = PHONE_LEVELS[this.phoneLevel] || PHONE_LEVELS.advanced;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return { angle: 0, power: .35, topSpin: 0 };
    const expected = this.rulePhase === 'clearance'
      ? COLOR_ORDER[this.clearanceIndex]
      : this.rulePhase;
    const legalBalls = this.balls.filter((ball) => ball !== white && (
      expected === 'color' ? ball.kind !== 'red' : ball.kind === expected
    ));
    let best = null;

    for (const ball of legalBalls) {
      for (const pocket of POCKETS) {
        const pocketDistance = Math.hypot(pocket.x - ball.x, pocket.y - ball.y);
        if (pocketDistance < 1) continue;
        const outX = (pocket.x - ball.x) / pocketDistance;
        const outY = (pocket.y - ball.y) / pocketDistance;
        const ghost = { x: ball.x - outX * BALL_RADIUS * 2, y: ball.y - outY * BALL_RADIUS * 2 };
        if (ghost.x < BALL_RADIUS || ghost.x > TABLE_LENGTH - BALL_RADIUS ||
            ghost.y < BALL_RADIUS || ghost.y > TABLE_WIDTH - BALL_RADIUS) continue;
        if (!this.pathIsClear(white, ghost, ball) || !this.pathIsClear(ball, pocket, ball)) continue;

        const cueDistance = Math.hypot(ghost.x - white.x, ghost.y - white.y);
        const inX = (ghost.x - white.x) / Math.max(1, cueDistance);
        const inY = (ghost.y - white.y) / Math.max(1, cueDistance);
        const alignment = inX * outX + inY * outY;
        if (alignment < .12) continue;
        const valueBonus = expected === 'color' ? (BALL_VALUES[ball.kind] || 0) * profile.valueWeight : 0;
        const score = cueDistance * .35 + pocketDistance + (1 - alignment) * 1700
          - valueBonus + Math.random() * profile.choiceNoise;
        if (!best || score < best.score) best = { ball, ghost, cueDistance, pocketDistance, alignment, score };
      }
    }

    if (best) {
      const baseAngle = Math.atan2(best.ghost.y - white.y, best.ghost.x - white.x);
      const error = (Math.random() - .5) * profile.angleError;
      const travel = best.cueDistance + best.pocketDistance * .72;
      const power = clamp(Math.pow(travel / 5100, .72), .2, .9);
      const topSpin = best.alignment > .82 ? -.12 : .08;
      return {
        angle: baseAngle + error,
        power: clamp(power + (Math.random() - .5) * profile.powerError, .16, .94),
        topSpin: this.phoneLevel === 'novice' ? 0 : topSpin
      };
    }

    // Geen vrije potlijn: raak een geldige bal rustig en speel verder via
    // dezelfde fysica. Dit voorkomt dat de phone een onmogelijke bal forceert.
    const fallback = legalBalls
      .filter((ball) => this.pathIsClear(white, ball, ball))
      .sort((a, b) => Math.hypot(a.x - white.x, a.y - white.y) - Math.hypot(b.x - white.x, b.y - white.y))[0]
      || legalBalls[0];
    if (!fallback) return { angle: 0, power: .28, topSpin: 0 };
    return {
      angle: Math.atan2(fallback.y - white.y, fallback.x - white.x) + (Math.random() - .5) * profile.angleError * 1.35,
      power: clamp(.3 + (Math.random() - .5) * profile.powerError, .2, .42),
      topSpin: this.phoneLevel === 'novice' ? 0 : -.08
    };
  }

  pathIsClear(from, to, target) {
    return this.balls.every((ball) => {
      if (ball === from || ball === target || ball.kind === 'white') return true;
      return pointSegmentDistance(ball, from, to) > BALL_RADIUS * 2.08;
    });
  }

  finishShot() {
    if (this.mode === 'school') {
      this.breakScore = 0;
      this.emitState('SPEEL OPNIEUW OF KIES NIEUW');
      return { foul: false, whitePotted: false };
    }
    const shooter = this.currentPlayer;
    const whiteWasPotted = this.whitePotted;
    const expected = this.rulePhase === 'clearance'
      ? COLOR_ORDER[this.clearanceIndex]
      : this.rulePhase;
    const objectPots = this.pottedThisShot;
    const wrongFirst = !this.firstContact || (
      expected === 'color'
        ? this.firstContact === 'red'
        : this.firstContact !== expected
    );
    const nominatedColor = this.rulePhase === 'color' && this.firstContact !== 'red'
      ? this.firstContact
      : null;
    const wrongPot = objectPots.some((ball) => {
      if (expected === 'color') return ball.kind !== nominatedColor;
      return ball.kind !== expected;
    });
    const foul = this.whitePotted || wrongFirst || wrongPot;

    if (this.whitePotted) this.replaceWhiteInD();

    if (foul) {
      const highest = Math.max(4, BALL_VALUES[this.firstContact] || 0, ...objectPots.map((ball) => BALL_VALUES[ball.kind] || 0));
      this.breakScore = 0;
      const opponent = this.mode === 'online'
        ? (shooter === 'player1' ? 'player2' : 'player1')
        : (shooter === 'phone' ? 'human' : 'phone');
      if (this.mode === 'computer' || this.mode === 'online') this.addPoints(opponent, highest);
      this.respotPottedColors();
      if (this.rulePhase === 'color') {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
      this.switchPlayer();
      this.emitState(`FOUL ${highest}`);
      return { foul: true, whitePotted: whiteWasPotted };
    }

    let points = 0;
    if (this.rulePhase === 'red') {
      points = objectPots.filter((ball) => ball.kind === 'red').length;
      this.respotPottedColors();
      if (points > 0) this.rulePhase = 'color';
    } else if (this.rulePhase === 'color') {
      points = objectPots.reduce((sum, ball) => sum + BALL_VALUES[ball.kind], 0);
      this.respotPottedColors();
      if (points > 0) {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
    } else if (this.rulePhase === 'clearance') {
      points = objectPots.reduce((sum, ball) => sum + BALL_VALUES[ball.kind], 0);
      if (points > 0) {
        this.clearanceIndex += 1;
        if (this.clearanceIndex >= COLOR_ORDER.length) this.rulePhase = 'complete';
      }
    }

    if (points > 0) {
      this.addPoints(shooter, points);
      this.breakScore += points;
      this.emitState(`POT +${points}`);
    } else {
      this.breakScore = 0;
      if (this.rulePhase === 'color') {
        this.rulePhase = this.balls.some((ball) => ball.kind === 'red') ? 'red' : 'clearance';
        this.clearanceIndex = 0;
      }
      this.switchPlayer();
      this.emitState('GEEN POT');
    }
    return { foul: false, whitePotted: whiteWasPotted };
  }

  respotPottedColors() {
    for (const ball of this.pottedThisShot) {
      if (ball.kind === 'red') continue;
      const spot = COLOR_SPOTS[ball.kind];
      if (!spot) continue;
      const position = this.findFreeSpot(spot.x, spot.y);
      this.balls.push({ ...ball, x: position.x, y: position.y, vx: 0, vy: 0 });
    }
  }

  findFreeSpot(x, y) {
    if (this.spotIsFree(x, y)) return { x, y };
    for (const kind of [...COLOR_ORDER].reverse()) {
      const spot = COLOR_SPOTS[kind];
      if (this.spotIsFree(spot.x, spot.y)) return { ...spot };
    }
    for (let offset = BALL_RADIUS * 2; offset < 500; offset += BALL_RADIUS * 2) {
      if (this.spotIsFree(x - offset, y)) return { x: x - offset, y };
    }
    return { x, y };
  }

  spotIsFree(x, y) {
    return this.balls.every((ball) => Math.hypot(ball.x - x, ball.y - y) >= BALL_RADIUS * 2);
  }

  geometry() {
    const margin = Math.max(14, Math.min(this.width, this.height) * .025);
    const rail = Math.max(18, Math.min(this.width, this.height) * .045);
    const availableWidth = this.width - 2 * (margin + rail);
    const availableHeight = this.height - 2 * (margin + rail);
    const ratio = TABLE_LENGTH / TABLE_WIDTH;
    let width = availableWidth;
    let height = width / ratio;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * ratio;
    }
    return { x: (this.width - width) / 2, y: (this.height - height) / 2, width, height, rail, scale: width / TABLE_LENGTH };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = '#17120e';
    ctx.fillRect(0, 0, this.width, this.height);
    const g = this.geometry();

    roundedRect(ctx, g.x - g.rail, g.y - g.rail, g.width + 2 * g.rail, g.height + 2 * g.rail, g.rail * .55, '#6d3b1f');
    ctx.strokeStyle = '#a35f31';
    ctx.lineWidth = Math.max(2, g.rail * .12);
    roundedRect(ctx, g.x - g.rail * .78, g.y - g.rail * .78, g.width + 1.56 * g.rail, g.height + 1.56 * g.rail, g.rail * .45, null, true);
    ctx.fillStyle = '#176b3a';
    ctx.fillRect(g.x, g.y, g.width, g.height);

    const cushion = Math.max(5, g.rail * .3);
    ctx.fillStyle = '#0a4929';
    ctx.fillRect(g.x, g.y - cushion, g.width, cushion);
    ctx.fillRect(g.x, g.y + g.height, g.width, cushion);
    ctx.fillRect(g.x - cushion, g.y, cushion, g.height);
    ctx.fillRect(g.x + g.width, g.y, cushion, g.height);

    const pockets = [[0,0],[.5,0],[1,0],[0,1],[.5,1],[1,1]];
    for (const [px, py] of pockets) {
      ctx.beginPath();
      ctx.arc(g.x + px * g.width, g.y + py * g.height, Math.max(7, 45 * g.scale), 0, Math.PI * 2);
      ctx.fillStyle = '#030303';
      ctx.fill();
      ctx.strokeStyle = '#1b1b1b';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    const baulkX = g.x + 737 * g.scale;
    const centerY = g.y + g.height / 2;
    const dRadius = 292 * g.scale;
    ctx.strokeStyle = 'rgba(220,238,221,.7)';
    ctx.lineWidth = Math.max(1, 2 * g.scale);
    ctx.beginPath();
    ctx.moveTo(baulkX, g.y);
    ctx.lineTo(baulkX, g.y + g.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(baulkX, centerY, dRadius, Math.PI / 2, Math.PI * 1.5);
    ctx.stroke();

    if (this.mode) this.drawScore(g);
    if (this.mode && this.phase !== 'placing') this.drawEffectSelector(g);
    if (this.mode === 'school' && this.phase !== 'moving') this.drawTrainingPower(g);
    if (this.mode === 'school' && this.phase === 'idle') this.drawTrainingInstructions(g);
    for (const ball of this.balls) drawBall(ctx, g, ball);
    for (const animation of this.potAnimations) drawPotAnimation(ctx, g, animation);
    if (this.mode && (this.phase === 'idle' || this.phase === 'locked' || this.phase === 'computer' ||
        (this.phase === 'waiting' && this.mode === 'online' && this.remoteCueReceived))) this.drawCue(g);
  }

  drawCue(g) {
    const ctx = this.ctx;
    const white = this.balls.find((ball) => ball.kind === 'white');
    if (!white) return;
    const center = { x: g.x + white.x * g.scale, y: g.y + white.y * g.scale };
    const dx = Math.cos(this.aimAngle);
    const dy = Math.sin(this.aimAngle);
    const radius = Math.max(3.5, BALL_RADIUS * g.scale);
    const pull = this.power * Math.max(70, Math.min(this.width, this.height) * .16);
    const cueLocked = this.phase === 'locked' || this.phase === 'computer' ||
      (this.phase === 'waiting' && this.remoteCueLocked);

    // Fijne puntlijn vóór wit; rood zodra de richting vaststaat.
    if (this.guideVisible) {
      const startDistance = radius + 4;
      const guideDistance = rayDistanceToTableEdge(white.x, white.y, dx, dy) * g.scale;
      const startX = center.x + dx * startDistance;
      const startY = center.y + dy * startDistance;
      const endX = center.x + dx * Math.max(startDistance + 40, guideDistance - radius);
      const endY = center.y + dy * Math.max(startDistance + 40, guideDistance - radius);
      const guideGradient = ctx.createLinearGradient(startX, startY, endX, endY);
      if (cueLocked) {
        guideGradient.addColorStop(0, 'rgba(255,112,100,1)');
        guideGradient.addColorStop(.55, 'rgba(255,92,82,.72)');
        guideGradient.addColorStop(1, 'rgba(255,82,72,0)');
      } else {
        guideGradient.addColorStop(0, 'rgba(245,250,244,.82)');
        guideGradient.addColorStop(.55, 'rgba(245,250,244,.48)');
        guideGradient.addColorStop(1, 'rgba(245,250,244,0)');
      }
      ctx.save();
      ctx.setLineDash([3, 7]);
      ctx.strokeStyle = guideGradient;
      ctx.lineWidth = cueLocked ? 1.8 : 1.1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      ctx.restore();
    }

    if (this.mode === 'school' && this.guideMode === 'extra') {
      this.drawTrainingPrediction(g, white, dx, dy);
    }

    const tipDistance = radius + 5 + pull;
    const cueLength = Math.max(150, Math.min(this.width, this.height) * .34);
    const tip = { x: center.x - dx * tipDistance, y: center.y - dy * tipDistance };
    const middle = { x: tip.x - dx * cueLength * .62, y: tip.y - dy * cueLength * .62 };
    const back = { x: tip.x - dx * cueLength, y: tip.y - dy * cueLength };
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(0,0,0,.48)';
    ctx.lineWidth = 9;
    line(ctx, back.x + 3, back.y + 3, tip.x + 3, tip.y + 3);
    ctx.strokeStyle = '#c9954e';
    ctx.lineWidth = 6;
    line(ctx, middle.x, middle.y, tip.x, tip.y);
    ctx.strokeStyle = '#49301d';
    ctx.lineWidth = 7;
    line(ctx, back.x, back.y, middle.x, middle.y);
    ctx.strokeStyle = '#e8ddc7';
    ctx.lineWidth = 5;
    line(ctx, tip.x - dx * 8, tip.y - dy * 8, tip.x, tip.y);
  }

  drawTrainingPrediction(g, white, directionX, directionY) {
    const hit = firstRayBallHit(white, directionX, directionY, this.balls);
    if (!hit) return;
    const ctx = this.ctx;
    const contactX = white.x + directionX * hit.distance;
    const contactY = white.y + directionY * hit.distance;
    const normalX = (hit.ball.x - contactX) / (BALL_RADIUS * 2);
    const normalY = (hit.ball.y - contactY) / (BALL_RADIUS * 2);
    const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
    const previewPower = this.phase === 'locked' ? this.power : guide.power;
    if (previewPower < .025) return;

    // Dezelfde krachtcurve en rolweerstand als de echte stoot.
    const initialSpeed = 300 + Math.pow(previewPower, 1.35) * 5300;
    const dragPerMillimetre = -Math.log(.44);
    const impactSpeed = Math.max(0, initialSpeed - dragPerMillimetre * hit.distance);
    if (impactSpeed < 7) return;

    // Zelfde impulsverdeling als resolveBallCollision(): gelijke massa's en
    // een botsingsrestitutie van .94.
    const incomingNormal = impactSpeed * Math.max(0, directionX * normalX + directionY * normalY);
    const impulse = incomingNormal * (1 + .94) * .5;
    const objectVx = normalX * impulse;
    const objectVy = normalY * impulse;
    const whiteVx = directionX * impactSpeed - normalX * impulse
      + directionX * this.topSpin * impactSpeed * .62;
    const whiteVy = directionY * impactSpeed - normalY * impulse
      + directionY * this.topSpin * impactSpeed * .62;

    const objectPath = predictedBallPath(hit.ball.x, hit.ball.y, objectVx, objectVy);
    const whitePath = predictedBallPath(contactX, contactY, whiteVx, whiteVy, this.sideSpin);

    ctx.save();
    ctx.setLineDash([2, 7]);
    ctx.lineWidth = 1.25;
    ctx.strokeStyle = 'rgba(255, 165, 158, .8)';
    drawTablePath(ctx, g, objectPath);
    if (whitePath.length > 1) {
      ctx.strokeStyle = 'rgba(235, 249, 237, .82)';
      drawTablePath(ctx, g, whitePath);
    }
    ctx.restore();
  }

  drawScore(g) {
    const ctx = this.ctx;
    const centerX = g.x + g.width / 2;
    const firstY = g.y + g.height * .075;
    const small = Math.max(13, Math.min(20, g.height * .026));
    const large = Math.max(17, Math.min(28, g.height * .038));
    ctx.save();
    ctx.fillStyle = 'rgba(137, 203, 153, .78)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (this.mode === 'school') {
      ctx.font = `750 ${large}px system-ui, sans-serif`;
      ctx.fillText('EFFECTEN', centerX, firstY);
      ctx.restore();
      return;
    }
    ctx.font = `600 ${small}px system-ui, sans-serif`;
    const scoreText = this.mode === 'computer'
      ? `${this.statusMessage}   JIJ ${this.score}   PHONE ${this.phoneScore}   ${PHONE_LEVELS[this.phoneLevel].label}   BREAK ${this.breakScore}`
      : this.mode === 'online'
        ? `${this.statusMessage}   ${(this.online?.player1Name || 'SPELER 1').toUpperCase()} ${this.score}   ${(this.online?.player2Name || 'SPELER 2').toUpperCase()} ${this.phoneScore}   BREAK ${this.breakScore}`
        : `${this.statusMessage}   SCORE ${this.score}   BREAK ${this.breakScore}`;
    ctx.fillText(
      scoreText,
      centerX,
      firstY
    );
    ctx.font = `750 ${large}px system-ui, sans-serif`;
    ctx.fillText(this.targetText(), centerX, firstY + large * 1.25);
    ctx.restore();
  }

  drawTrainingInstructions(g) {
    const ctx = this.ctx;
    const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
    const x = g.x + g.width * .58;
    const y = g.y + g.height * .14;
    const width = g.width * .36;
    const fontSize = Math.max(12, Math.min(18, g.height * .024));
    const lineHeight = fontSize * 1.42;
    const lines = [
      `DEMO 1 · EFFECTEN · ${guide.name}`,
      'B = TOPSPIN   O = BACKSPIN   L/R = ZIJEFFECT',
      'Tik EFFECT en verschuif de zwarte stip.',
      `KRACHT PRO: ${guide.powerName}`,
      `PRO: ${guide.instruction}`,
      `DOEL: ${guide.result}`
    ];
    ctx.save();
    ctx.fillStyle = 'rgba(151, 211, 166, .82)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.font = `600 ${fontSize}px system-ui, sans-serif`;
    let lineY = y;
    for (const textLine of lines) {
      for (const part of wrapCanvasText(ctx, textLine, width)) {
        ctx.fillText(part, x, lineY);
        lineY += lineHeight;
      }
      lineY += lineHeight * .15;
    }
    ctx.restore();
  }

  drawTrainingPower(g) {
    const ctx = this.ctx;
    const guide = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
    const ringRadius = Math.max(34, Math.min(58, g.height * .105));
    const centerX = g.x + g.width * .12;
    const y = g.y + g.height * .16 + ringRadius + Math.max(12, g.height * .025);
    const halfWidth = ringRadius * .72;
    const startX = centerX - halfWidth;
    const endX = centerX + halfWidth;
    const proX = startX + (endX - startX) * guide.power;
    const actualX = startX + (endX - startX) * this.power;

    ctx.save();
    ctx.strokeStyle = 'rgba(7, 18, 10, .62)';
    ctx.lineWidth = 1;
    line(ctx, startX, y, endX, y);
    ctx.fillStyle = 'rgba(151, 211, 166, .82)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.font = `600 ${Math.max(9, Math.min(12, g.height * .017))}px system-ui, sans-serif`;
    ctx.fillText('KRACHT', centerX, y - 5);
    ctx.strokeStyle = 'rgba(174, 231, 184, .95)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(proX, y, 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(actualX, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawEffectSelector(g) {
    const ctx = this.ctx;
    const radius = Math.max(34, Math.min(58, g.height * .105));
    const center = {
      x: g.x + g.width * .12,
      y: g.y + g.height * .16
    };
    const usable = radius * .72;
    ctx.save();
    // Bleekgroen betekent: de stip is vastgenomen en volgt de vinger.
    // Zwart betekent: de gekozen pomeranspositie is losgelaten en bewaard.
    ctx.strokeStyle = this.effectSelectorOpen
      ? 'rgba(173, 232, 185, .96)'
      : 'rgba(5, 12, 8, .88)';
    ctx.lineWidth = this.effectSelectorOpen ? 2 : 1;
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(5, 12, 8, .34)';
    ctx.lineWidth = 1;
    line(ctx, center.x - usable, center.y, center.x + usable, center.y);
    line(ctx, center.x, center.y - usable, center.x, center.y + usable);
    if (this.effectSelectorOpen) {
      ctx.fillStyle = 'rgba(235, 255, 238, .88)';
      ctx.beginPath();
      ctx.arc(
        center.x + this.sideSpin * usable,
        center.y - this.topSpin * usable,
        Math.max(9, radius * .16),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    if (this.mode === 'school') {
      const pro = TRAINING_GUIDES[this.trainingScenario % TRAINING_GUIDES.length];
      ctx.strokeStyle = 'rgba(174, 231, 184, .9)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(center.x + pro.sideSpin * usable, center.y - pro.topSpin * usable, Math.max(8, radius * .15), 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = '#080808';
    ctx.beginPath();
    ctx.arc(center.x + this.sideSpin * usable, center.y - this.topSpin * usable, Math.max(5, radius * .105), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function initialBalls() {
  const centerY = TABLE_WIDTH / 2;
  const balls = [
    { x: 737, y: centerY + 292, color: '#ffd600', kind: 'yellow' },
    { x: 737, y: centerY - 292, color: '#159447', kind: 'green' },
    { x: 737, y: centerY, color: '#7b3f1d', kind: 'brown' },
    { x: TABLE_LENGTH * .5, y: centerY, color: '#1769d2', kind: 'blue' },
    { x: TABLE_LENGTH * .75, y: centerY, color: '#ff7ca8', kind: 'pink' },
    { x: TABLE_LENGTH - 324, y: centerY, color: '#111', kind: 'black' },
    { x: 737 - 292 * .48, y: centerY, color: '#f3f3e9', kind: 'white', vx: 0, vy: 0 }
  ];
  const diameter = BALL_RADIUS * 2;
  const apex = TABLE_LENGTH * .75 + diameter * 1.03;
  const dx = diameter * Math.sqrt(3) / 2 * 1.01;
  for (let column = 0; column < 5; column += 1) {
    for (let row = 0; row <= column; row += 1) {
      balls.push({ x: apex + column * dx, y: centerY + (row - column / 2) * diameter * 1.01, color: '#c71925', kind: 'red' });
    }
  }
  return balls.map((ball) => ({ vx: 0, vy: 0, ...ball }));
}

function trainingBalls(index = 0) {
  const centerY = TABLE_WIDTH / 2;
  const layouts = [
    { white: { x: 980, y: centerY }, red: { x: 1900, y: centerY } },
    { white: { x: 1020, y: centerY + 230 }, red: { x: 1950, y: centerY } },
    { white: { x: 1220, y: centerY - 280 }, red: { x: 2100, y: centerY + 90 } }
  ];
  const layout = layouts[index % layouts.length];
  return [
    { ...layout.white, color: '#f3f3e9', kind: 'white', vx: 0, vy: 0 },
    { ...layout.red, color: '#c71925', kind: 'red', vx: 0, vy: 0 }
  ];
}

function drawBall(ctx, g, ball) {
  const x = g.x + ball.x * g.scale;
  const y = g.y + ball.y * g.scale;
  const radius = Math.max(3.5, BALL_RADIUS * g.scale);
  ctx.beginPath();
  ctx.arc(x + radius * .16, y + radius * .2, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,.38)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x - radius * .32, y - radius * .32, radius * .23, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,.58)';
  ctx.fill();
}

function drawPotAnimation(ctx, g, animation) {
  const progress = Math.min(1, animation.age / .42);
  const eased = 1 - Math.pow(1 - progress, 2);
  const x = g.x + (animation.x + (animation.pocketX - animation.x) * eased) * g.scale;
  const y = g.y + (animation.y + (animation.pocketY - animation.y) * eased) * g.scale;
  const radius = Math.max(1, BALL_RADIUS * g.scale * (1 - eased * .72));
  ctx.save();
  ctx.globalAlpha = 1 - progress;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = animation.color;
  ctx.fill();
  ctx.restore();
}

function capturedPocket(ball) {
  const captureRadius = 58;
  const pockets = [
    { x: 0, y: 0 },
    { x: TABLE_LENGTH / 2, y: 0 },
    { x: TABLE_LENGTH, y: 0 },
    { x: 0, y: TABLE_WIDTH },
    { x: TABLE_LENGTH / 2, y: TABLE_WIDTH },
    { x: TABLE_LENGTH, y: TABLE_WIDTH }
  ];
  return pockets.find((pocket) => Math.hypot(ball.x - pocket.x, ball.y - pocket.y) < captureRadius);
}

function roundedRect(ctx, x, y, width, height, radius, fill, stroke = false) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) ctx.stroke();
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function normalizeAngle(angle) {
  if (angle > Math.PI) return angle - Math.PI * 2;
  if (angle < -Math.PI) return angle + Math.PI * 2;
  return angle;
}

function rayDistanceToTableEdge(x, y, dx, dy) {
  const distances = [];
  if (dx > 0) distances.push((TABLE_LENGTH - x) / dx);
  if (dx < 0) distances.push((0 - x) / dx);
  if (dy > 0) distances.push((TABLE_WIDTH - y) / dy);
  if (dy < 0) distances.push((0 - y) / dy);
  return Math.min(...distances.filter((distance) => distance > 0));
}

function resolveBallCollision(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const minimum = BALL_RADIUS * 2;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared <= 0 || distanceSquared >= minimum * minimum) return;
  const distance = Math.sqrt(distanceSquared);
  const nx = dx / distance;
  const ny = dy / distance;
  const overlap = minimum - distance;
  a.x -= nx * overlap * .5;
  a.y -= ny * overlap * .5;
  b.x += nx * overlap * .5;
  b.y += ny * overlap * .5;
  const relativeNormal = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
  if (relativeNormal <= 0) return;
  const collisionRestitution = .94;
  const impulse = relativeNormal * (1 + collisionRestitution) * .5;
  a.vx -= impulse * nx;
  a.vy -= impulse * ny;
  b.vx += impulse * nx;
  b.vy += impulse * ny;
}

function ballsOverlap(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y) < BALL_RADIUS * 2;
}

function firstRayBallHit(white, dx, dy, balls) {
  let nearest = null;
  for (const ball of balls) {
    if (ball === white) continue;
    const offsetX = ball.x - white.x;
    const offsetY = ball.y - white.y;
    const projection = offsetX * dx + offsetY * dy;
    if (projection <= 0) continue;
    const perpendicularSquared = offsetX * offsetX + offsetY * offsetY - projection * projection;
    const radius = BALL_RADIUS * 2;
    if (perpendicularSquared > radius * radius) continue;
    const distance = projection - Math.sqrt(Math.max(0, radius * radius - perpendicularSquared));
    if (distance > 0 && (!nearest || distance < nearest.distance)) nearest = { ball, distance };
  }
  return nearest;
}

function clamp(value, minimum, maximum) {
  return Math.max(minimum, Math.min(maximum, value));
}

function pointSegmentDistance(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared <= 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const t = clamp(((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared, 0, 1);
  return Math.hypot(point.x - (start.x + dx * t), point.y - (start.y + dy * t));
}

function wrapCanvasText(ctx, text, maximumWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && ctx.measureText(candidate).width > maximumWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function predictedBallPath(startX, startY, startVx, startVy, initialSideSpin = 0) {
  const points = [{ x: startX, y: startY }];
  const drag = -Math.log(.44);
  const cushionRestitution = .83;
  let x = startX;
  let y = startY;
  let vx = startVx;
  let vy = startVy;
  let sideSpin = initialSideSpin;

  for (let bounce = 0; bounce < 10; bounce += 1) {
    const speed = Math.hypot(vx, vy);
    if (speed < 7) break;
    const ux = vx / speed;
    const uy = vy / speed;
    const distances = [];
    if (ux > 0) distances.push({ distance: (TABLE_LENGTH - BALL_RADIUS - x) / ux, wall: 'right' });
    if (ux < 0) distances.push({ distance: (BALL_RADIUS - x) / ux, wall: 'left' });
    if (uy > 0) distances.push({ distance: (TABLE_WIDTH - BALL_RADIUS - y) / uy, wall: 'bottom' });
    if (uy < 0) distances.push({ distance: (BALL_RADIUS - y) / uy, wall: 'top' });
    const edge = distances.filter((item) => item.distance > .01).sort((a, b) => a.distance - b.distance)[0];
    const stopDistance = Math.max(0, (speed - 7) / drag);

    if (!edge || stopDistance <= edge.distance) {
      x += ux * stopDistance;
      y += uy * stopDistance;
      points.push({ x, y });
      break;
    }

    x += ux * edge.distance;
    y += uy * edge.distance;
    points.push({ x, y });
    const speedAtWall = Math.max(7, speed - drag * edge.distance);
    vx = ux * speedAtWall;
    vy = uy * speedAtWall;
    if (edge.wall === 'left') {
      vx = Math.abs(vx) * cushionRestitution;
      vy -= sideSpin * Math.abs(vx) * .18;
      x = BALL_RADIUS + .02;
    } else if (edge.wall === 'right') {
      vx = -Math.abs(vx) * cushionRestitution;
      vy += sideSpin * Math.abs(vx) * .18;
      x = TABLE_LENGTH - BALL_RADIUS - .02;
    } else if (edge.wall === 'top') {
      vy = Math.abs(vy) * cushionRestitution;
      vx += sideSpin * Math.abs(vy) * .18;
      y = BALL_RADIUS + .02;
    } else {
      vy = -Math.abs(vy) * cushionRestitution;
      vx -= sideSpin * Math.abs(vy) * .18;
      y = TABLE_WIDTH - BALL_RADIUS - .02;
    }
    sideSpin *= .72;
  }
  return points;
}

function drawTablePath(ctx, g, points) {
  if (points.length < 2) return;
  ctx.beginPath();
  ctx.moveTo(g.x + points[0].x * g.scale, g.y + points[0].y * g.scale);
  for (let index = 1; index < points.length; index += 1) {
    ctx.lineTo(g.x + points[index].x * g.scale, g.y + points[index].y * g.scale);
  }
  ctx.stroke();
}
