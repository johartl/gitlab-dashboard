const EventEmitter = require('tiny-emitter');
const WebSocket = require('ws');

class WebSocketServer extends EventEmitter {

    constructor(server, logger) {
        super();
        this.logger = logger;
        this.wss = new WebSocket.Server({server, path: '/ws'});
        this.sockets = [];
        this.socketId = 0;
    }

    start() {
        this.wss.on('connection', this.onConnection.bind(this));
        this.wss.on('error', this.onError.bind(this));
    }

    stop() {
        this.wss.removeAllListeners('connection');
        this.wss.removeAllListeners('error');
        this.activeSockets.forEach(socket => socket.terminate());
    }

    get activeSockets() {
        return Object.keys(this.sockets).map(socketId => this.sockets[socketId]).filter(socket => !!socket);
    }

    get active() {
        return this.activeSockets.length > 0;
    }

    send(message) {
        this.activeSockets.forEach(socket => {
            socket.send(JSON.stringify(message));
        });
    }

    sendToSocket(socketId, message) {
        const socket = this.sockets[socketId];
        if (!socket) {
            return;
        }
        socket.send(JSON.stringify(message));
    }

    onConnection(socket) {
        const socketId = ++this.socketId;
        this.sockets[socketId] = socket;

        this.logger.verbose(`[ws] socket ${socketId} connected`);

        socket.on('close', () => {
            this.logger.verbose(`[ws] socket ${socketId} disconnected`);
            this.sockets[socketId] = null;
        });

        this.emit('connection', socketId);
    }

    onError(error) {
        this.logger.error('[ws] Error:', error);
    }
}

module.exports = WebSocketServer;
