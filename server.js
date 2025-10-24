// import express from 'express';
// import { WebSocketServer } from 'ws';
// import { createServer } from 'http';
// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import { v4 as uuidv4 } from 'uuid';
// import os from 'os';

// const __dirname = dirname(fileURLToPath(import.meta.url));
// const app = express();
// const server = createServer(app);
// const wss = new WebSocketServer({ server });

// // Servir arquivos estáticos
// app.use(express.static(join(__dirname, 'public')));

// // Dados do jogo
// const users = new Map();
// const games = new Map();
// const userConnections = new Map();

// // Configurações do jogo
// const BOARD_SIZE = 10;
// const SHIP_DEFINITIONS = {
//   carrier: { name: 'Porta-Aviões', size: 5 },
//   battleship: { name: 'Navio de Guerra', size: 4 },
//   cruiser: { name: 'Cruzador', size: 3 },
//   submarine: { name: 'Submarino', size: 3 },
//   destroyer: { name: 'Destroyer', size: 2 }
// };

// const SHIPS_BY_COUNT = {
//   3: ['battleship', 'cruiser', 'destroyer'],
//   5: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer'],
//   7: ['carrier', 'battleship', 'cruiser', 'submarine', 'destroyer', 'cruiser', 'submarine']
// };

// // Função para obter IPs da rede local
// function getLocalIPs() {
//   const allInterfaces = os.networkInterfaces();
//   const localIPs = [];
  
//   Object.keys(allInterfaces).forEach(interfaceName => {
//     allInterfaces[interfaceName].forEach(oneInterface => {
//       // IPv4 e não é loopback
//       if (oneInterface.family === 'IPv4' && !oneInterface.internal) {
//         localIPs.push({
//           oneInterface: interfaceName,
//           address: oneInterface.address,
//           family: oneInterface.family
//         });
//       }
//     });
//   });
  
//   return localIPs;
// }

// // Função para obter o IP do cliente a partir do WebSocket
// function getClientIP(ws) {
//   // Tenta obter o IP real do cliente
//   const socket = ws._socket;
//   const headers = ws.upgradeReq?.headers;
  
//   // Verifica se há header X-Forwarded-For (caso esteja atrás de proxy)
//   const forwardedFor = headers?.['x-forwarded-for'];
//   if (forwardedFor) {
//     return forwardedFor.split(',')[0].trim();
//   }
  
//   // Verifica se há header X-Real-IP
//   const realIP = headers?.['x-real-ip'];
//   if (realIP) {
//     return realIP;
//   }
  
//   // Usa o endereço remoto do socket como fallback
//   return socket.remoteAddress;
// }

// // Utilitários
// function createEmptyBoard() {
//   return Array(BOARD_SIZE).fill(null).map(() => 
//     Array(BOARD_SIZE).fill('empty')
//   );
// }

// function canPlaceShip(board, x, y, shipSize, orientation) {
//   if (orientation === 'horizontal') {
//     if (y + shipSize > BOARD_SIZE) return false;
//     for (let i = 0; i < shipSize; i++) {
//       if (board[x][y + i] !== 'empty') return false;
//     }
//   } else {
//     if (x + shipSize > BOARD_SIZE) return false;
//     for (let i = 0; i < shipSize; i++) {
//       if (board[x + i][y] !== 'empty') return false;
//     }
//   }
//   return true;
// }

// function placeShipOnBoard(board, x, y, shipSize, orientation) {
//   const newBoard = board.map(row => [...row]);
//   if (orientation === 'horizontal') {
//     for (let i = 0; i < shipSize; i++) {
//       newBoard[x][y + i] = 'ship';
//     }
//   } else {
//     for (let i = 0; i < shipSize; i++) {
//       newBoard[x + i][y] = 'ship';
//     }
//   }
//   return newBoard;
// }

// function generateRandomShipPlacement(shipTypes) {
//   let board = createEmptyBoard();
//   const ships = [];
  
//   shipTypes.forEach((shipType, index) => {
//     const shipSize = SHIP_DEFINITIONS[shipType].size;
//     let placed = false;
//     let attempts = 0;
    
//     while (!placed && attempts < 100) {
//       const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
//       const x = Math.floor(Math.random() * BOARD_SIZE);
//       const y = Math.floor(Math.random() * BOARD_SIZE);
      
//       if (canPlaceShip(board, x, y, shipSize, orientation)) {
//         board = placeShipOnBoard(board, x, y, shipSize, orientation);
        
//         // Calcular posições do navio
//         const positions = [];
//         for (let i = 0; i < shipSize; i++) {
//           if (orientation === 'horizontal') {
//             positions.push({ x, y: y + i });
//           } else {
//             positions.push({ x: x + i, y });
//           }
//         }
        
//         ships.push({
//           id: index + 1,
//           type: shipType,
//           length: shipSize,
//           positions,
//           hits: [],
//           isSunk: false
//         });
        
//         placed = true;
//       }
//       attempts++;
//     }
//   });
  
//   return { board, ships };
// }

// // WebSocket handlers
// wss.on('connection', (ws, req) => {
//   console.log('Nova conexão WebSocket');
  
//   // Armazena a requisição para acesso posterior
//   ws.upgradeReq = req;
  
//   ws.on('message', (data) => {
//     try {
//       const message = JSON.parse(data);
//       handleMessage(ws, message);
//     } catch (error) {
//       console.error('Erro ao processar mensagem:', error);
//     }
//   });
  
//   ws.on('close', () => {
//     const userId = [...userConnections.entries()].find(([_, connection]) => connection === ws)?.[0];
//     if (userId) {
//       userConnections.delete(userId);
//       const user = users.get(userId);
//       if (user) {
//         user.lastSeen = new Date();
//         user.isOnline = false;
//         broadcastUserList();
//       }
//     }
//   });
// });

// function handleMessage(ws, message) {
//   switch (message.type) {
//     case 'register':
//       handleRegister(ws, message);
//       break;
//     case 'get_online_users':
//       handleGetOnlineUsers(ws);
//       break;
//     case 'send_invitation':
//       handleSendInvitation(message);
//       break;
//     case 'accept_invitation':
//       handleAcceptInvitation(message);
//       break;
//     case 'reject_invitation':
//       handleRejectInvitation(message);
//       break;
//     case 'update_game_state':
//       handleUpdateGameState(message);
//       break;
//     case 'player_ready':
//       handlePlayerReady(message);
//       break;
//     case 'fire_shot':
//       handleFireShot(message);
//       break;
//         case 'heartbeat':
//       handleHeartbeat(ws, message);
//       break;
//     case 'update_status':
//       handleUpdateStatus(ws, message);
//       break;
//     case 'search_players':
//       handleSearchPlayers(ws, message);
//       break;
//     case 'get_player_stats':
//       handleGetPlayerStats(ws, message);
//       break;
//   }
// }

// // Handler para heartbeat
// function handleHeartbeat(ws, message) {
//   const { userId } = message;
//   if (userId && users.has(userId)) {
//     discoveryService.registerUser(userId, {
//       status: message.status || 'available',
//       gameId: message.gameId || null
//     });
    
//     // Responder ao heartbeat
//     ws.send(JSON.stringify({
//       type: 'heartbeat_ack',
//       timestamp: new Date().toISOString()
//     }));
//   }
// }

// // Handler para atualizar status
// function handleUpdateStatus(ws, message) {
//   const { userId, status, gameId } = message;
//   if (userId && users.has(userId)) {
//     discoveryService.updateUserStatus(userId, status, gameId);
//     broadcastUserList();
    
//     ws.send(JSON.stringify({
//       type: 'status_updated',
//       status,
//       gameId
//     }));
//   }
// }

// // Handler para buscar jogadores
// function handleSearchPlayers(ws, message) {
//   const { userId, filters = {} } = message;
  
//   const availableUsers = discoveryService.getAvailableUsers(userId);
  
//   // Aplicar filtros
//   let filteredUsers = availableUsers;
  
//   if (filters.minGames) {
//     filteredUsers = filteredUsers.filter(user => 
//       (user.stats?.totalGames || 0) >= filters.minGames
//     );
//   }
  
//   if (filters.maxPing) {
//     // Aqui você pode implementar verificação de ping se necessário
//   }
  
//   ws.send(JSON.stringify({
//     type: 'players_found',
//     players: filteredUsers.map(user => ({
//       id: user.id,
//       name: user.name,
//       stats: user.stats || {},
//       status: user.status,
//       lastSeen: user.lastSeen
//     })),
//     total: filteredUsers.length
//   }));
// }

// // Handler para obter estatísticas do jogador
// function handleGetPlayerStats(ws, message) {
//   const { userId } = message;
//   const user = users.get(userId);
  
//   if (user) {
//     ws.send(JSON.stringify({
//       type: 'player_stats',
//       userId,
//       stats: user.stats || {
//         totalGames: 0,
//         wins: 0,
//         losses: 0,
//         winRate: 0
//       }
//     }));
//   }
// }

// // function handleRegister(ws, message) {
// //   const { userName } = message;
// //   const userId = uuidv4(); // Gera UUID único para o usuário
// //   const userIP = getClientIP(ws);
  
// //   const user = {
// //     id: userId,
// //     name: userName,
// //     ip: userIP,
// //     lastSeen: new Date(),
// //     isOnline: true
// //   };
  
// //   users.set(userId, user);
// //   userConnections.set(userId, ws);
  
// //   console.log(`Usuário registrado: ${userName} (${userId}) - IP: ${userIP}`);
  
// //   // Enviar confirmação com UUID
// //   ws.send(JSON.stringify({
// //     type: 'registered',
// //     user: {
// //       id: userId,
// //       name: userName,
// //       ip: userIP
// //     }
// //   }));
  
// //   broadcastUserList();
// // }

// function handleRegister(ws, message) {
//   const { userName } = message;
//   const userId = uuidv4();
//   const userIP = getClientIP(ws);
  
//   const user = {
//     id: userId,
//     name: userName,
//     ip: userIP,
//     lastSeen: new Date(),
//     isOnline: true,
//     status: 'available',
//     gameId: null,
//     stats: {
//       totalGames: 0,
//       wins: 0,
//       losses: 0,
//       winRate: 0
//     },
//     joinedAt: new Date()
//   };
  
//   users.set(userId, user);
//   userConnections.set(userId, ws);
  
//   console.log(`Usuário registrado: ${userName} (${userId}) - IP: ${userIP}`);
  
//   // Enviar confirmação com UUID
//   ws.send(JSON.stringify({
//     type: 'registered',
//     user: {
//       id: userId,
//       name: userName,
//       ip: userIP,
//       stats: user.stats
//     }
//   }));
  
//   broadcastUserList();
// }

// function handleGetOnlineUsers(ws) {
//   const onlineUsers = Array.from(users.values()).filter(user => 
//     userConnections.has(user.id) && user.isOnline
//   );
  
//   ws.send(JSON.stringify({
//     type: 'online_users',
//     users: onlineUsers.map(user => ({
//       id: user.id,
//       name: user.name,
//       ip: user.ip,
//       lastSeen: user.lastSeen
//     }))
//   }));
// }

// function handleSendInvitation(message) {
//   const { fromUserId, toUserId, gameOptions } = message;
//   const toUserWs = userConnections.get(toUserId);
  
//   if (toUserWs) {
//     toUserWs.send(JSON.stringify({
//       type: 'invitation_received',
//       fromUser: users.get(fromUserId),
//       gameOptions
//     }));
//   }
// }

// function handleAcceptInvitation(message) {
//   const { gameState } = message;
//   const fromUserWs = userConnections.get(gameState.player1.id);
  
//   // Gerar IDs únicos para o jogo
//   gameState.id = `game-${gameState.player1.id}-${gameState.player2.id}-${Date.now()}`;
//   gameState.player1.board = createEmptyBoard();
//   gameState.player1.ships = [];
//   gameState.player1.isReady = false;
//   gameState.player2.board = createEmptyBoard();
//   gameState.player2.ships = [];
//   gameState.player2.isReady = false;
//   gameState.status = 'setup';
//   gameState.shots = [];
//   gameState.createdAt = new Date();
  
//   games.set(gameState.id, gameState);
  
//   // Notificar ambos os jogadores
//   if (fromUserWs) {
//     fromUserWs.send(JSON.stringify({
//       type: 'invitation_accepted',
//       gameState
//     }));
//   }
  
//   const toUserWs = userConnections.get(gameState.player2.id);
//   if (toUserWs) {
//     toUserWs.send(JSON.stringify({
//       type: 'game_created',
//       gameState
//     }));
//   }
// }

// function handleRejectInvitation(message) {
//   const { fromUserId, toUserId } = message;
//   const fromUserWs = userConnections.get(fromUserId);
  
//   if (fromUserWs) {
//     fromUserWs.send(JSON.stringify({
//       type: 'invitation_rejected',
//       fromUserId: toUserId
//     }));
//   }
// }

// function handlePlayerReady(message) {
//   const { gameId, userId, board, ships } = message;
//   const game = games.get(gameId);
  
//   if (!game) return;
  
//   const player = game.player1.id === userId ? game.player1 : game.player2;
//   player.board = board;
//   player.ships = ships;
//   player.isReady = true;
  
//   // Verificar se ambos estão prontos
//   if (game.player1.isReady && game.player2.isReady && game.status === 'setup') {
//     game.status = 'playing';
//     game.currentPlayerId = Math.random() < 0.5 ? game.player1.id : game.player2.id;
    
//     // Notificar início do jogo
//     broadcastToGame(gameId, {
//       type: 'game_started',
//       gameState: game
//     });
//   } else {
//     // Atualizar estado do jogo
//     broadcastToGame(gameId, {
//       type: 'game_state_updated',
//       gameState: game
//     });
//   }
// }

// function handleFireShot(message) {
//   const { gameId, userId, x, y } = message;
//   const game = games.get(gameId);
  
//   if (!game || game.currentPlayerId !== userId) return;
  
//   const opponent = game.player1.id === userId ? game.player2 : game.player1;
//   const cellState = opponent.board[x][y];
  
//   let newState = cellState;
//   let hitShip = null;
  
//   if (cellState === 'ship') {
//     newState = 'hit';
    
//     // Verificar se afundou algum navio
//     opponent.ships.forEach(ship => {
//       const wasHit = ship.positions.some(pos => pos.x === x && pos.y === y);
//       if (wasHit && !ship.hits.some(hit => hit.x === x && hit.y === y)) {
//         ship.hits.push({ x, y });
//         if (ship.hits.length === ship.positions.length) {
//           ship.isSunk = true;
//           hitShip = ship;
//         }
//       }
//     });
    
//     if (hitShip) {
//       hitShip.positions.forEach(pos => {
//         opponent.board[pos.x][pos.y] = 'sunk';
//       });
//     }
//   } else if (cellState === 'empty') {
//     newState = 'miss';
//   }
  
//   opponent.board[x][y] = newState;
  
//   // Verificar fim de jogo
//   const allShipsSunk = opponent.ships.every(ship => ship.isSunk);
  
//   if (allShipsSunk) {
//     game.status = 'finished';
//     game.winnerId = userId;
//   } else {
//     // Trocar turno
//     game.currentPlayerId = opponent.id;
//   }
  
//   game.shots.push({ x, y, playerId: userId });
  
//   broadcastToGame(gameId, {
//     type: 'game_state_updated',
//     gameState: game
//   });
// }

// function handleUpdateGameState(message) {
//   const { gameState } = message;
//   games.set(gameState.id, gameState);
//   broadcastToGame(gameState.id, {
//     type: 'game_state_updated',
//     gameState
//   });
// }

// function broadcastToGame(gameId, message) {
//   const game = games.get(gameId);
//   if (!game) return;
  
//   const player1Ws = userConnections.get(game.player1.id);
//   const player2Ws = userConnections.get(game.player2.id);
  
//   [player1Ws, player2Ws].forEach(ws => {
//     if (ws && ws.readyState === ws.OPEN) {
//       ws.send(JSON.stringify(message));
//     }
//   });
// }

// // function broadcastUserList() {
// //   const onlineUsers = Array.from(users.values()).filter(user => 
// //     userConnections.has(user.id) && user.isOnline
// //   );
  
// //   const message = JSON.stringify({
// //     type: 'online_users',
// //     users: onlineUsers.map(user => ({
// //       id: user.id,
// //       name: user.name,
// //       ip: user.ip,
// //       lastSeen: user.lastSeen
// //     }))
// //   });
  
// //   userConnections.forEach(ws => {
// //     if (ws.readyState === ws.OPEN) {
// //       ws.send(message);
// //     }
// //   });
// // }


// function broadcastUserList() {
//   const onlineUsers = Array.from(users.values()).filter(user => 
//     user.isOnline
//   );
  
//   const message = JSON.stringify({
//     type: 'online_users',
//     users: onlineUsers.map(user => ({
//       id: user.id,
//       name: user.name,
//       ip: user.ip,
//       status: user.status,
//       gameId: user.gameId,
//       stats: user.stats,
//       lastSeen: user.lastSeen
//     })),
//     total: onlineUsers.length
//   });
  
//   userConnections.forEach(ws => {
//     if (ws.readyState === ws.OPEN) {
//       ws.send(message);
//     }
//   });
// }

// // Rota principal
// app.get('/', (req, res) => {
//   res.sendFile(join(__dirname, 'public', 'index.html'));
// });

// // Rota para informações do servidor
// app.get('/server-info', (req, res) => {
//   const localIPs = getLocalIPs();
//   res.json({
//     port: PORT,
//     localIPs,
//     serverTime: new Date().toISOString()
//   });
// });


// // Serviço de descoberta
// const discoveryService = {
//   // Tempo máximo de inatividade (30 segundos)
//   MAX_INACTIVE_TIME: 30000,
  
//   // Intervalo de verificação (10 segundos)
//   CHECK_INTERVAL: 10000,
  
//   // Inicializar o serviço
//   init() {
//     setInterval(() => this.cleanupInactiveUsers(), this.CHECK_INTERVAL);
//     console.log('Serviço de descoberta inicializado');
//   },
  
//   // Registrar usuário como online
//   registerUser(userId, userInfo) {
//     const user = users.get(userId);
//     if (user) {
//       user.lastSeen = new Date();
//       user.isOnline = true;
//       user.status = userInfo.status || 'available';
//       user.gameId = userInfo.gameId || null;
//     }
//   },
  
//   // Marcar usuário como offline
//   markOffline(userId) {
//     const user = users.get(userId);
//     if (user) {
//       user.isOnline = false;
//       user.lastSeen = new Date();
//     }
//   },
  
//   // Limpar usuários inativos
//   cleanupInactiveUsers() {
//     const now = new Date();
//     let cleanedCount = 0;
    
//     users.forEach((user, userId) => {
//       if (user.isOnline && (now - user.lastSeen) > this.MAX_INACTIVE_TIME) {
//         user.isOnline = false;
//         cleanedCount++;
//         console.log(`Usuário ${user.name} marcado como offline por inatividade`);
//       }
//     });
    
//     if (cleanedCount > 0) {
//       broadcastUserList();
//     }
//   },
  
//   // Obter lista de usuários disponíveis para jogo
//   getAvailableUsers(excludeUserId = null) {
//     return Array.from(users.values()).filter(user => 
//       user.isOnline && 
//       user.id !== excludeUserId &&
//       user.status === 'available'
//     );
//   },
  
//   // Atualizar status do usuário
//   updateUserStatus(userId, status, gameId = null) {
//     const user = users.get(userId);
//     if (user) {
//       user.status = status;
//       user.gameId = gameId;
//       user.lastSeen = new Date();
//     }
//   }
// };

// // Inicializar o serviço de descoberta
// discoveryService.init();

// // Iniciar o servidor 

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, '0.0.0.0', () => {
//   console.log(`\n=== SERVIDOR BATALHA NAVAL ===`);
//   console.log(`Servidor rodando na porta ${PORT}`);
//   console.log(`\nEndereços disponíveis na rede local:`);
  
//   const localIPs = getLocalIPs();
//   localIPs.forEach(ipInfo => {
//     console.log(`  → http://${ipInfo.address}:${PORT} (${ipInfo.interface})`);
//   });
  
//   console.log(`\nAcesse qualquer um dos endereços acima para jogar`);
//   console.log(`=============================================\n`);
// });

import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Servir arquivos estáticos
app.use(express.static(join(__dirname, 'public')));

// Dados do jogo
const users = new Map();
const games = new Map();
const userConnections = new Map();

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

// Serviço de descoberta
const discoveryService = {
  // Tempo máximo de inatividade (30 segundos)
  MAX_INACTIVE_TIME: 30000,
  
  // Intervalo de verificação (10 segundos)
  CHECK_INTERVAL: 10000,
  
  // Inicializar o serviço
  init() {
    setInterval(() => this.cleanupInactiveUsers(), this.CHECK_INTERVAL);
    console.log('Serviço de descoberta inicializado');
  },
  
  // Registrar usuário como online
  registerUser(userId, userInfo) {
    const user = users.get(userId);
    if (user) {
      user.lastSeen = new Date();
      user.isOnline = true;
      user.status = userInfo.status || 'available';
      user.gameId = userInfo.gameId || null;
    }
  },
  
  // Marcar usuário como offline
  markOffline(userId) {
    const user = users.get(userId);
    if (user) {
      user.isOnline = false;
      user.lastSeen = new Date();
    }
  },
  
  // Limpar usuários inativos
  cleanupInactiveUsers() {
    const now = new Date();
    let cleanedCount = 0;
    
    users.forEach((user, userId) => {
      if (user.isOnline && (now - user.lastSeen) > this.MAX_INACTIVE_TIME) {
        user.isOnline = false;
        cleanedCount++;
        console.log(`Usuário ${user.name} marcado como offline por inatividade`);
      }
    });
    
    if (cleanedCount > 0) {
      broadcastUserList();
    }
  },
  
  // Obter lista de usuários disponíveis para jogo
  getAvailableUsers(excludeUserId = null) {
    return Array.from(users.values()).filter(user => 
      user.isOnline && 
      user.id !== excludeUserId &&
      user.status === 'available'
    );
  },
  
  // Atualizar status do usuário
  updateUserStatus(userId, status, gameId = null) {
    const user = users.get(userId);
    if (user) {
      user.status = status;
      user.gameId = gameId;
      user.lastSeen = new Date();
    }
  }
};

// Inicializar o serviço de descoberta
discoveryService.init();

// Função para obter IPs da rede local
function getLocalIPs() {
  const allInterfaces = os.networkInterfaces();
  const localIPs = [];
  
  Object.keys(allInterfaces).forEach(interfaceName => {
    allInterfaces[interfaceName].forEach(oneInterface => {
      // IPv4 e não é loopback
      if (oneInterface.family === 'IPv4' && !oneInterface.internal) {
        localIPs.push({
          interface: interfaceName,
          address: oneInterface.address,
          family: oneInterface.family
        });
      }
    });
  });
  
  return localIPs;
}

// Função para obter o IP do cliente a partir do WebSocket
function getClientIP(ws) {
  // Tenta obter o IP real do cliente
  const socket = ws._socket;
  const headers = ws.upgradeReq?.headers;
  
  // Verifica se há header X-Forwarded-For (caso esteja atrás de proxy)
  const forwardedFor = headers?.['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  // Verifica se há header X-Real-IP
  const realIP = headers?.['x-real-ip'];
  if (realIP) {
    return realIP;
  }
  
  // Usa o endereço remoto do socket como fallback
  return socket.remoteAddress;
}

// Utilitários
function createEmptyBoard() {
  return Array(BOARD_SIZE).fill(null).map(() => 
    Array(BOARD_SIZE).fill('empty')
  );
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

function placeShipOnBoard(board, x, y, shipSize, orientation) {
  const newBoard = board.map(row => [...row]);
  if (orientation === 'horizontal') {
    for (let i = 0; i < shipSize; i++) {
      newBoard[x][y + i] = 'ship';
    }
  } else {
    for (let i = 0; i < shipSize; i++) {
      newBoard[x + i][y] = 'ship';
    }
  }
  return newBoard;
}

function generateRandomShipPlacement(shipTypes) {
  let board = createEmptyBoard();
  const ships = [];
  
  shipTypes.forEach((shipType, index) => {
    const shipSize = SHIP_DEFINITIONS[shipType].size;
    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);
      
      if (canPlaceShip(board, x, y, shipSize, orientation)) {
        board = placeShipOnBoard(board, x, y, shipSize, orientation);
        
        // Calcular posições do navio
        const positions = [];
        for (let i = 0; i < shipSize; i++) {
          if (orientation === 'horizontal') {
            positions.push({ x, y: y + i });
          } else {
            positions.push({ x: x + i, y });
          }
        }
        
        ships.push({
          id: index + 1,
          type: shipType,
          length: shipSize,
          positions,
          hits: [],
          isSunk: false
        });
        
        placed = true;
      }
      attempts++;
    }
  });
  
  return { board, ships };
}

// WebSocket handlers
wss.on('connection', (ws, req) => {
  console.log('Nova conexão WebSocket');
  
  // Armazena a requisição para acesso posterior
  ws.upgradeReq = req;
  
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleMessage(ws, message);
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });
  
  ws.on('close', () => {
    const userId = [...userConnections.entries()].find(([_, connection]) => connection === ws)?.[0];
    if (userId) {
      userConnections.delete(userId);
      const user = users.get(userId);
      if (user) {
        user.lastSeen = new Date();
        user.isOnline = false;
        broadcastUserList();
      }
    }
  });
});

function handleMessage(ws, message) {
  switch (message.type) {
    case 'register':
      handleRegister(ws, message);
      break;
    case 'get_online_users':
      handleGetOnlineUsers(ws);
      break;
    case 'send_invitation':
      handleSendInvitation(message);
      break;
    case 'accept_invitation':
      handleAcceptInvitation(message);
      break;
    case 'reject_invitation':
      handleRejectInvitation(message);
      break;
    case 'update_game_state':
      handleUpdateGameState(message);
      break;
    case 'player_ready':
      handlePlayerReady(message);
      break;
    case 'fire_shot':
      handleFireShot(message);
      break;
    case 'heartbeat':
      handleHeartbeat(ws, message);
      break;
    case 'update_status':
      handleUpdateStatus(ws, message);
      break;
    case 'search_players':
      handleSearchPlayers(ws, message);
      break;
    case 'get_player_stats':
      handleGetPlayerStats(ws, message);
      break;
    default:
      console.log('Tipo de mensagem desconhecido:', message.type);
  }
}

function handleRegister(ws, message) {
  const { userName } = message;
  const userId = uuidv4();
  const userIP = getClientIP(ws);
  
  const user = {
    id: userId,
    name: userName,
    ip: userIP,
    lastSeen: new Date(),
    isOnline: true,
    status: 'available',
    gameId: null,
    stats: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      winRate: 0
    },
    joinedAt: new Date()
  };
  
  users.set(userId, user);
  userConnections.set(userId, ws);
  
  console.log(`Usuário registrado: ${userName} (${userId}) - IP: ${userIP}`);
  
  // Enviar confirmação com UUID
  ws.send(JSON.stringify({
    type: 'registered',
    user: {
      id: userId,
      name: userName,
      ip: userIP,
      stats: user.stats
    }
  }));
  
  broadcastUserList();
}

function handleGetOnlineUsers(ws) {
  const onlineUsers = Array.from(users.values()).filter(user => 
    userConnections.has(user.id) && user.isOnline
  );
  
  ws.send(JSON.stringify({
    type: 'online_users',
    users: onlineUsers.map(user => ({
      id: user.id,
      name: user.name,
      ip: user.ip,
      status: user.status,
      gameId: user.gameId,
      stats: user.stats,
      lastSeen: user.lastSeen
    }))
  }));
}

function handleSendInvitation(message) {
  const { fromUserId, toUserId, gameOptions } = message;
  const fromUser = users.get(fromUserId);
  const toUserWs = userConnections.get(toUserId);
  
  if (toUserWs && fromUser) {
    toUserWs.send(JSON.stringify({
      type: 'invitation_received',
      fromUser: {
        id: fromUser.id,
        name: fromUser.name,
        stats: fromUser.stats
      },
      gameOptions
    }));
    
    // Atualizar status do remetente para "ocupado"
    discoveryService.updateUserStatus(fromUserId, 'busy');
  }
}

function handleAcceptInvitation(message) {
  const { gameState } = message;
  const fromUserWs = userConnections.get(gameState.player1.id);
  
  // Atualizar status dos jogadores
  discoveryService.updateUserStatus(gameState.player1.id, 'in_game', gameState.id);
  discoveryService.updateUserStatus(gameState.player2.id, 'in_game', gameState.id);
  
  // Gerar IDs únicos para o jogo
  gameState.id = `game-${gameState.player1.id}-${gameState.player2.id}-${Date.now()}`;
  gameState.player1.board = createEmptyBoard();
  gameState.player1.ships = [];
  gameState.player1.isReady = false;
  gameState.player2.board = createEmptyBoard();
  gameState.player2.ships = [];
  gameState.player2.isReady = false;
  gameState.status = 'setup';
  gameState.shots = [];
  gameState.createdAt = new Date();
  
  games.set(gameState.id, gameState);
  
  // Notificar ambos os jogadores
  if (fromUserWs) {
    fromUserWs.send(JSON.stringify({
      type: 'invitation_accepted',
      gameState
    }));
  }
  
  const toUserWs = userConnections.get(gameState.player2.id);
  if (toUserWs) {
    toUserWs.send(JSON.stringify({
      type: 'game_created',
      gameState
    }));
  }
  
  broadcastUserList();
}

function handleRejectInvitation(message) {
  const { fromUserId, toUserId } = message;
  const fromUserWs = userConnections.get(fromUserId);
  
  if (fromUserWs) {
    fromUserWs.send(JSON.stringify({
      type: 'invitation_rejected',
      fromUserId: toUserId
    }));
    
    // Reverter status para "disponível"
    discoveryService.updateUserStatus(fromUserId, 'available');
  }
}

function handlePlayerReady(message) {
  const { gameId, userId, board, ships } = message;
  const game = games.get(gameId);
  
  if (!game) return;
  
  const player = game.player1.id === userId ? game.player1 : game.player2;
  player.board = board;
  player.ships = ships;
  player.isReady = true;
  
  // Verificar se ambos estão prontos
  if (game.player1.isReady && game.player2.isReady && game.status === 'setup') {
    game.status = 'playing';
    game.currentPlayerId = Math.random() < 0.5 ? game.player1.id : game.player2.id;
    
    // Atualizar estatísticas
    game.player1.stats = users.get(game.player1.id)?.stats;
    game.player2.stats = users.get(game.player2.id)?.stats;
    
    // Notificar início do jogo
    broadcastToGame(gameId, {
      type: 'game_started',
      gameState: game
    });
  } else {
    // Atualizar estado do jogo
    broadcastToGame(gameId, {
      type: 'game_state_updated',
      gameState: game
    });
  }
}

function handleFireShot(message) {
  const { gameId, userId, x, y } = message;
  const game = games.get(gameId);
  
  if (!game || game.currentPlayerId !== userId) return;
  
  const opponent = game.player1.id === userId ? game.player2 : game.player1;
  const cellState = opponent.board[x][y];
  
  let newState = cellState;
  let hitShip = null;
  
  if (cellState === 'ship') {
    newState = 'hit';
    
    // Verificar se afundou algum navio
    opponent.ships.forEach(ship => {
      const wasHit = ship.positions.some(pos => pos.x === x && pos.y === y);
      if (wasHit && !ship.hits.some(hit => hit.x === x && hit.y === y)) {
        ship.hits.push({ x, y });
        if (ship.hits.length === ship.positions.length) {
          ship.isSunk = true;
          hitShip = ship;
        }
      }
    });
    
    if (hitShip) {
      hitShip.positions.forEach(pos => {
        opponent.board[pos.x][pos.y] = 'sunk';
      });
    }
  } else if (cellState === 'empty') {
    newState = 'miss';
  }
  
  opponent.board[x][y] = newState;
  
  // Verificar fim de jogo
  const allShipsSunk = opponent.ships.every(ship => ship.isSunk);
  
  if (allShipsSunk) {
    game.status = 'finished';
    game.winnerId = userId;
    
    // Atualizar estatísticas
    updatePlayerStats(game.player1.id, game.player1.id === userId);
    updatePlayerStats(game.player2.id, game.player2.id === userId);
    
    // Liberar jogadores
    discoveryService.updateUserStatus(game.player1.id, 'available', null);
    discoveryService.updateUserStatus(game.player2.id, 'available', null);
  } else {
    // Trocar turno
    game.currentPlayerId = opponent.id;
  }
  
  game.shots.push({ x, y, playerId: userId });
  
  broadcastToGame(gameId, {
    type: 'game_state_updated',
    gameState: game
  });
  
  broadcastUserList();
}

function handleUpdateGameState(message) {
  const { gameState } = message;
  games.set(gameState.id, gameState);
  broadcastToGame(gameState.id, {
    type: 'game_state_updated',
    gameState
  });
}

// Novos handlers para serviço de descoberta
function handleHeartbeat(ws, message) {
  const { userId } = message;
  if (userId && users.has(userId)) {
    discoveryService.registerUser(userId, {
      status: message.status || 'available',
      gameId: message.gameId || null
    });
    
    // Responder ao heartbeat
    ws.send(JSON.stringify({
      type: 'heartbeat_ack',
      timestamp: new Date().toISOString()
    }));
  }
}

function handleUpdateStatus(ws, message) {
  const { userId, status, gameId } = message;
  if (userId && users.has(userId)) {
    discoveryService.updateUserStatus(userId, status, gameId);
    broadcastUserList();
    
    ws.send(JSON.stringify({
      type: 'status_updated',
      status,
      gameId
    }));
  }
}

function handleSearchPlayers(ws, message) {
  const { userId, filters = {} } = message;
  
  const availableUsers = discoveryService.getAvailableUsers(userId);
  
  // Aplicar filtros
  let filteredUsers = availableUsers;
  
  if (filters.minGames) {
    filteredUsers = filteredUsers.filter(user => 
      (user.stats?.totalGames || 0) >= filters.minGames
    );
  }
  
  if (filters.searchName) {
    filteredUsers = filteredUsers.filter(user =>
      user.name.toLowerCase().includes(filters.searchName.toLowerCase())
    );
  }
  
  ws.send(JSON.stringify({
    type: 'players_found',
    players: filteredUsers.map(user => ({
      id: user.id,
      name: user.name,
      stats: user.stats || {},
      status: user.status,
      lastSeen: user.lastSeen
    })),
    total: filteredUsers.length
  }));
}

function handleGetPlayerStats(ws, message) {
  const { userId } = message;
  const user = users.get(userId);
  
  if (user) {
    ws.send(JSON.stringify({
      type: 'player_stats',
      userId,
      stats: user.stats || {
        totalGames: 0,
        wins: 0,
        losses: 0,
        winRate: 0
      }
    }));
  }
}

// Função para atualizar estatísticas dos jogadores
function updatePlayerStats(userId, isWinner) {
  const user = users.get(userId);
  if (user && user.stats) {
    user.stats.totalGames = (user.stats.totalGames || 0) + 1;
    
    if (isWinner) {
      user.stats.wins = (user.stats.wins || 0) + 1;
    } else {
      user.stats.losses = (user.stats.losses || 0) + 1;
    }
    
    user.stats.winRate = user.stats.totalGames > 0 
      ? Math.round((user.stats.wins / user.stats.totalGames) * 100) 
      : 0;
  }
}

function broadcastToGame(gameId, message) {
  const game = games.get(gameId);
  if (!game) return;
  
  const player1Ws = userConnections.get(game.player1.id);
  const player2Ws = userConnections.get(game.player2.id);
  
  [player1Ws, player2Ws].forEach(ws => {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

function broadcastUserList() {
  const onlineUsers = Array.from(users.values()).filter(user => 
    user.isOnline
  );
  
  const message = JSON.stringify({
    type: 'online_users',
    users: onlineUsers.map(user => ({
      id: user.id,
      name: user.name,
      ip: user.ip,
      status: user.status,
      gameId: user.gameId,
      stats: user.stats,
      lastSeen: user.lastSeen
    })),
    total: onlineUsers.length
  });
  
  userConnections.forEach(ws => {
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Rota para informações do servidor
app.get('/server-info', (req, res) => {
  const localIPs = getLocalIPs();
  res.json({
    port: PORT,
    localIPs,
    serverTime: new Date().toISOString(),
    onlineUsers: Array.from(users.values()).filter(user => user.isOnline).length,
    totalUsers: users.size,
    activeGames: Array.from(games.values()).filter(game => game.status === 'playing').length
  });
});

// Rota para estatísticas do servidor
app.get('/server-stats', (req, res) => {
  const onlineUsers = Array.from(users.values()).filter(user => user.isOnline);
  const activeGames = Array.from(games.values()).filter(game => game.status === 'playing');
  
  res.json({
    server: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      connections: userConnections.size
    },
    users: {
      online: onlineUsers.length,
      total: users.size,
      byStatus: {
        available: onlineUsers.filter(u => u.status === 'available').length,
        busy: onlineUsers.filter(u => u.status === 'busy').length,
        in_game: onlineUsers.filter(u => u.status === 'in_game').length
      }
    },
    games: {
      active: activeGames.length,
      total: games.size,
      finished: Array.from(games.values()).filter(game => game.status === 'finished').length
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=== SERVIDOR BATALHA NAVAL ===`);
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Serviço de descoberta: ATIVO`);
  console.log(`\nEndereços disponíveis na rede local:`);
  
  const localIPs = getLocalIPs();
  localIPs.forEach(ipInfo => {
    console.log(`  → http://${ipInfo.address}:${PORT} (${ipInfo.interface})`);
  });
  
  console.log(`\nRotas disponíveis:`);
  console.log(`  → /          : Jogo principal`);
  console.log(`  → /server-info : Informações do servidor`);
  console.log(`  → /server-stats : Estatísticas detalhadas`);
  console.log(`\nAcesse qualquer um dos endereços acima para jogar`);
  console.log(`=============================================\n`);
});

export { app, server, wss };