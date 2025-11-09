class DrawingStateManager {
  constructor() {
    this.states = new Map();
  }
  
  // Increment version number for optimistic concurrency control
  saveState(roomId, canvasData) {
    this.states.set(roomId, {
      canvasData,
      timestamp: Date.now(),
      version: (this.states.get(roomId)?.version || 0) + 1
    });
    console.log(`Saved canvas state for room ${roomId}`);
  }
  
  getState(roomId) {
    return this.states.get(roomId) || null;
  }
  
  clearState(roomId) {
    this.states.delete(roomId);
    console.log(`Cleared canvas state for room ${roomId}`);
  }
  
  getAllRoomIds() {
    return Array.from(this.states.keys());
  }
  
  hasState(roomId) {
    return this.states.has(roomId);
  }
  
  getStateMetadata(roomId) {
    const state = this.states.get(roomId);
    if (!state) return null;
    
    return {
      roomId,
      version: state.version,
      timestamp: state.timestamp,
      age: Date.now() - state.timestamp
    };
  }
  
  // Remove canvas states older than maxAge (default 24 hours) to free memory
  cleanup(maxAge = 86400000) {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [roomId, state] of this.states) {
      if ((now - state.timestamp) > maxAge) {
        this.states.delete(roomId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} old canvas states`);
    }
    
    return cleaned;
  }
  
  getStats() {
    let totalSize = 0;
    const roomStats = [];
    
    for (const [roomId, state] of this.states) {
      const size = state.canvasData ? state.canvasData.length : 0;
      totalSize += size;
      
      roomStats.push({
        roomId,
        size,
        version: state.version,
        age: Date.now() - state.timestamp,
        timestamp: state.timestamp
      });
    }
    
    return {
      totalRooms: this.states.size,
      totalSize,
      rooms: roomStats
    };
  }
}

module.exports = DrawingStateManager;
