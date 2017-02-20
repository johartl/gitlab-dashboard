const winston = require('winston');

const Server = require('./server');
const Provider = require('./provider');

class Master {

    constructor(config) {
        this.config = config;
        this.logger = this.createLogger(this.config.log || {});
        this.server = new Server(config.server || {}, this.logger);
        this.provider = new Provider(config.provider || {}, this.logger, this.server);

        this.setupStopSignals();
    }

    start() {
        return this.server.start().then(() => {
            this.provider.start();
        });
    }

    stop() {
        this.provider.stop();
        return this.server.stop();
    }

    createLogger(logConfig) {
        let transports = [];

        transports.push(new winston.transports.Console({
            level: logConfig.level || 'info',
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: false,
            timestamp: true,
            colorize: 'colors' in logConfig ? logConfig.colors : true
        }));

        if (logConfig.file) {
            transports.push(new (winston.transports.File)({
                filename: logConfig.file,
                level: logConfig.level || 'info',
                colorize: false,
                json: false
            }));
        }

        return new winston.Logger({
            transports: transports
        });
    }

    setupStopSignals() {
        const STOP_SIGNALS = ['SIGHUP', 'SIGINT', 'SIGTERM'];

        STOP_SIGNALS.forEach(signal => process.on(signal, () => {
            this.logger.warn(`[master] Received ${signal} signal`);
            this.stop().then(() => {
                this.logger.info('[master] Stopping process now.');
                process.exit(0);
            }).catch(() => {
                this.logger.error('[master] Failed to stop. Killing process now.');
                process.exit(1);
            });
        }));
    }
}

module.exports = Master;
