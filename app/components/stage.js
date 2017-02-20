import Vue from 'vue';

Vue.component('stage', {
    props: ['stage', 'builds'],
    template: `
        <div class="stage">
            <div class="stage-info">
                <div class="stage-name">{{ stage }}</div>
            </div>
            <div class="build-list">
                <build v-for="build in builds" v-bind:build="build"></build>
            </div>
        </div>
    `
});
