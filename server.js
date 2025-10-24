import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
  const board = createEmptyBoard();
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
wss.on('connection', (ws) => {
  console.log('Nova conexão WebSocket');
  
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
  }
}

function handleRegister(ws, message) {
  const { userId, userName } = message;
  
  const user = {
    id: userId,
    name: userName,
    ip: ws._socket.remoteAddress,
    lastSeen: new Date()
  };
  
  users.set(userId, user);
  userConnections.set(userId, ws);
  
  // Enviar confirmação
  ws.send(JSON.stringify({
    type: 'registered',
    user
  }));
  
  broadcastUserList();
}

function handleGetOnlineUsers(ws) {
  const onlineUsers = Array.from(users.values()).filter(user => 
    userConnections.has(user.id)
  );
  
  ws.send(JSON.stringify({
    type: 'online_users',
    users: onlineUsers
  }));
}

function handleSendInvitation(message) {
  const { fromUserId, toUserId, gameOptions } = message;
  const toUserWs = userConnections.get(toUserId);
  
  if (toUserWs) {
    toUserWs.send(JSON.stringify({
      type: 'invitation_received',
      fromUser: users.get(fromUserId),
      gameOptions
    }));
  }
}

function handleAcceptInvitation(message) {
  const { gameState } = message;
  const fromUserWs = userConnections.get(gameState.player1.id);
  
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
}

function handleRejectInvitation(message) {
  const { fromUserId, toUserId } = message;
  const fromUserWs = userConnections.get(fromUserId);
  
  if (fromUserWs) {
    fromUserWs.send(JSON.stringify({
      type: 'invitation_rejected',
      fromUserId: toUserId
    }));
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
  } else {
    // Trocar turno
    game.currentPlayerId = opponent.id;
  }
  
  game.shots.push({ x, y, playerId: userId });
  
  broadcastToGame(gameId, {
    type: 'game_state_updated',
    gameState: game
  });
}

function handleUpdateGameState(message) {
  const { gameState } = message;
  games.set(gameState.id, gameState);
  broadcastToGame(gameState.id, {
    type: 'game_state_updated',
    gameState
  });
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
    userConnections.has(user.id)
  );
  
  const message = JSON.stringify({
    type: 'online_users',
    users: onlineUsers
  });
  
  userConnections.forEach(ws => {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  });
}

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0',() => {
  console.log(`Servidor Batalha Naval rodando na porta ${PORT}`);
  console.log(`Acesse: http://0.0.0.0:${PORT}`);


});