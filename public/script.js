// // Configurações do jogo
// const BOARD_SIZE = 10;
// const SHIP_DEFINITIONS = {
//     carrier: { name: 'Porta-Aviões', size: 5 },
//     battleship: { name: 'Navio de Guerra', size: 4 },
//     cruiser: { name: 'Cruzador', size: 3 },
//     submarine: { name: 'Submarino', size: 3 },
//     destroyer: { name: 'Destroyer', size: 2 }
// };

// const SHIPS_BY_COUNT = {
//     3: ['battleship', 'cruiser', 'destroyer'],
//     5: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'],
//     7: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer', 'cruiser', 'submarine']
// };

// // Estado da aplicação
// let currentUser = null;
// let ws = null;
// let currentGame = null;
// let selectedShipType = null;
// let shipOrientation = 'horizontal';
// let setupTimer = 600; // 10 minutos
// let timerInterval = null;

// // Elementos DOM
// const elements = {
//     // Telas
//     loginScreen: document.getElementById('login-screen'),
//     lobbyScreen: document.getElementById('lobby-screen'),
//     gameScreen: document.getElementById('game-screen'),
    
//     // Login
//     playerName: document.getElementById('player-name'),
//     connectBtn: document.getElementById('connect-btn'),
    
//     // Lobby
//     currentUserName: document.getElementById('current-user-name'),
//     logoutBtn: document.getElementById('logout-btn'),
//     gamesList: document.getElementById('games-list'),
//     playersList: document.getElementById('players-list'),
//     refreshPlayers: document.getElementById('refresh-players'),
//     statsContent: document.getElementById('stats-content'),
    
//     // Modais
//     newGameModal: document.getElementById('new-game-modal'),
//     invitationModal: document.getElementById('invitation-modal'),
//     opponentName: document.getElementById('opponent-name'),
//     inviterName: document.getElementById('inviter-name'),
//     shipCount: document.getElementById('ship-count'),
//     timedGame: document.getElementById('timed-game'),
//     cancelGame: document.getElementById('cancel-game'),
//     startGame: document.getElementById('start-game'),
//     rejectInvitation: document.getElementById('reject-invitation'),
//     acceptInvitation: document.getElementById('accept-invitation'),
    
//     // Jogo
//     opponentGameName: document.getElementById('opponent-game-name'),
//     gameStatus: document.getElementById('game-status'),
//     exitGame: document.getElementById('exit-game'),
//     setupPhase: document.getElementById('setup-phase'),
//     battlePhase: document.getElementById('battle-phase'),
//     gameOverPhase: document.getElementById('game-over-phase'),
//     setupBoard: document.getElementById('setup-board'),
//     playerBoard: document.getElementById('player-board'),
//     enemyBoard: document.getElementById('enemy-board'),
//     shipsToPlace: document.getElementById('ships-to-place'),
//     rotateShip: document.getElementById('rotate-ship'),
//     autoPlace: document.getElementById('auto-place'),
//     confirmPlacement: document.getElementById('confirm-placement'),
//     setupTimer: document.getElementById('setup-timer'),
//     turnIndicator: document.getElementById('turn-indicator'),
//     playerFleet: document.getElementById('player-fleet'),
//     enemyFleet: document.getElementById('enemy-fleet'),
//     gameResult: document.getElementById('game-result'),
//     backToLobby: document.getElementById('back-to-lobby')
// };

// // Inicialização
// document.addEventListener('DOMContentLoaded', () => {
//     initializeEventListeners();
//     loadUserFromStorage();
// });

// function initializeEventListeners() {
//     // Login
//     elements.connectBtn.addEventListener('click', connectToGame);
//     elements.playerName.addEventListener('keypress', (e) => {
//         if (e.key === 'Enter') connectToGame();
//     });
    
//     // Lobby
//     elements.logoutBtn.addEventListener('click', logout);
//     elements.refreshPlayers.addEventListener('click', refreshOnlineUsers);
    
//     // Tabs
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.addEventListener('click', (e) => {
//             switchTab(e.target.dataset.tab);
//         });
//     });
    
//     // Modais
//     elements.cancelGame.addEventListener('click', () => elements.newGameModal.classList.remove('active'));
//     elements.startGame.addEventListener('click', createNewGame);
//     elements.rejectInvitation.addEventListener('click', rejectInvitation);
//     elements.acceptInvitation.addEventListener('click', acceptInvitation);
    
//     // Jogo
//     elements.exitGame.addEventListener('click', exitGame);
//     elements.rotateShip.addEventListener('click', rotateShip);
//     elements.autoPlace.addEventListener('click', autoPlaceShips);
//     elements.confirmPlacement.addEventListener('click', confirmPlacement);
//     elements.backToLobby.addEventListener('click', backToLobby);
// }

// // WebSocket e Comunicação
// function connectToGame() {
//     const playerName = elements.playerName.value.trim();
//     if (!playerName) {
//         alert('Por favor, digite seu nome');
//         return;
//     }
    
//     // Gerar UUID ou usar existente
//     let userId = localStorage.getItem('battleship_user_id');
//     if (!userId) {
//         userId = generateUUID();
//         localStorage.setItem('battleship_user_id', userId);
//     }
//     localStorage.setItem('battleship_user_name', playerName);
    
//     currentUser = { id: userId, name: playerName };
    
//     // Conectar WebSocket
//     const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
//     const wsUrl = `${protocol}//${window.location.host}`;
    
//     ws = new WebSocket(wsUrl);
    
//     ws.onopen = () => {
//         console.log('Conectado ao servidor');
//         ws.send(JSON.stringify({
//             type: 'register',
//             userId: currentUser.id,
//             userName: currentUser.name
//         }));
        
//         showScreen('lobby');
//         elements.currentUserName.textContent = currentUser.name;
//         refreshOnlineUsers();
//         loadUserGames();
//     };
    
//     ws.onmessage = (event) => {
//         const message = JSON.parse(event.data);
//         handleServerMessage(message);
//     };
    
//     ws.onclose = () => {
//         console.log('Conexão fechada');
//         setTimeout(() => {
//             if (!currentUser) return;
//             connectToGame();
//         }, 3000);
//     };
    
//     ws.onerror = (error) => {
//         console.error('Erro WebSocket:', error);
//     };
// }

// function handleServerMessage(message) {
//     switch (message.type) {
//         case 'registered':
//             console.log('Registrado com sucesso');
//             break;
            
//         case 'online_users':
//             updateOnlineUsers(message.users);
//             break;
            
//         case 'invitation_received':
//             showInvitation(message.fromUser, message.gameOptions);
//             break;
            
//         case 'invitation_accepted':
//             currentGame = message.gameState;
//             showScreen('game');
//             initializeGame();
//             break;
            
//         case 'invitation_rejected':
//             alert('Seu convite foi rejeitado.');
//             break;
            
//         case 'game_created':
//             currentGame = message.gameState;
//             showScreen('game');
//             initializeGame();
//             break;
            
//         case 'game_state_updated':
//             currentGame = message.gameState;
//             updateGameDisplay();
//             break;
            
//         case 'game_started':
//             currentGame = message.gameState;
//             startBattlePhase();
//             break;
//     }
// }

// // Lobby
// function switchTab(tabName) {
//     // Atualizar botões das tabs
//     document.querySelectorAll('.tab-btn').forEach(btn => {
//         btn.classList.toggle('active', btn.dataset.tab === tabName);
//     });
    
//     // Atualizar conteúdo das tabs
//     document.querySelectorAll('.tab-content').forEach(content => {
//         content.classList.toggle('active', content.id === `${tabName}-tab`);
//     });
    
//     // Carregar conteúdo específico
//     if (tabName === 'stats') {
//         loadStatistics();
//     }
// }

// function updateOnlineUsers(users) {
//     const otherUsers = users.filter(user => user.id !== currentUser?.id);
    
//     elements.playersList.innerHTML = otherUsers.length > 0 
//         ? otherUsers.map(user => `
//             <div class="player-item">
//                 <div class="player-info">
//                     <strong>${user.name}</strong>
//                     <div class="player-ip">${user.ip}</div>
//                 </div>
//                 <div class="player-actions">
//                     <button class="btn btn-success" onclick="challengePlayer('${user.id}', '${user.name}')">
//                         Desafiar
//                     </button>
//                 </div>
//             </div>
//         `).join('')
//         : '<p>Nenhum outro jogador online</p>';
// }

// function challengePlayer(userId, userName) {
//     elements.opponentName.textContent = userName;
//     elements.newGameModal.classList.add('active');
//     // Store temporarily for game creation
//     window.challengedPlayer = { id: userId, name: userName };
// }

// function createNewGame() {
//     if (!window.challengedPlayer) return;
    
//     const gameOptions = {
//         shipCount: parseInt(elements.shipCount.value),
//         timed: elements.timedGame.checked
//     };
    
//     const gameState = {
//         player1: currentUser,
//         player2: window.challengedPlayer,
//         options: gameOptions
//     };
    
//     ws.send(JSON.stringify({
//         type: 'send_invitation',
//         fromUserId: currentUser.id,
//         toUserId: window.challengedPlayer.id,
//         gameOptions: gameOptions
//     }));
    
//     elements.newGameModal.classList.remove('active');
//     window.challengedPlayer = null;
    
//     alert('Convite enviado! Aguardando resposta...');
// }

// function showInvitation(fromUser, gameOptions) {
//     elements.inviterName.textContent = fromUser.name;
//     elements.invitationModal.classList.add('active');
//     window.pendingInvitation = { fromUser, gameOptions };
// }

// function acceptInvitation() {
//     if (!window.pendingInvitation) return;
    
//     const gameState = {
//         player1: window.pendingInvitation.fromUser,
//         player2: currentUser,
//         options: window.pendingInvitation.gameOptions
//     };
    
//     ws.send(JSON.stringify({
//         type: 'accept_invitation',
//         gameState: gameState
//     }));
    
//     elements.invitationModal.classList.remove('active');
//     window.pendingInvitation = null;
// }

// function rejectInvitation() {
//     if (!window.pendingInvitation) return;
    
//     ws.send(JSON.stringify({
//         type: 'reject_invitation',
//         fromUserId: currentUser.id,
//         toUserId: window.pendingInvitation.fromUser.id
//     }));
    
//     elements.invitationModal.classList.remove('active');
//     window.pendingInvitation = null;
// }

// // Jogo
// function initializeGame() {
//     const isPlayer1 = currentGame.player1.id === currentUser.id;
//     const opponent = isPlayer1 ? currentGame.player2 : currentGame.player1;
    
//     elements.opponentGameName.textContent = opponent.name;
    
//     if (currentGame.status === 'setup') {
//         initializeSetupPhase();
//     } else if (currentGame.status === 'playing' || currentGame.status === 'finished') {
//         startBattlePhase();
//     }
// }

// function initializeSetupPhase() {
//     elements.setupPhase.classList.remove('hidden');
//     elements.battlePhase.classList.add('hidden');
//     elements.gameOverPhase.classList.add('hidden');
    
//     initializeSetupBoard();
//     loadShipsToPlace();
//     startSetupTimer();
// }

// function initializeSetupBoard() {
//     elements.setupBoard.innerHTML = '';
    
//     for (let x = 0; x < BOARD_SIZE; x++) {
//         for (let y = 0; y < BOARD_SIZE; y++) {
//             const cell = document.createElement('div');
//             cell.className = 'cell';
//             cell.dataset.x = x;
//             cell.dataset.y = y;
            
//             cell.addEventListener('click', () => placeShip(x, y));
//             cell.addEventListener('mouseenter', () => showShipPreview(x, y));
//             cell.addEventListener('mouseleave', clearShipPreview);
            
//             elements.setupBoard.appendChild(cell);
//         }
//     }
// }

// function loadShipsToPlace() {
//     const shipTypes = SHIPS_BY_COUNT[currentGame.options.shipCount];
//     const placedShips = currentGame.player1.id === currentUser.id 
//         ? currentGame.player1.ships 
//         : currentGame.player2.ships;
    
//     const placedTypes = placedShips.map(ship => ship.type);
    
//     elements.shipsToPlace.innerHTML = shipTypes.map((shipType, index) => {
//         const isPlaced = placedTypes.includes(shipType);
//         const definition = SHIP_DEFINITIONS[shipType];
        
//         return `
//             <div class="ship-to-place ${isPlaced ? 'placed' : ''} ${selectedShipType === shipType ? 'selected' : ''}" 
//                  onclick="selectShipType('${shipType}')">
//                 <img src="ships/${shipType}.svg" alt="${definition.name}">
//                 <span>${definition.name} (${definition.size})</span>
//                 ${isPlaced ? '<span>✓</span>' : ''}
//             </div>
//         `;
//     }).join('');
    
//     // Selecionar primeiro navio não colocado
//     if (!selectedShipType) {
//         const nextShip = shipTypes.find(type => !placedTypes.includes(type));
//         if (nextShip) selectShipType(nextShip);
//     }
// }

// function selectShipType(shipType) {
//     selectedShipType = shipType;
//     loadShipsToPlace();
// }

// function rotateShip() {
//     shipOrientation = shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
//     elements.rotateShip.textContent = `Girar Navio (${shipOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'})`;
// }

// function placeShip(x, y) {
//     if (!selectedShipType) return;
    
//     const shipSize = SHIP_DEFINITIONS[selectedShipType].size;
//     const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
//     if (!canPlaceShip(player.board, x, y, shipSize, shipOrientation)) {
//         // Feedback visual para posição inválida
//         return;
//     }
    
//     // Atualizar board localmente
//     for (let i = 0; i < shipSize; i++) {
//         const posX = shipOrientation === 'horizontal' ? x : x + i;
//         const posY = shipOrientation === 'horizontal' ? y + i : y;
        
//         if (posX < BOARD_SIZE && posY < BOARD_SIZE) {
//             player.board[posX][posY] = 'ship';
//         }
//     }
    
//     // Adicionar navio à lista
//     const positions = [];
//     for (let i = 0; i < shipSize; i++) {
//         if (shipOrientation === 'horizontal') {
//             positions.push({ x, y: y + i });
//         } else {
//             positions.push({ x: x + i, y });
//         }
//     }
    
//     player.ships.push({
//         id: player.ships.length + 1,
//         type: selectedShipType,
//         length: shipSize,
//         positions: positions,
//         hits: [],
//         isSunk: false
//     });
    
//     // Atualizar display
//     initializeSetupBoard();
//     loadShipsToPlace();
    
//     // Verificar se todos os navios foram colocados
//     const allShipsPlaced = player.ships.length === SHIPS_BY_COUNT[currentGame.options.shipCount].length;
//     elements.confirmPlacement.disabled = !allShipsPlaced;
// }

// function autoPlaceShips() {
//     const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
//     const shipTypes = SHIPS_BY_COUNT[currentGame.options.shipCount];
    
//     // Limpar navios existentes
//     player.ships = [];
//     player.board = createEmptyBoard();
    
//     shipTypes.forEach((shipType, index) => {
//         const shipSize = SHIP_DEFINITIONS[shipType].size;
//         let placed = false;
//         let attempts = 0;
        
//         while (!placed && attempts < 100) {
//             const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
//             const x = Math.floor(Math.random() * BOARD_SIZE);
//             const y = Math.floor(Math.random() * BOARD_SIZE);
            
//             if (canPlaceShip(player.board, x, y, shipSize, orientation)) {
//                 // Colocar navio no board
//                 for (let i = 0; i < shipSize; i++) {
//                     const posX = orientation === 'horizontal' ? x : x + i;
//                     const posY = orientation === 'horizontal' ? y + i : y;
//                     player.board[posX][posY] = 'ship';
//                 }
                
//                 // Adicionar às posições
//                 const positions = [];
//                 for (let i = 0; i < shipSize; i++) {
//                     if (orientation === 'horizontal') {
//                         positions.push({ x, y: y + i });
//                     } else {
//                         positions.push({ x: x + i, y });
//                     }
//                 }
                
//                 player.ships.push({
//                     id: index + 1,
//                     type: shipType,
//                     length: shipSize,
//                     positions: positions,
//                     hits: [],
//                     isSunk: false
//                 });
                
//                 placed = true;
//             }
//             attempts++;
//         }
//     });
    
//     initializeSetupBoard();
//     loadShipsToPlace();
//     elements.confirmPlacement.disabled = false;
// }

// function confirmPlacement() {
//     const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
//     ws.send(JSON.stringify({
//         type: 'player_ready',
//         gameId: currentGame.id,
//         userId: currentUser.id,
//         board: player.board,
//         ships: player.ships
//     }));
    
//     clearInterval(timerInterval);
// }

// function startBattlePhase() {
//     elements.setupPhase.classList.add('hidden');
//     elements.battlePhase.classList.remove('hidden');
    
//     initializeBattleBoards();
//     updateGameDisplay();
// }

// function initializeBattleBoards() {
//     // Tabuleiro do jogador
//     elements.playerBoard.innerHTML = '';
//     const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
//     for (let x = 0; x < BOARD_SIZE; x++) {
//         for (let y = 0; y < BOARD_SIZE; y++) {
//             const cell = document.createElement('div');
//             cell.className = `cell ${player.board[x][y]}`;
//             elements.playerBoard.appendChild(cell);
//         }
//     }
    
//     // Tabuleiro inimigo
//     elements.enemyBoard.innerHTML = '';
//     const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
    
//     for (let x = 0; x < BOARD_SIZE; x++) {
//         for (let y = 0; y < BOARD_SIZE; y++) {
//             const cell = document.createElement('div');
//             cell.className = `cell ${opponent.board[x][y] === 'ship' ? 'empty' : opponent.board[x][y]}`;
//             cell.dataset.x = x;
//             cell.dataset.y = y;
            
//             if (opponent.board[x][y] === 'empty' || opponent.board[x][y] === 'ship') {
//                 cell.addEventListener('click', () => fireShot(x, y));
//             }
            
//             elements.enemyBoard.appendChild(cell);
//         }
//     }
// }

// function fireShot(x, y) {
//     if (currentGame.currentPlayerId !== currentUser.id) {
//         alert('Não é sua vez!');
//         return;
//     }
    
//     const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
//     if (opponent.board[x][y] === 'hit' || opponent.board[x][y] === 'miss' || opponent.board[x][y] === 'sunk') {
//         return; // Já atirou aqui
//     }
    
//     ws.send(JSON.stringify({
//         type: 'fire_shot',
//         gameId: currentGame.id,
//         userId: currentUser.id,
//         x: x,
//         y: y
//     }));
// }

// function updateGameDisplay() {
//     if (!currentGame) return;
    
//     elements.gameStatus.textContent = 
//         currentGame.status === 'playing' 
//             ? (currentGame.currentPlayerId === currentUser.id ? 'Sua Vez' : 'Vez do Oponente')
//             : 'Fim de Jogo';
    
//     elements.turnIndicator.textContent = 
//         currentGame.currentPlayerId === currentUser.id 
//             ? 'Sua vez de atacar!'
//             : 'Aguardando oponente...';
    
//     // Atualizar frota
//     updateFleetStatus();
    
//     if (currentGame.status === 'finished') {
//         showGameOver();
//     } else {
//         initializeBattleBoards();
//     }
// }

// function updateFleetStatus() {
//     const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
//     const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
    
//     elements.playerFleet.innerHTML = player.ships.map(ship => `
//         <div class="ship-status ${ship.isSunk ? 'sunk' : ''}">
//             <img src="ships/${ship.type}.svg" alt="${SHIP_DEFINITIONS[ship.type].name}">
//             <span>${SHIP_DEFINITIONS[ship.type].name} ${ship.isSunk ? '(Afundado)' : `(${ship.hits.length}/${ship.length})`}</span>
//         </div>
//     `).join('');
    
//     elements.enemyFleet.innerHTML = opponent.ships.map(ship => `
//         <div class="ship-status ${ship.isSunk ? 'sunk' : ''}">
//             <img src="ships/${ship.type}.svg" alt="${SHIP_DEFINITIONS[ship.type].name}">
//             <span>${SHIP_DEFINITIONS[ship.type].name} ${ship.isSunk ? '(Afundado)' : ''}</span>
//         </div>
//     `).join('');
// }

// function showGameOver() {
//     elements.battlePhase.classList.add('hidden');
//     elements.gameOverPhase.classList.remove('hidden');
    
//     const won = currentGame.winnerId === currentUser.id;
//     elements.gameResult.textContent = won ? 'Você Venceu! 🎉' : 'Você Perdeu! 💀';
//     elements.gameResult.className = won ? 'victory' : 'defeat';
// }

// // Utilitários
// function showScreen(screenName) {
//     document.querySelectorAll('.screen').forEach(screen => {
//         screen.classList.remove('active');
//     });
//     document.getElementById(`${screenName}-screen`).classList.add('active');
// }

// function loadUserFromStorage() {
//     const savedName = localStorage.getItem('battleship_user_name');
//     if (savedName) {
//         elements.playerName.value = savedName;
//     }
// }

// function refreshOnlineUsers() {
//     if (ws && ws.readyState === WebSocket.OPEN) {
//         ws.send(JSON.stringify({ type: 'get_online_users' }));
//     }
// }

// function loadUserGames() {
//     // Implementar carregamento de jogos salvos
// }

// function loadStatistics() {
//     // Implementar estatísticas
// }

// function startSetupTimer() {
//     setupTimer = 600; // 10 minutos
//     updateTimerDisplay();
    
//     timerInterval = setInterval(() => {
//         setupTimer--;
//         updateTimerDisplay();
        
//         if (setupTimer <= 0) {
//             clearInterval(timerInterval);
//             autoPlaceShips();
//             confirmPlacement();
//         }
//     }, 1000);
// }

// function updateTimerDisplay() {
//     const minutes = Math.floor(setupTimer / 60);
//     const seconds = setupTimer % 60;
//     elements.setupTimer.textContent = `Tempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
// }

// function canPlaceShip(board, x, y, shipSize, orientation) {
//     if (orientation === 'horizontal') {
//         if (y + shipSize > BOARD_SIZE) return false;
//         for (let i = 0; i < shipSize; i++) {
//             if (board[x][y + i] !== 'empty') return false;
//         }
//     } else {
//         if (x + shipSize > BOARD_SIZE) return false;
//         for (let i = 0; i < shipSize; i++) {
//             if (board[x + i][y] !== 'empty') return false;
//         }
//     }
//     return true;
// }

// function createEmptyBoard() {
//     return Array(BOARD_SIZE).fill(null).map(() => 
//         Array(BOARD_SIZE).fill('empty')
//     );
// }

// function generateUUID() {
//     return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//         const r = Math.random() * 16 | 0;
//         const v = c == 'x' ? r : (r & 0x3 | 0x8);
//         return v.toString(16);
//     });
// }

// function logout() {
//     currentUser = null;
//     localStorage.removeItem('battleship_user_id');
//     localStorage.removeItem('battleship_user_name');
    
//     if (ws) {
//         ws.close();
//     }
    
//     showScreen('login');
// }

// function exitGame() {
//     currentGame = null;
//     showScreen('lobby');
// }

// function backToLobby() {
//     currentGame = null;
//     showScreen('lobby');
// }

// // Placeholder functions para preview
// function showShipPreview(x, y) {
//     // Implementar preview visual do navio
// }

// function clearShipPreview() {
//     // Implementar limpeza do preview
// }


// Configurações do jogo
const BOARD_SIZE = 10;
const SHIP_DEFINITIONS = {
    carrier: { name: 'Porta-Aviões', size: 5 },
    battleship: { name: 'Navio de Guerra', size: 4 },
    cruiser: { name: 'Cruzador', size: 3 },
    submarine: { name: 'Submarino', size: 3 },
    destroyer: { name: 'Destroyer', size: 2 }
};

const SHIPS_BY_COUNT = {
    3: ['battleship', 'cruiser', 'destroyer'],
    5: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'],
    7: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer', 'cruiser', 'submarine']
};

// Estado da aplicação
let currentUser = null;
let ws = null;
let currentGame = null;
let selectedShipType = null;
let shipOrientation = 'horizontal';
let setupTimer = 600; // 10 minutos
let timerInterval = null;
let heartbeatInterval = null;
let currentStatus = 'available';

// Elementos DOM
const elements = {
    // Telas
    loginScreen: document.getElementById('login-screen'),
    lobbyScreen: document.getElementById('lobby-screen'),
    gameScreen: document.getElementById('game-screen'),
    
    // Login
    playerName: document.getElementById('player-name'),
    connectBtn: document.getElementById('connect-btn'),
    
    // Lobby
    currentUserName: document.getElementById('current-user-name'),
    logoutBtn: document.getElementById('logout-btn'),
    gamesList: document.getElementById('games-list'),
    playersList: document.getElementById('players-list'),
    refreshPlayers: document.getElementById('refresh-players'),
    statsContent: document.getElementById('stats-content'),
    
    // Serviço de Descoberta
    discoverySection: document.getElementById('discovery-section'),
    searchPlayers: document.getElementById('search-players'),
    searchName: document.getElementById('search-name'),
    minGames: document.getElementById('min-games'),
    playersFound: document.getElementById('players-found'),
    playerStats: document.getElementById('player-stats'),
    
    // Modais
    newGameModal: document.getElementById('new-game-modal'),
    invitationModal: document.getElementById('invitation-modal'),
    opponentName: document.getElementById('opponent-name'),
    inviterName: document.getElementById('inviter-name'),
    shipCount: document.getElementById('ship-count'),
    timedGame: document.getElementById('timed-game'),
    cancelGame: document.getElementById('cancel-game'),
    startGame: document.getElementById('start-game'),
    rejectInvitation: document.getElementById('reject-invitation'),
    acceptInvitation: document.getElementById('accept-invitation'),
    
    // Jogo
    opponentGameName: document.getElementById('opponent-game-name'),
    gameStatus: document.getElementById('game-status'),
    exitGame: document.getElementById('exit-game'),
    setupPhase: document.getElementById('setup-phase'),
    battlePhase: document.getElementById('battle-phase'),
    gameOverPhase: document.getElementById('game-over-phase'),
    setupBoard: document.getElementById('setup-board'),
    playerBoard: document.getElementById('player-board'),
    enemyBoard: document.getElementById('enemy-board'),
    shipsToPlace: document.getElementById('ships-to-place'),
    rotateShip: document.getElementById('rotate-ship'),
    autoPlace: document.getElementById('auto-place'),
    confirmPlacement: document.getElementById('confirm-placement'),
    setupTimer: document.getElementById('setup-timer'),
    turnIndicator: document.getElementById('turn-indicator'),
    playerFleet: document.getElementById('player-fleet'),
    enemyFleet: document.getElementById('enemy-fleet'),
    gameResult: document.getElementById('game-result'),
    backToLobby: document.getElementById('back-to-lobby')
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadUserFromStorage();
});

function initializeEventListeners() {
    // Login
    elements.connectBtn.addEventListener('click', connectToGame);
    elements.playerName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') connectToGame();
    });
    
    // Lobby
    elements.logoutBtn.addEventListener('click', logout);
    elements.refreshPlayers.addEventListener('click', refreshOnlineUsers);
    
    // Serviço de Descoberta
    elements.searchPlayers.addEventListener('click', searchOnlinePlayers);
    elements.searchName.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchOnlinePlayers();
    });
    
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.dataset.tab);
        });
    });
    
    // Modais
    elements.cancelGame.addEventListener('click', () => elements.newGameModal.classList.remove('active'));
    elements.startGame.addEventListener('click', createNewGame);
    elements.rejectInvitation.addEventListener('click', rejectInvitation);
    elements.acceptInvitation.addEventListener('click', acceptInvitation);
    
    // Jogo
    elements.exitGame.addEventListener('click', exitGame);
    elements.rotateShip.addEventListener('click', rotateShip);
    elements.autoPlace.addEventListener('click', autoPlaceShips);
    elements.confirmPlacement.addEventListener('click', confirmPlacement);
    elements.backToLobby.addEventListener('click', backToLobby);
}

// WebSocket e Comunicação
function connectToGame() {
    const playerName = elements.playerName.value.trim();
    if (!playerName) {
        alert('Por favor, digite seu nome');
        return;
    }
    
    // Gerar UUID ou usar existente
    let userId = localStorage.getItem('battleship_user_id');
    if (!userId) {
        userId = generateUUID();
        localStorage.setItem('battleship_user_id', userId);
    }
    localStorage.setItem('battleship_user_name', playerName);
    
    currentUser = { id: userId, name: playerName };
    
    // Conectar WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
        console.log('Conectado ao servidor');
        ws.send(JSON.stringify({
            type: 'register',
            userName: currentUser.name
        }));
        
        // Iniciar heartbeat
        startHeartbeat();
        
        showScreen('lobby');
        elements.currentUserName.textContent = currentUser.name;
        refreshOnlineUsers();
        loadUserStats();
    };
    
    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
    };
    
    ws.onclose = () => {
        console.log('Conexão fechada');
        stopHeartbeat();
        setTimeout(() => {
            if (!currentUser) return;
            connectToGame();
        }, 3000);
    };
    
    ws.onerror = (error) => {
        console.error('Erro WebSocket:', error);
    };
}

// Serviço de Descoberta - Heartbeat
function startHeartbeat() {
    // Enviar heartbeat a cada 15 segundos
    heartbeatInterval = setInterval(() => {
        if (ws && ws.readyState === WebSocket.OPEN && currentUser) {
            ws.send(JSON.stringify({
                type: 'heartbeat',
                userId: currentUser.id,
                status: currentStatus,
                gameId: currentGame ? currentGame.id : null
            }));
        }
    }, 15000);
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function updateUserStatus(status, gameId = null) {
    currentStatus = status;
    if (ws && ws.readyState === WebSocket.OPEN && currentUser) {
        ws.send(JSON.stringify({
            type: 'update_status',
            userId: currentUser.id,
            status: status,
            gameId: gameId
        }));
    }
}

function handleServerMessage(message) {
    switch (message.type) {
        case 'registered':
            currentUser = message.user;
            localStorage.setItem('battleship_user_id', currentUser.id);
            console.log('Registrado com sucesso:', currentUser);
            break;
            
        case 'online_users':
            updateOnlineUsers(message.users);
            break;
            
        case 'players_found':
            displayFoundPlayers(message.players, message.total);
            break;
            
        case 'player_stats':
            displayPlayerStats(message.userId, message.stats);
            break;
            
        case 'heartbeat_ack':
            console.log('Heartbeat confirmado:', message.timestamp);
            break;
            
        case 'status_updated':
            console.log('Status atualizado:', message.status);
            break;
            
        case 'invitation_received':
            showInvitation(message.fromUser, message.gameOptions);
            break;
            
        case 'invitation_accepted':
            currentGame = message.gameState;
            updateUserStatus('in_game', currentGame.id);
            showScreen('game');
            initializeGame();
            break;
            
        case 'invitation_rejected':
            updateUserStatus('available');
            alert('Seu convite foi rejeitado.');
            break;
            
        case 'game_created':
            currentGame = message.gameState;
            updateUserStatus('in_game', currentGame.id);
            showScreen('game');
            initializeGame();
            break;
            
        case 'game_state_updated':
            currentGame = message.gameState;
            updateGameDisplay();
            break;
            
        case 'game_started':
            currentGame = message.gameState;
            startBattlePhase();
            break;
    }
}

// Lobby e Descoberta
function switchTab(tabName) {
    // Atualizar botões das tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Atualizar conteúdo das tabs
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    // Carregar conteúdo específico
    if (tabName === 'discovery') {
        searchOnlinePlayers();
    } else if (tabName === 'stats') {
        loadUserStats();
    }
}

function updateOnlineUsers(users) {
    const otherUsers = users.filter(user => user.id !== currentUser?.id && user.status === 'available');
    
    elements.playersList.innerHTML = otherUsers.length > 0 
        ? otherUsers.map(user => `
            <div class="player-item">
                <div class="player-info">
                    <strong>${user.name}</strong>
                    <div class="player-stats">
                        <small>Jogos: ${user.stats?.totalGames || 0} | Vitórias: ${user.stats?.wins || 0}</small>
                    </div>
                    <div class="player-ip">${user.ip}</div>
                </div>
                <div class="player-actions">
                    <button class="btn btn-success" onclick="challengePlayer('${user.id}', '${user.name}')">
                        Desafiar
                    </button>
                    <button class="btn btn-info" onclick="viewPlayerStats('${user.id}')">
                        Estatísticas
                    </button>
                </div>
            </div>
        `).join('')
        : '<p>Nenhum outro jogador disponível</p>';
}

function searchOnlinePlayers() {
    if (!ws || ws.readyState !== WebSocket.OPEN || !currentUser) return;
    
    const filters = {};
    
    if (elements.searchName.value.trim()) {
        filters.searchName = elements.searchName.value.trim();
    }
    
    if (elements.minGames.value) {
        filters.minGames = parseInt(elements.minGames.value);
    }
    
    ws.send(JSON.stringify({
        type: 'search_players',
        userId: currentUser.id,
        filters: filters
    }));
}

function displayFoundPlayers(players, total) {
    elements.playersFound.innerHTML = players.length > 0 
        ? `
            <div class="search-results-header">
                <h4>${total} jogador(es) encontrado(s)</h4>
            </div>
            ${players.map(player => `
                <div class="player-item">
                    <div class="player-info">
                        <strong>${player.name}</strong>
                        <div class="player-stats">
                            <small>
                                Jogos: ${player.stats.totalGames} | 
                                Vitórias: ${player.stats.wins} | 
                                Taxa: ${player.stats.winRate}%
                            </small>
                        </div>
                        <div class="player-status ${player.status}">
                            ${getStatusText(player.status)}
                        </div>
                    </div>
                    <div class="player-actions">
                        ${player.status === 'available' ? `
                            <button class="btn btn-success" onclick="challengePlayer('${player.id}', '${player.name}')">
                                Desafiar
                            </button>
                        ` : ''}
                        <button class="btn btn-info" onclick="viewPlayerStats('${player.id}')">
                            Detalhes
                        </button>
                    </div>
                </div>
            `).join('')}
        `
        : '<p>Nenhum jogador encontrado com os filtros aplicados</p>';
}

function getStatusText(status) {
    const statusMap = {
        'available': 'Disponível',
        'busy': 'Ocupado',
        'in_game': 'Em Jogo'
    };
    return statusMap[status] || status;
}

function viewPlayerStats(userId) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'get_player_stats',
            userId: userId
        }));
    }
}

function displayPlayerStats(userId, stats) {
    elements.playerStats.innerHTML = `
        <div class="stats-modal">
            <h4>Estatísticas do Jogador</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-label">Total de Jogos:</span>
                    <span class="stat-value">${stats.totalGames}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Vitórias:</span>
                    <span class="stat-value">${stats.wins}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Derrotas:</span>
                    <span class="stat-value">${stats.losses}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Taxa de Vitórias:</span>
                    <span class="stat-value">${stats.winRate}%</span>
                </div>
            </div>
            <button class="btn btn-primary" onclick="closeStatsModal()">Fechar</button>
        </div>
    `;
    elements.playerStats.classList.add('active');
}

function closeStatsModal() {
    elements.playerStats.classList.remove('active');
}

function challengePlayer(userId, userName) {
    elements.opponentName.textContent = userName;
    elements.newGameModal.classList.add('active');
    // Store temporarily for game creation
    window.challengedPlayer = { id: userId, name: userName };
}

function createNewGame() {
    if (!window.challengedPlayer) return;
    
    const gameOptions = {
        shipCount: parseInt(elements.shipCount.value),
        timed: elements.timedGame.checked
    };
    
    // Atualizar status para "ocupado"
    updateUserStatus('busy');
    
    ws.send(JSON.stringify({
        type: 'send_invitation',
        fromUserId: currentUser.id,
        toUserId: window.challengedPlayer.id,
        gameOptions: gameOptions
    }));
    
    elements.newGameModal.classList.remove('active');
    window.challengedPlayer = null;
    
    alert('Convite enviado! Aguardando resposta...');
}

function showInvitation(fromUser, gameOptions) {
    elements.inviterName.textContent = fromUser.name;
    elements.invitationModal.classList.add('active');
    window.pendingInvitation = { fromUser, gameOptions };
    
    // Mostrar estatísticas do convidante se disponíveis
    if (fromUser.stats) {
        elements.inviterName.innerHTML = `
            ${fromUser.name}
            <small style="display: block; font-weight: normal;">
                Jogos: ${fromUser.stats.totalGames} | Vitórias: ${fromUser.stats.wins} (${fromUser.stats.winRate}%)
            </small>
        `;
    }
}

function acceptInvitation() {
    if (!window.pendingInvitation) return;
    
    const gameState = {
        player1: window.pendingInvitation.fromUser,
        player2: currentUser,
        options: window.pendingInvitation.gameOptions
    };
    
    // Atualizar status para "em jogo"
    updateUserStatus('in_game');
    
    ws.send(JSON.stringify({
        type: 'accept_invitation',
        gameState: gameState
    }));
    
    elements.invitationModal.classList.remove('active');
    window.pendingInvitation = null;
}

function rejectInvitation() {
    if (!window.pendingInvitation) return;
    
    ws.send(JSON.stringify({
        type: 'reject_invitation',
        fromUserId: window.pendingInvitation.fromUser.id,
        toUserId: currentUser.id
    }));
    
    elements.invitationModal.classList.remove('active');
    window.pendingInvitation = null;
}

// Jogo
function initializeGame() {
    const isPlayer1 = currentGame.player1.id === currentUser.id;
    const opponent = isPlayer1 ? currentGame.player2 : currentGame.player1;
    
    elements.opponentGameName.textContent = opponent.name;
    
    if (currentGame.status === 'setup') {
        initializeSetupPhase();
    } else if (currentGame.status === 'playing' || currentGame.status === 'finished') {
        startBattlePhase();
    }
}

function initializeSetupPhase() {
    elements.setupPhase.classList.remove('hidden');
    elements.battlePhase.classList.add('hidden');
    elements.gameOverPhase.classList.add('hidden');
    
    initializeSetupBoard();
    loadShipsToPlace();
    startSetupTimer();
}

function initializeSetupBoard() {
    elements.setupBoard.innerHTML = '';
    
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            cell.addEventListener('click', () => placeShip(x, y));
            cell.addEventListener('mouseenter', () => showShipPreview(x, y));
            cell.addEventListener('mouseleave', clearShipPreview);
            
            elements.setupBoard.appendChild(cell);
        }
    }
}

function loadShipsToPlace() {
    const shipTypes = SHIPS_BY_COUNT[currentGame.options.shipCount];
    const placedShips = currentGame.player1.id === currentUser.id 
        ? currentGame.player1.ships 
        : currentGame.player2.ships;
    
    const placedTypes = placedShips.map(ship => ship.type);
    
    elements.shipsToPlace.innerHTML = shipTypes.map((shipType, index) => {
        const isPlaced = placedTypes.includes(shipType);
        const definition = SHIP_DEFINITIONS[shipType];
        
        return `
            <div class="ship-to-place ${isPlaced ? 'placed' : ''} ${selectedShipType === shipType ? 'selected' : ''}" 
                 onclick="selectShipType('${shipType}')">
                <img src="ships/${shipType}.svg" alt="${definition.name}">
                <span>${definition.name} (${definition.size})</span>
                ${isPlaced ? '<span>✓</span>' : ''}
            </div>
        `;
    }).join('');
    
    // Selecionar primeiro navio não colocado
    if (!selectedShipType) {
        const nextShip = shipTypes.find(type => !placedTypes.includes(type));
        if (nextShip) selectShipType(nextShip);
    }
}

function selectShipType(shipType) {
    selectedShipType = shipType;
    loadShipsToPlace();
}

function rotateShip() {
    shipOrientation = shipOrientation === 'horizontal' ? 'vertical' : 'horizontal';
    elements.rotateShip.textContent = `Girar Navio (${shipOrientation === 'horizontal' ? 'Horizontal' : 'Vertical'})`;
}

function placeShip(x, y) {
    if (!selectedShipType) return;
    
    const shipSize = SHIP_DEFINITIONS[selectedShipType].size;
    const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
    if (!canPlaceShip(player.board, x, y, shipSize, shipOrientation)) {
        // Feedback visual para posição inválida
        return;
    }
    
    // Atualizar board localmente
    for (let i = 0; i < shipSize; i++) {
        const posX = shipOrientation === 'horizontal' ? x : x + i;
        const posY = shipOrientation === 'horizontal' ? y + i : y;
        
        if (posX < BOARD_SIZE && posY < BOARD_SIZE) {
            player.board[posX][posY] = 'ship';
        }
    }
    
    // Adicionar navio à lista
    const positions = [];
    for (let i = 0; i < shipSize; i++) {
        if (shipOrientation === 'horizontal') {
            positions.push({ x, y: y + i });
        } else {
            positions.push({ x: x + i, y });
        }
    }
    
    player.ships.push({
        id: player.ships.length + 1,
        type: selectedShipType,
        length: shipSize,
        positions: positions,
        hits: [],
        isSunk: false
    });
    
    // Atualizar display
    initializeSetupBoard();
    loadShipsToPlace();
    
    // Verificar se todos os navios foram colocados
    const allShipsPlaced = player.ships.length === SHIPS_BY_COUNT[currentGame.options.shipCount].length;
    elements.confirmPlacement.disabled = !allShipsPlaced;
}

function autoPlaceShips() {
    const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    const shipTypes = SHIPS_BY_COUNT[currentGame.options.shipCount];
    
    // Limpar navios existentes
    player.ships = [];
    player.board = createEmptyBoard();
    
    shipTypes.forEach((shipType, index) => {
        const shipSize = SHIP_DEFINITIONS[shipType].size;
        let placed = false;
        let attempts = 0;
        
        while (!placed && attempts < 100) {
            const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
            const x = Math.floor(Math.random() * BOARD_SIZE);
            const y = Math.floor(Math.random() * BOARD_SIZE);
            
            if (canPlaceShip(player.board, x, y, shipSize, orientation)) {
                // Colocar navio no board
                for (let i = 0; i < shipSize; i++) {
                    const posX = orientation === 'horizontal' ? x : x + i;
                    const posY = orientation === 'horizontal' ? y + i : y;
                    player.board[posX][posY] = 'ship';
                }
                
                // Adicionar às posições
                const positions = [];
                for (let i = 0; i < shipSize; i++) {
                    if (orientation === 'horizontal') {
                        positions.push({ x, y: y + i });
                    } else {
                        positions.push({ x: x + i, y });
                    }
                }
                
                player.ships.push({
                    id: index + 1,
                    type: shipType,
                    length: shipSize,
                    positions: positions,
                    hits: [],
                    isSunk: false
                });
                
                placed = true;
            }
            attempts++;
        }
    });
    
    initializeSetupBoard();
    loadShipsToPlace();
    elements.confirmPlacement.disabled = false;
}

function confirmPlacement() {
    const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
    ws.send(JSON.stringify({
        type: 'player_ready',
        gameId: currentGame.id,
        userId: currentUser.id,
        board: player.board,
        ships: player.ships
    }));
    
    clearInterval(timerInterval);
}

function startBattlePhase() {
    elements.setupPhase.classList.add('hidden');
    elements.battlePhase.classList.remove('hidden');
    
    initializeBattleBoards();
    updateGameDisplay();
}

function initializeBattleBoards() {
    // Tabuleiro do jogador
    elements.playerBoard.innerHTML = '';
    const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            const cell = document.createElement('div');
            cell.className = `cell ${player.board[x][y]}`;
            elements.playerBoard.appendChild(cell);
        }
    }
    
    // Tabuleiro inimigo
    elements.enemyBoard.innerHTML = '';
    const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
    
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            const cell = document.createElement('div');
            cell.className = `cell ${opponent.board[x][y] === 'ship' ? 'empty' : opponent.board[x][y]}`;
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            if (opponent.board[x][y] === 'empty' || opponent.board[x][y] === 'ship') {
                cell.addEventListener('click', () => fireShot(x, y));
            }
            
            elements.enemyBoard.appendChild(cell);
        }
    }
}

function fireShot(x, y) {
    if (currentGame.currentPlayerId !== currentUser.id) {
        alert('Não é sua vez!');
        return;
    }
    
    const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
    if (opponent.board[x][y] === 'hit' || opponent.board[x][y] === 'miss' || opponent.board[x][y] === 'sunk') {
        return; // Já atirou aqui
    }
    
    ws.send(JSON.stringify({
        type: 'fire_shot',
        gameId: currentGame.id,
        userId: currentUser.id,
        x: x,
        y: y
    }));
}

function updateGameDisplay() {
    if (!currentGame) return;
    
    elements.gameStatus.textContent = 
        currentGame.status === 'playing' 
            ? (currentGame.currentPlayerId === currentUser.id ? 'Sua Vez' : 'Vez do Oponente')
            : 'Fim de Jogo';
    
    elements.turnIndicator.textContent = 
        currentGame.currentPlayerId === currentUser.id 
            ? 'Sua vez de atacar!'
            : 'Aguardando oponente...';
    
    // Atualizar frota
    updateFleetStatus();
    
    if (currentGame.status === 'finished') {
        showGameOver();
    } else {
        initializeBattleBoards();
    }
}

function updateFleetStatus() {
    const player = currentGame.player1.id === currentUser.id ? currentGame.player1 : currentGame.player2;
    const opponent = currentGame.player1.id === currentUser.id ? currentGame.player2 : currentGame.player1;
    
    elements.playerFleet.innerHTML = player.ships.map(ship => `
        <div class="ship-status ${ship.isSunk ? 'sunk' : ''}">
            <img src="ships/${ship.type}.svg" alt="${SHIP_DEFINITIONS[ship.type].name}">
            <span>${SHIP_DEFINITIONS[ship.type].name} ${ship.isSunk ? '(Afundado)' : `(${ship.hits.length}/${ship.length})`}</span>
        </div>
    `).join('');
    
    elements.enemyFleet.innerHTML = opponent.ships.map(ship => `
        <div class="ship-status ${ship.isSunk ? 'sunk' : ''}">
            <img src="ships/${ship.type}.svg" alt="${SHIP_DEFINITIONS[ship.type].name}">
            <span>${SHIP_DEFINITIONS[ship.type].name} ${ship.isSunk ? '(Afundado)' : ''}</span>
        </div>
    `).join('');
}

function showGameOver() {
    elements.battlePhase.classList.add('hidden');
    elements.gameOverPhase.classList.remove('hidden');
    
    const won = currentGame.winnerId === currentUser.id;
    elements.gameResult.textContent = won ? 'Você Venceu! 🎉' : 'Você Perdeu! 💀';
    elements.gameResult.className = won ? 'victory' : 'defeat';
}

// Utilitários
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(`${screenName}-screen`).classList.add('active');
}

function loadUserFromStorage() {
    const savedName = localStorage.getItem('battleship_user_name');
    if (savedName) {
        elements.playerName.value = savedName;
    }
}

function refreshOnlineUsers() {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'get_online_users' }));
    }
}

function loadUserStats() {
    if (currentUser && ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            type: 'get_player_stats',
            userId: currentUser.id
        }));
    }
}

function startSetupTimer() {
    setupTimer = 600; // 10 minutos
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        setupTimer--;
        updateTimerDisplay();
        
        if (setupTimer <= 0) {
            clearInterval(timerInterval);
            autoPlaceShips();
            confirmPlacement();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(setupTimer / 60);
    const seconds = setupTimer % 60;
    elements.setupTimer.textContent = `Tempo: ${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function canPlaceShip(board, x, y, shipSize, orientation) {
    if (orientation === 'horizontal') {
        if (y + shipSize > BOARD_SIZE) return false;
        for (let i = 0; i < shipSize; i++) {
            if (board[x][y + i] !== 'empty') return false;
        }
    } else {
        if (x + shipSize > BOARD_SIZE) return false;
        for (let i = 0; i < shipSize; i++) {
            if (board[x + i][y] !== 'empty') return false;
        }
    }
    return true;
}

function createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => 
        Array(BOARD_SIZE).fill('empty')
    );
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function logout() {
    currentUser = null;
    localStorage.removeItem('battleship_user_id');
    localStorage.removeItem('battleship_user_name');
    
    stopHeartbeat();
    
    if (ws) {
        ws.close();
    }
    
    showScreen('login');
}

function exitGame() {
    if (currentGame) {
        updateUserStatus('available');
    }
    currentGame = null;
    showScreen('lobby');
}

function backToLobby() {
    if (currentGame) {
        updateUserStatus('available');
    }
    currentGame = null;
    showScreen('lobby');
}

// Placeholder functions para preview
function showShipPreview(x, y) {
    // Implementar preview visual do navio
}

function clearShipPreview() {
    // Implementar limpeza do preview
}