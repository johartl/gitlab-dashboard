import Vue from 'vue';

import {WebSocketClient} from '../services/websocket-client';
import {Settings} from '../services/settings';

import './build';
import './branch';
import './loading-indicator';
import './running-indicator';
import './project';
import './pipeline';
import './pipeline-history';
import './settings-menu';
import './stage';
import './button-menu';
import './user-badge';

const MESSAGE_CONNECTING = 'Connecting to server...';
const MESSAGE_LOADING_DATA = 'Loading data from server...';


const app = new Vue({
    el: '#app',
    data: {
        projects: [],
        loading: true,
        loadingMessage: null,
        websocket: new WebSocketClient(),
        settings: new Settings()
    },
    template: `
        <div id="app">
            <loading-indicator v-if="loading" v-bind:message="loadingMessage"></loading-indicator>
            <div id="content" v-bind:class="{loading: loading}">
                <project v-for="project in projects" v-bind:project="project"></project>
                <button-menu></button-menu>
            </div>
        </div>
    `,
    created: function() {
        this.websocket.connect();
        this.loading = true;
        this.loadingMessage = MESSAGE_CONNECTING;

        this.websocket.on('message', data => {
            if (data && data.projects && data.projects.length > 0) {
                this.loading = false;
                this.projects = data.projects;
            } else {
                this.loading = true;
                this.loadingMessage = MESSAGE_LOADING_DATA;
            }
        });

        this.websocket.on('disconnect', () => {
            this.loading = true;
            this.loadingMessage = MESSAGE_CONNECTING;
        });
    }
});
