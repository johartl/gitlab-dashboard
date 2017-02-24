import Vue from 'vue';

Vue.component('project', {
    props: ['project'],
    template: `
        <div v-if="project" class="project">
            <div class="project-name">
                <a v-bind:href="project.webUrl" target="_blank">{{ project.name }}</a>
            </div>
            <div class="branch-list" v-bind:style="columnStyle">
                <branch v-for="branch in branches"
                    v-bind:branch="branch[0]" v-bind:pipelines="branch[1]">
                </branch>
            </div>
        </div>
    `,
    computed: {
        branches: function() {
            const branchesCount = this.$root.settings.branchesCount;
            return this.project.branches.slice(0, branchesCount);
        },
        columnStyle: function() {
            return {
                'column-count': this.$root.settings.columnCount,
                '-webkit-column-count': this.$root.settings.columnCount,
                '-moz-column-count': this.$root.settings.columnCount,
            };
        }
    }
});
