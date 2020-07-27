/**
 * Copy or move this file to config.js and adjust the options below.
 */

module.exports = {
    log: {
        level: 'info',
        colors: true,
        file: 'server.log'
    },
    server: {
        port: '5000',
        host: '0.0.0.0'
    },
    provider: {
        gitlabEndpoint: 'http://gitlab.example.com',
        gitlabToken: 'AccessTokenFromGitlab',
        refreshDelayMs: 10000, // 10 sec
        maxConcurrentApiRequests: 6,  // set to null to disable limit
        projects: {
            'group/project': /branch regex/
        }
    }
};
