const request = require('request-promise-native');

class Api {

    constructor(config, logger) {
        this.endpoint = config.gitlabEndpoint;
        this.token = config.gitlabToken;
        this.logger = logger;
        this.requestQueue = [];
        this.active = 0;
        this.max = config.maxConcurrentApiRequests;
        this.requestDelayMs = config.requestDelayMs;
    }

    queueRequest(requestCall) {
        return new Promise((resolve, reject) => {
            const request = () => requestCall().then(resolve).catch(reject).finally(() => {
                if (this.requestQueue.length > 0) {
                    if (this.requestDelayMs > 0) {
                        setTimeout(this.requestQueue.pop(), this.requestDelayMs);
                    } else {
                        this.requestQueue.pop()();
                    }
                } else {
                    --this.active;
                }
            });
            if (!this.max) {
                request();
            } else if (this.active < this.max) {
                ++this.active;
                request();
            } else {
                this.requestQueue.push(request);
                if (this.requestQueue % 100 === 0) {
                    this.logger.warn(`[provider] API request queue size: ${this.requestQueue.length}`);
                }
            }
        });
    }

    errorHandler(err) {
        this.logger.error(`[provider] ${err.message}`);
        return Promise.reject(err);
    }

    get(uri) {
        return this.queueRequest(() => {
            this.logger.debug(`[provider] GET ${uri}`);
            return request({
                uri: this.endpoint + uri,
                json: true,
                headers: {
                    'PRIVATE-TOKEN': this.token
                },
                resolveWithFullResponse: true
            });
        }).catch(err => this.errorHandler(err));
    }

    getPaged(uri) {
        const request = (page) => this.get(`${uri}per_page=100&page=${page}`).then(reply => {
            if (reply.body.length > 0) {
                return request(page + 1).then(reply2 => reply.body.concat(reply2));
            } else {
                return reply.body;
            }
        });
        return request(1);
    }

    getProject(projectId) {
        if (typeof projectId === 'string') {
            projectId = encodeURIComponent(projectId);
        }
        return this.get(`/api/v4/projects/${projectId}`).then(x => x.body);
    }

    getBranches(projectId) {
        return this.getPaged(`/api/v4/projects/${projectId}/repository/branches?`);
    }

    getTags(projectId) {
        return this.getPaged(`/api/v4/projects/${projectId}/repository/tags?`);
    }

    getMergeRequests(projectId) {
        return this.getPaged(`/api/v4/projects/${projectId}/merge_requests?`);
    }

    getPipelines(projectId, ref) {
        return this.get(`/api/v4/projects/${projectId}/pipelines?ref=${ref}&per_page=16`).then(reply => reply.body);
    }

    getPipeline(projectId, pipelineId) {
        return this.get(`/api/v4/projects/${projectId}/pipelines/${pipelineId}`).then(reply => reply.body);
    }

    getJobs(projectId, pipelineId) {
        return this.getPaged(`/api/v4/projects/${projectId}/pipelines/${pipelineId}/jobs?include_retried=1&`);
    }

}

module.exports = Api;
