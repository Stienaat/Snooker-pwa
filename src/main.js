import { SnookerTable } from './table.js?v=29';
import { OnlineLobby } from './online.js?v=29';

const canvas = document.querySelector('#table');
const startMenu = document.querySelector('#start-menu');
const levelMenu = document.querySelector('#level-menu');
const onlineMenu = document.querySelector('#online-menu');
const gameUi = document.querySelector('#game-ui');
const readme = document.querySelector('#readme');
const bottomMenu = document.querySelector('.bottom-menu');
const guideButton = document.querySelector('[data-action="guide"]');
const status = document.querySelector('#status');
const target = document.querySelector('#target');
const effectButton = document.querySelector('[data-action="effect"]');
const newTrainingButton = document.querySelector('[data-action="new-training"]');
const onlineStatus = document.querySelector('#online-status');
const onlineMessage = document.querySelector('#e-online-message');
const roomInfo = document.querySelector('#room-info');
const activeRoomCode = document.querySelector('#active-room-code');
const opponentName = document.querySelector('#opponent-name');
const playerNameInput = document.querySelector('#player-name');
const roomCodeInput = document.querySelector('#room-code');

playerNameInput.value = localStorage.getItem('snooker-player-name') || '';

const lobby = new OnlineLobby({
  status: (text) => { onlineStatus.textContent = text; },
  message: (text) => { onlineMessage.textContent = text; },
  onRoom: ({ code, opponent }) => {
    roomInfo.hidden = false;
    activeRoomCode.textContent = code;
    opponentName.textContent = opponent ? `TEGEN ${opponent.toUpperCase()}` : 'WACHT OP SPELER 2';
    roomCodeInput.value = code;
  },
  onLeave: () => {
    onlineStatus.textContent = 'OFFLINE';
    onlineMessage.textContent = '';
    roomInfo.hidden = true;
  },
  onReady: ({ seat, turnSeat, player1Name, player2Name }) => {
    table.startOnline({
      seat,
      turnSeat,
      player1Name,
      player2Name,
      onPlacement: (position) => lobby.sendPlacement(position),
      onCue: (cue) => lobby.sendCue(cue),
      onShot: (shot) => lobby.sendShot(shot),
      onFrame: (frame) => lobby.sendFrame(frame),
      onSettled: (state) => lobby.sendState(state)
    });
    guideButton.textContent = 'HULP AAN';
    newTrainingButton.hidden = true;
    bottomMenu.classList.remove('school');
    startMenu.hidden = true;
    levelMenu.hidden = true;
    onlineMenu.hidden = true;
    gameUi.hidden = false;
  },
  onGameEvent: (event) => {
    if (event.type === 'PLACE_WHITE') table.receiveOnlinePlacement(event.position);
    if (event.type === 'CUE_STATE') table.receiveOnlineCue(event.cue);
    if (event.type === 'GAME_SHOT') table.receiveOnlineShot(event.shot);
    if (event.type === 'PHYSICS_FRAME') table.receiveOnlineFrame(event.frame);
    if (event.type === 'GAME_STATE') table.applyOnlineState(event.state);
    if (event.type === 'GAME_RESET') table.reset();
    if (event.type === 'OPPONENT_LEFT') table.setOnlineDisconnected();
    if (event.type === 'ROOM_RESUMED') table.resumeOnline(event.turnSeat);
  }
});

// De tafel is een speloppervlak. Browsermenu's, tekstselectie en native
// sleepacties mogen een keubeweging of lange vingeraanraking niet onderbreken.
const suppressBrowserGesture = (event) => event.preventDefault();
canvas.addEventListener('contextmenu', suppressBrowserGesture);
canvas.addEventListener('dragstart', suppressBrowserGesture);
canvas.addEventListener('selectstart', suppressBrowserGesture);
canvas.addEventListener('gesturestart', suppressBrowserGesture, { passive: false });
gameUi.addEventListener('contextmenu', suppressBrowserGesture);
const table = new SnookerTable(canvas, ({ phase, effectSelectorOpen, score, phoneScore, breakScore, message, target: targetText }) => {
  bottomMenu.hidden = phase === 'placing' || phase === 'locked' || phase === 'moving' || phase === 'computer' || phase === 'waiting';
  effectButton.textContent = effectSelectorOpen ? 'EFFECT LOSLATEN' : 'EFFECT';
  if (message) status.textContent = `${message} · JIJ ${score ?? 0} · PHONE ${phoneScore ?? 0} · BREAK ${breakScore ?? 0}`;
  if (targetText) target.textContent = targetText;
});

function showReadme() { readme.hidden = false; }
function hideReadme() { readme.hidden = true; }

function startGame(mode, level = null) {
  table.start(mode, level);
  guideButton.textContent = mode === 'school' ? 'HULP EXTRA' : 'HULP AAN';
  newTrainingButton.hidden = mode !== 'school';
  bottomMenu.classList.toggle('school', mode === 'school');
  startMenu.hidden = true;
  levelMenu.hidden = true;
  onlineMenu.hidden = true;
  gameUi.hidden = false;
}

function exitGame() {
  if (table.mode === 'online') lobby.leave();
  table.showEmptyTable();
  gameUi.hidden = true;
  startMenu.hidden = false;
  levelMenu.hidden = true;
  onlineMenu.hidden = true;
  hideReadme();
}

document.addEventListener('click', (event) => {
  const control = event.target.closest('[data-mode], [data-level], [data-action]');
  if (!control) return;
  const { mode, level, action } = control.dataset;
  if (mode === 'computer' && !control.disabled) {
    startMenu.hidden = true;
    levelMenu.hidden = false;
  } else if (mode === 'online' && !control.disabled) {
    startMenu.hidden = true;
    onlineMenu.hidden = false;
    onlineMessage.textContent = 'MAAK EEN KAMER OF VOER EEN CODE IN';
  } else if (mode && !control.disabled) {
    startGame(mode);
  }
  if (level) startGame('computer', level);
  if (action === 'back-start') {
    levelMenu.hidden = true;
    startMenu.hidden = false;
  }
  if (action === 'create-room') {
    const name = playerNameInput.value;
    localStorage.setItem('snooker-player-name', name.trim());
    lobby.create(name).catch((error) => { onlineMessage.textContent = error.message; });
  }
  if (action === 'join-room') {
    const name = playerNameInput.value;
    localStorage.setItem('snooker-player-name', name.trim());
    lobby.join(name, roomCodeInput.value).catch((error) => { onlineMessage.textContent = error.message; });
  }
  if (action === 'leave-online') {
    lobby.leave();
    onlineMenu.hidden = true;
    startMenu.hidden = false;
  }
  if (action === 'copy-room' && activeRoomCode.textContent !== '------') {
    navigator.clipboard?.writeText(activeRoomCode.textContent)
      .then(() => { onlineMessage.textContent = 'KAMERCODE GEKOPIEERD'; })
      .catch(() => { onlineMessage.textContent = `KAMERCODE: ${activeRoomCode.textContent}`; });
  }
  if (action === 'readme' || action === 'game-readme') showReadme();
  if (action === 'close-readme') hideReadme();
  if (action === 'effect') table.toggleEffectSelector();
  if (action === 'guide') {
    const guide = table.toggleGuide();
    guideButton.textContent = guide === 'extra'
      ? 'HULP EXTRA'
      : guide === 'normal' || guide === true ? 'HULP NORMAAL' : 'HULP UIT';
  }
  if (action === 'reset') {
    if (table.mode === 'online' && table.phase === 'disconnected') return;
    if (table.mode === 'online') lobby.sendReset();
    table.reset();
    guideButton.textContent = table.mode === 'school' ? 'HULP EXTRA' : 'HULP AAN';
  }
  if (action === 'new-training') {
    table.newTrainingScenario();
    guideButton.textContent = 'HULP EXTRA';
  }
  if (action === 'exit') exitGame();
});

window.addEventListener('resize', () => table.resize());
window.addEventListener('orientationchange', () => table.resize());
roomCodeInput.addEventListener('input', () => {
  roomCodeInput.value = roomCodeInput.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
});

table.showEmptyTable();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js?v=29'));
}
