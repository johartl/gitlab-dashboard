import Vue from 'vue';

Vue.component('loading-indicator', {
    props: ['message'],
    template: `
        <div class="loading-indicator">
            <div class="sk-folding-cube">
              <div class="sk-cube1 sk-cube"></div>
              <div class="sk-cube2 sk-cube"></div>
              <div class="sk-cube4 sk-cube"></div>
              <div class="sk-cube3 sk-cube"></div>
            </div>
            <div class="message" v-if="message">
                {{ message }}
            </div>
        </div>
    `
});
