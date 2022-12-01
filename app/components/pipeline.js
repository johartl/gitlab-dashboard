import Vue from 'vue';
import speedDate from 'speed-date';

const dateFormatter = speedDate('HH:mm - dddd D.M.');

Vue.component('pipeline', {
    props: ['pipeline'],
    template: `
        <div class="pipeline" v-bind:class="'status-' + pipeline.status">
            <div class="pipeline-header">
                <div class="pipeline-tag" v-if="pipeline.tag">
                    <i class="fa fa-tags" aria-hidden="true"></i>
                    Tag
                </div>
                <div class="pipeline-ref">{{ pipeline.ref }}</div>
                <div class="pipeline-commit-title">
                    <a v-bind:href="pipeline.webUrl" target="_blank">{{ pipeline.commitTitle }}</a>
                </div>
                <div class="pipeline-date">{{ pipelineCreated }}</div>
            </div>

            <div class="pipeline-row">
                <user-badge v-bind:user="pipeline.user" v-bind:avatar="pipeline.userAvatar"></user-badge>
                <div class="pipeline-info">
                    <div class="pipeline-status" v-bind:class="'status-' + pipeline.status">
                        {{ pipeline.status }}
                    </div>
                    <div class="pipeline-commit-hash">
                        <a v-bind:href="pipeline.webUrl" target="_blank">{{ pipeline.commitHash }}</a>
                    </div>
                    <div v-if="pipeline.status === 'success'" class="pipeline-commit-hash">
                        <img src="unicorn.gif" width="100" height="100">
                    </div>
                </div>
                <div class="stage-list">
                    <stage v-for="stage in pipeline.stages" v-bind:stage="stage[0]" v-bind:builds="stage[1]"></stage>
                    <div v-if="pipeline.stages.length === 0" class="no-pipelines-text">
                        No pipeline information available
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        pipelineCreated: function() {
            return dateFormatter(new Date(this.pipeline.createdAt));
        }
    }
});
