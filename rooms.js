class RoomManager {
  constructor() {
    this.rooms = new Map();
  }
  
  getRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        clients: new Set(),
        canvasState: null,
        createdAt: new Date(),
        lastActivity: new Date()
      });
      console.log(`Created room: ${roomId}`);
    }
    return this.rooms.get(roomId);
  }
  
  addClient(roomId, userId, socketId, username, color) {
    const room = this.getRoom(roomId);
    room.clients.add({ userId, socketId, username, color, cursorPos: null });
    room.lastActivity = new Date();
    
    console.log(`User ${username} (${userId}) joined room ${roomId} (${room.clients.size} users)`);
    return room;
  }
  
  removeClient(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    for (const client of room.clients) {
      if (client.socketId === socketId) {
        room.clients.delete(client);
        console.log(`User ${client.username} left room ${roomId} (${room.clients.size} remaining)`);
        
        // Delete empty rooms after 1 minute to preserve state for quick reconnects
        if (room.clients.size === 0) {
          setTimeout(() => {
            if (room.clients.size === 0) {
              this.rooms.delete(roomId);
              console.log(`Deleted empty room: ${roomId}`);
            }
          }, 60000);
        }
        
        return client;
      }
    }
    return null;
  }
  
  updateCursorPosition(roomId, userId, cursorPos) {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    
    for (const client of room.clients) {
      if (client.userId === userId) {
        client.cursorPos = cursorPos;
        return true;
      }
    }
    return false;
  }
  
  getRoomClients(roomId) {
    const room = this.rooms.get(roomId);
    return room ? Array.from(room.clients) : [];
  }
  
  setCanvasState(roomId, canvasData) {
    const room = this.getRoom(roomId);
    room.canvasState = canvasData;
    room.lastActivity = new Date();
    console.log(`Canvas state updated for room ${roomId}`);
  }
  
  getCanvasState(roomId) {
    const room = this.rooms.get(roomId);
    return room ? room.canvasState : null;
  }
  
  getRoomStats() {
    const stats = [];
    for (const [roomId, room] of this.rooms) {
      stats.push({
        roomId,
        clientCount: room.clients.size,
        hasCanvasState: !!room.canvasState,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
      });
    }
    return stats;
  }
  
  // Remove rooms that have been empty and inactive for more than maxAge (default 1 hour)
  cleanupInactiveRooms(maxAge = 3600000) {
    const now = Date.now();
    for (const [roomId, room] of this.rooms) {
      if (room.clients.size === 0 && (now - room.lastActivity.getTime()) > maxAge) {
        this.rooms.delete(roomId);
        console.log(`Cleaned up inactive room: ${roomId}`);
      }
    }
  }
}

module.exports = RoomManager;
