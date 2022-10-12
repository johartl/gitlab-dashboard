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
        const fetchBranches      = this.provider.api.getBranches     (this.projectData.id);
        const fetchTags          = this.provider.api.getTags         (this.projectData.id);
        const fetchMergeRequests = this.provider.api.getMergeRequests(this.projectData.id);
        return Promise.all([fetchBranches, fetchTags, fetchMergeRequests]).then(([branches, tags, mergeRequests]) => {
            let refs = Array.prototype.concat(
                branches     .map(e => [e.name, e.commit.committed_date]),
                tags         .map(e => [e.name, e.commit.committed_date]));
            refs = refs.filter(x => this.branchRegEx.test(x[0]));
            refs.sort((a, b) => new Date(b[1]) - new Date(a[1]));
            refs = refs.slice(0, 16);

            let mergeRefs = {};
            mergeRequests.forEach(e => {
                if (e.source_branch in mergeRefs) {
                    mergeRefs[e.source_branch].push('refs/merge-requests/' + e.iid + '/head');
                } else {
                    mergeRefs[e.source_branch] = ['refs/merge-requests/' + e.iid + '/head'];
                }
            });

            refs = refs.map(x => {
                if (x[0] in mergeRefs) {
                    return [x[0], mergeRefs[x[0]].concat(x[0])];
                } else {
                    return [x[0], [x[0]]];
                }
            });

            this.provider.logger.debug(`[project] ${this.project.name} - refs:`, refs.map(x => x[1].join(', ')).join(', '));
            return this.updatePipelines(refs);
        });
   }

    updatePipelines(refs) {
        return Promise.all(refs.map(ref =>
            Promise.all(ref[1].map(r =>
                this.provider.api.getPipelines(this.projectData.id, r).then(pipelines =>
                    Promise.all(pipelines.map(pipeline =>
                        Promise.all([
                            this.provider.api.getPipeline(this.projectData.id, pipeline.id),
                            this.provider.api.getJobs    (this.projectData.id, pipeline.id)
                        ]).then(([pipelineData, jobs]) => this.reformatPipeline(pipelineData, jobs, ref[0]))
                    ))
                )
            )).then(pipelines => {
                pipelines = pipelines.reduce((a, b) => a.concat(b), []);
                pipelines.sort((a, b) => b.createdAt - a.createdAt);
                pipelines = pipelines.slice(0, 16);
                return [ref[0], pipelines];
            })
        )).then(branches => {
            this.project.branches = branches.filter(b => b[1].length > 0);
        });
    }

    reformatPipeline(pipelineData, jobs, ref) {
        let pipeline = {
            ref:         ref,
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

        // calc stage ordering
        let stageCreatedAt = {};
        pipeline.stages.forEach(([stage, jobs]) => {
            let oldest = null;
            for (let i = 0 ; i < jobs.length ; ++i) {
                let createdAt = jobs[i].createdAt;
                let name      = jobs[i].name;
                if (!oldest || oldest > createdAt) oldest = createdAt;

                // remove duplicate jobs in stage
//                for (let j = 0 ; j < i ; ++j) {
//                    if (jobs[j].name === name) {
//                        if (createdAt < jobs[j].createdAt) jobs.splice(i, 1);
//                        else                               jobs.splice(j, 1);
//                        --i;
//                        break;
//                    }
//                }
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
