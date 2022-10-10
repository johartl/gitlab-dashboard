const express = require('express');
const basicAuth = require('express-basic-auth');
const morgan = require('morgan');
const compression = require('compression');
const EventEmitter = require('tiny-emitter');
const path = require('path');
const http = require('http');

const WebSocketServer = require('./websocket-server');

const ROOT = path.resolve(__dirname);
const APP_DIR = path.resolve(ROOT, '..', 'app-build');

class Server extends EventEmitter {

    constructor(config, logger) {
        super();
        this.config = config;
        this.logger = logger;

        const app = express();
        this.server = http.createServer(app);
        this.wsServer = new WebSocketServer(this.server, this.logger);

        // Authentication
        if (this.config.user && this.config.password) {
            let users = {};
            users[this.config.user] = this.config.password;
            app.use(basicAuth({
                users: users,
                challenge: true
            }));
        }

        // Set up HTTP request logging
        const logStream = {
            write: (message, encoding) => this.logger.debug(`[server] ${message}`)
        };
        const requestLogger = morgan('common', {stream: logStream});
        app.use(requestLogger);

        // Use gzip to compress served files
        app.use(compression());

        // Serve app content
        app.use(express.static(APP_DIR));
    }

    start() {
        return new Promise((resolve, reject) => {
            this.logger.info('[server] starting server...');

            // Start listening
            const port = this.config.port || '5000';
            const host = this.config.host || '127.0.0.1';
            this.server.listen(port, host, () => {
                this.logger.info(`[server] listening on ${host}:${port} ...`);
                resolve();
            });

            // Keep track of open connections
            this.socketId = 0;
            this.sockets = {};
            this.server.on('connection', (socket) => {
                const socketId = this.socketId++;
                this.sockets[socketId] = socket;

                // Remove connection after it has been closed
                socket.on('close', () => delete this.sockets[socketId])
            });

            // Forward events
            this.wsServer.on('connection', this.emit.bind(this, 'connection'));

            this.wsServer.start();
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.logger.info('[server] stopping server...');

            if (!this.server) {
                resolve();
                return;
            }

            // Unsubscribe from events
            this.wsServer.off('connection');

            this.wsServer.stop();

            // Close all open connections
            Object.keys(this.sockets).forEach(socketId => this.sockets[socketId].destroy());

            this.server.close((err) => {
                if (err) {
                    this.logger.error('[server] error while shutting down server:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });

            // Kill the server after 5 seconds
            setTimeout(reject, 5000);
        }).then(() => this.logger.info('[server] Server terminated'));
    }

    send(message) {
        this.wsServer.send(message);
    }

    sendToSocket(socketId, message) {
        this.wsServer.sendToSocket(socketId, message);
    }
}

module.exports = Server;
