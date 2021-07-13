const EventEmitter = require('tiny-emitter');

class Project extends EventEmitter {

    constructor(provider, projectId, config, branchRegEx) {
        super();
        this.provider = provider;
        this.projectId = projectId;
        this.config = config;
        this.branchRegEx = branchRegEx;
        this.project = null;
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
        if (!this.projectData) return this.initializeProject().then(this.updateRefs.bind(this));
        return this.updateRefs();
    }

    updateRefs() {
        const fetchBranches = this.provider.api.getBranches(this.projectData.id);
        const fetchTags     = this.provider.api.getTags    (this.projectData.id);
        return Promise.all([fetchBranches, fetchTags]).then(([branches, tags]) => {
            this.provider.logger.debug(`[project] ${this.project.name} - refi:`, branches.map(e => e.name).join(', '));
            let refs =
                branches.map(e => [e.name, e.commit.committed_date]).concat(
                tags.map(e => [e.name, e.commit.committed_date]));
            refs = refs.filter(x => this.branchRegEx.test(x[0]));
            refs.sort((a, b) => new Date(b[1]) - new Date(a[1]));
            refs = refs.slice(0, 16).map(x => x[0]);
            this.provider.logger.debug(`[project] ${this.project.name} - refs:`, refs.join(', '));
            return this.updatePipelines(refs);
        });
   }

    updatePipelines(refs) {
        return Promise.all(refs.map(ref =>
            this.provider.api.getPipelines(this.projectData.id, ref).then(pipelines =>
                Promise.all(pipelines.map(pipeline =>
                    Promise.all([
                        this.provider.api.getPipeline(this.projectData.id, pipeline.id),
                        this.provider.api.getJobs    (this.projectData.id, pipeline.id)
                    ]).then(([pipelineData, jobs]) => this.reformatPipeline(pipelineData, jobs))
                )).then(pipelines => [ref, pipelines])
            )
        )).then(branches => {
            this.project.branches = branches.filter(b => b[1].length > 0);
        });
    }

    reformatPipeline(pipelineData, jobs) {
        let pipeline = {
            ref:         pipelineData.ref,
            status:      pipelineData.status,
            tag:         pipelineData.tag,
            commitHash:  pipelineData.sha.substring(0, 8),
            createdAt:   new Date(pipelineData.created_at),
            startedAt:   pipelineData.started_at  ? new Date(pipelineData.started_at) : null,
            finishedAt:  pipelineData.finished_at ? new Date(pipelineData.finished_at) : null,
            user:        pipelineData.user.name,
            userAvatar:  pipelineData.user.avatar_url,
            commitTitle: null,
            stages:      [],
            webUrl:      `${this.projectData.web_url}/pipelines/${pipelineData.id}`
        };

        // separate jobs in stages
        let stagesMap = {};
        jobs.forEach(jobData => {
            pipeline.commitTitle = jobData.commit.title;

            let job = {
                name:       jobData.name,
                createdAt:  new Date(jobData.created_at),
                startedAt:  jobData.started_at  ? new Date(jobData.started_at) : null,
                finishedAt: jobData.finished_at ? new Date(jobData.finished_at) : null,
                status:     jobData.status,
                stage:      jobData.stage,
                webUrl:     `${this.projectData.web_url}/builds/${jobData.id}`
            };
            stagesMap[job.stage] = (stagesMap[job.stage] || []).concat(job);
        });

        pipeline.stages = Object.keys(stagesMap).map(stage => [stage, stagesMap[stage]]);

        // remove duplicate jobs in stage
        let stageCreatedAt = {};
        pipeline.stages.forEach(([stage, jobs]) => {
            let oldest = null;
            for (let i = 0 ; i < jobs.length ; ++i) {
                let createdAt = jobs[i].createdAt;
                let name      = jobs[i].name;
                if (!oldest || oldest > createdAt) oldest = createdAt;
                for (let j = 0 ; j < i ; ++j) {
                    if (jobs[j].name === name) {
                        if (createdAt < jobs[j].createdAt) jobs.splice(i, 1);
                        else                               jobs.splice(j, 1);
                        --i;
                        break;
                    }
                }
            }
            jobs.sort((a, b) => a.name.localeCompare(b.name));
            stageCreatedAt[stage] = oldest;
        });

        // sort stages
        pipeline.stages.sort((a, b) => stageCreatedAt[a[0]] - stageCreatedAt[b[0]]);

        return pipeline;
    }

}

module.exports = Project;
