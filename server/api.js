const request = require('request-promise-native');

class Api {

    constructor(config, logger) {
        this.endpoint = config.gitlabEndpoint;
        this.token = config.gitlabToken;
        this.logger = logger;
    }

    get(uri) {
        this.logger.debug(`[provider] GET ${uri}`);
        return request({
            uri: this.endpoint + uri,
            json: true,
            headers: {
                'PRIVATE-TOKEN': this.token
            }
        }).catch(err => this.errorHandler(err));
    }

    getProject(projectId) {
        if (typeof projectId === 'string') {
            projectId = encodeURIComponent(projectId);
        }
        return this.get(`/api/v3/projects/${projectId}`);
    }

    getBuilds(projectId, count = 100) {
        let promises = [];
        for (let page = 1; page <= Math.ceil(count / 100); page++) {
            promises.push(this.get(`/api/v3/projects/${projectId}/builds?per_page=100&page=${page}`));
        }
        return Promise.all(promises).then(this.mergeResponses);
    }

    getPipelines(projectId, count = 100) {
        let promises = [];
        for (let page = 1; page <= Math.ceil(count / 100); page++) {
            promises.push(this.get(`/api/v3/projects/${projectId}/pipelines?per_page=100&page=${page}`));
        }
        return Promise.all(promises).then(this.mergeResponses);
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
