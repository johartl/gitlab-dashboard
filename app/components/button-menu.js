import Vue from 'vue';

Vue.component('button-menu', {
    template: `
        <div class="button-menu">
            <div class="fab-container">
               <div class="options-fab" v-on:click="toggleSettings()">
                   <i class="fa fa-sliders" aria-hidden="true"></i>
               </div>
            </div>
            <settings-menu v-bind:visible="showSettings" v-on:close="closeSettings()"></settings-menu>
        </div>
    `,
    data() {
        return {
            showSettings: false
        }
    },
    methods: {
        toggleSettings: function() {
            this.showSettings = !this.showSettings;
        },
        closeSettings: function() {
            this.showSettings = false;
        }
    }
});
