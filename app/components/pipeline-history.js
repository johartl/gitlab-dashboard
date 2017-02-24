import Vue from 'vue';
import speedDate from 'speed-date';

const dateFormatter = speedDate('HH:mm - dd D. M.');

Vue.component('pipeline-history', {
    props: ['pipelines'],
    template: `
        <div class="pipeline-history">
                
            <div v-for="pipeline in pipelines" class="ps-row">
                <div class="ps-status" v-bind:class="'status-' + pipeline.status">{{ pipeline.status }}</div>
                <div class="ps-commit-hash">{{ pipeline.commitHash }}</div>
                <div class="ps-user">{{ firstName(pipeline.user) }}</div>
                <div class="ps-date">{{ formatDate(pipeline.createdAt) }}</div>
                <div class="ps-commit-title">
                    <a v-bind:href="pipeline.webUrl" target="_blank">{{ pipeline.commitTitle }}</a>
                </div>
                <div class="ps-stages">
                    <div v-for="stage in pipeline.stages" class="ps-stage" 
                        v-bind:class="'status-' + stageStatus(stage[1])">
                        {{ stage[0] }}
                    </div>
                </div>
            </div>

        </div>
    `,
    methods: {
        stageStatus: function (builds) {
            if (!builds) {
                return 'unknown';
            }
            let failed = false;
            let success = false;
            let canceled = false;
            let running = false;
            let pending = false;
            let skipped = false;
            builds.forEach(build => {
                failed |= build.status === 'failed';
                success |= build.status === 'success';
                canceled |= build.status === 'canceled';
                running |= build.status === 'running';
                pending |= build.status === 'pending';
                skipped |= build.status === 'skipped';
            });
            return failed ? 'failed' : canceled ? 'canceled' : success ? 'success' : running ? 'running' :
                            pending ? 'pending' : skipped ? 'skipped' : 'unknown';
        },
        firstName: function (user) {
            return user.split(' ')[0];
        },
        formatDate: function (dateString) {
            return dateFormatter(new Date(dateString));
        }
    }
});
