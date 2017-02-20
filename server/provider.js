const Api = require('./api');
const Project = require('./project');

class Provider {

    constructor(config, logger, server) {
        this.config = config;
        this.logger = logger;
        this.server = server;
        this.api = new Api(config, logger);
        this.projects = [];
        this.subscription = null;
    }

    start() {
        this.logger.info('[provider] starting provider...');
        this.projects = this.config.projects.map(projectId => new Project(this, projectId, this.config));

        setInterval(this.refresh.bind(this), this.config.refreshInterval || 8000);
        this.refresh();

        this.server.on('connection', this.onConnection.bind(this));
    }

    stop() {
        this.logger.info('[provider] stopping provider...');
        if (this.subscription) {
            clearInterval(this.subscription);
            this.subscription = null;
        }
    }

    refresh() {
        Promise.all(this.projects.map(project => project.refresh()))
            .then(() => this.server.send(this.state));
    }

    get state() {
        return {
            projects: this.projects
                .map(project => project.state)
                .filter(project => project !== null)
        };
    }

    onConnection(socketId) {
        this.server.sendToSocket(socketId, this.state);
    }
}

module.exports = Provider;
