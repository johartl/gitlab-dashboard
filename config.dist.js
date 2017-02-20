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
        refreshInterval: 8000,
        fetchPipelines: 100,
        fetchBuilds: 500,

        projects: [
            'group/project'
        ]
    }
};
