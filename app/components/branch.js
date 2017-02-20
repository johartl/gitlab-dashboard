import Vue from 'vue';

Vue.component('branch', {
    props: ['branch', 'pipelines'],
    template: `
        <div class="branch">
            <pipeline v-bind:pipeline="pipelines[0]"></pipeline>
            <pipeline-history v-bind:pipelines="historyPipelines()" 
                              v-if="historyPipelines().length > 0">
            </pipeline-history>
        </div>
    `,
    methods: {
        historyPipelines: function() {
            const offset = this.$root.settings.includeLatestPipelineInHistory ? 0 : 1;
            const pipelineCount = this.$root.settings.pipelineHistoryCount;
            return this.pipelines.slice(offset, offset + pipelineCount);
        }
    }
});
