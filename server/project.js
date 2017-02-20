const EventEmitter = require('tiny-emitter');

class Project extends EventEmitter {

    constructor(provider, projectId, config) {
        super();
        this.provider = provider;
        this.projectId = projectId;
        this.config = config;
        this.project = null;
        this.branches = [];
    }

    initializeProject() {
        return this.provider.api.getProject(this.projectId).then(projectData => {
            this.projectData = projectData;
            this.project = {
                id: projectData.id,
                name: projectData.name,
                webUrl: projectData.web_url,
                branches: []
            };
        });
    }

    get state() {
        return this.project;
    }

    refresh() {
        if (!this.projectData) {
            return this.initializeProject().then(this.updatePipelines.bind(this));
        }
        return this.updatePipelines();
    }

    updatePipelines() {
        return Promise.all([
            this.provider.api.getPipelines(this.projectData.id, this.config.fetchPipelines || 100),
            this.provider.api.getBuilds(this.projectData.id, this.config.fetchBuilds || 500)
        ]).then(this.onUpdate.bind(this))
    }

    onUpdate([pipelinesData, buildsData]) {
        let branchesMap = {};

        pipelinesData.forEach(pipelineData => {
            let pipeline = {
                ref: pipelineData.ref,
                status: pipelineData.status,
                tag: pipelineData.tag,
                commitHash: pipelineData.sha.substring(0, 8),
                createdAt: new Date(pipelineData.created_at),
                startedAt: pipelineData.started_at ? new Date(pipelineData.started_at) : null,
                finishedAt: pipelineData.finished_at ? new Date(pipelineData.finished_at) : null,
                user: pipelineData.user.name,
                userAvatar: pipelineData.user.avatar_url,
                commitTitle: null,
                stages: [],
                webUrl: `${this.projectData.web_url}/pipelines/${pipelineData.id}`
            };

            let stagesMap = {};
            let commitTitle = null;
            buildsData.filter(buildData => buildData.pipeline.id === pipelineData.id).forEach(buildData => {
                commitTitle = buildData.commit.title;

                let build = {
                    name: buildData.name,
                    createdAt: new Date(buildData.created_at),
                    startedAt: buildData.started_at ? new Date(buildData.started_at) : null,
                    finishedAt: buildData.finished_at ? new Date(buildData.finished_at) : null,
                    status: buildData.status,
                    stage: buildData.stage,
                    webUrl: `${this.projectData.web_url}/builds/${buildData.id}`
                };
                stagesMap[build.stage] = (stagesMap[build.stage] || []).concat(build);
            });

            let stages = Object.keys(stagesMap).map(stage => [stage, stagesMap[stage]]);

            stages.forEach(([stage, builds]) => {
                builds.sort((buildA, buildB) => {
                    return buildA.createdAt.getTime() - buildB.createdAt.getTime();
                });
            });

            stages.sort(([stageA, buildsA], [stageB, buildsB]) => {
                return buildsA[0].createdAt.getTime() - buildsB[0].createdAt.getTime();
            });

            pipeline.stages = stages;
            pipeline.commitTitle = commitTitle;

            branchesMap[pipeline.ref] = (branchesMap[pipeline.ref] || []).concat(pipeline);
        });

        let branches = Object.keys(branchesMap).map(branch => {
            return [branch, branchesMap[branch]];
        });

        branches.sort(([branchA, pipelinesA], [branchB, pipelinesB]) => {
            return pipelinesB[0].createdAt.getTime() - pipelinesA[0].createdAt.getTime();
        });

        this.project.branches = branches;
    }
}

module.exports = Project;
