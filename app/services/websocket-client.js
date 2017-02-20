import EventEmitter from 'tiny-emitter';

export class WebSocketClient extends EventEmitter {

    constructor() {
        super();
        this.socket = null;
        this.wsEndpoint = (location.protocol === 'https' ? 'wss://' : 'ws://') + location.host + '/ws';
        this.connected = false;
    }

    connect() {
        console.log(`[WS] Connecting to ${this.wsEndpoint} ...`);
        this.socket = new WebSocket(this.wsEndpoint);

        this.socket.addEventListener('open', this.onOpen.bind(this));
        this.socket.addEventListener('close', this.onClose.bind(this));
        this.socket.addEventListener('message', this.onMessage.bind(this));
        this.socket.addEventListener('error', this.onError.bind(this));
    }

    onMessage(event) {
        this.emit('message', JSON.parse(event.data));
    }

    onOpen(event) {
        this.connected = true;
        console.log('[WS] Connected');
    }

    onClose(event) {
        if (this.connected) {
            this.connected = false;
            console.error('[WS] Disconnected');
            this.emit('disconnect');
        }
        setTimeout(this.connect.bind(this), 1000);
    }

    onError(event) {
        console.error('[WS] Error:', event);
    }
}
