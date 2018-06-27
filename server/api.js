const request = require('request-promise-native');

class Api {

    constructor(config, logger) {
        this.endpoint = config.gitlabEndpoint;
        this.token = config.gitlabToken;
        this.logger = logger;
        this.requestQueue = [];
        this.queueSpots = config.maxConcurrentApiRequests;
    }

    queueRequest(requestCall) {
        return new Promise((resolve, reject) => {
            const request = () => requestCall().then(resolve).catch(reject).finally(() => {
                if (this.requestQueue.length > 0) {
                    this.requestQueue.pop()();
                } else if (this.queueSpots !== null) {
                    this.queueSpots++;
                }
            });
            if (this.queueSpots === null) {
                request();
            } else if (this.queueSpots > 0) {
                this.queueSpots--;
                request();
            } else {
                this.requestQueue.push(request);
                if (this.requestQueue % 100 === 0) {
                    this.logger.warn(`[provider] API request queue size: ${this.requestQueue.length}`);
                }
            }
        });
    }

    get(uri) {
        return this.queueRequest(() => {
            this.logger.debug(`[provider] GET ${uri}`);
            return request({
                uri: this.endpoint + uri,
                json: true,
                headers: {
                    'PRIVATE-TOKEN': this.token
                }
            });
        }).catch(err => this.errorHandler(err));
    }

    getProject(projectId) {
        if (typeof projectId === 'string') {
            projectId = encodeURIComponent(projectId);
        }
        return this.get(`/api/v4/projects/${projectId}`);
    }

    getBuilds(projectId, count = 100) {
        let promises = [];
        for (let page = 1; page <= Math.ceil(count / 100); page++) {
            promises.push(this.get(`/api/v4/projects/${projectId}/jobs?per_page=100&page=${page}`));
        }
        return Promise.all(promises).then(this.mergeResponses);
    }

    getPipelines(projectId, count = 100) {
        let promises = [];
        for (let page = 1; page <= Math.ceil(count / 100); page++) {
            promises.push(this.get(`/api/v4/projects/${projectId}/pipelines?per_page=100&page=${page}`));
        }
        return Promise.all(promises).then(this.mergeResponses);
    }

    getPipeline(projectId, pipelineId) {
        return this.get(`/api/v4/projects/${projectId}/pipelines/${pipelineId}`);
    }

    mergeResponses(responses) {
        return [].concat(...responses);
    }

    errorHandler(err) {
        this.logger.error(`[provider] ${err.message}`);
        return Promise.reject(err);
    }

}

module.exports = Api;
