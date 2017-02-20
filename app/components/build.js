import Vue from 'vue';

Vue.component('build', {
    props: ['build'],
    template: `
        <div class="build" v-bind:class="'status-' + build.status">
            <running-indicator v-if="build.status === 'running'"></running-indicator>
            <div class="build-name">
                <a v-bind:href="build.webUrl" target="_blank">{{ build.name }}</a>
            </div>
            <div class="build-duration">{{ duration() }}</div>
        </div>
    `,
    data() {
        return {
            now: new Date(),
            durationUpdate: null
        }
    },
    updated: function() {
        this.checkDurationUpdate();
    },
    mounted: function() {
        this.checkDurationUpdate();
    },
    beforeDestroyed: function() {
        this.stopDurationUpdate();
    },
    methods: {
        duration: function() {
            if (!this.build.startedAt) {
                return null;
            } else if (!this.build.finishedAt) {
                return formatTime(new Date(this.build.startedAt), this.now);
            } else {
                return formatTime(new Date(this.build.startedAt), new Date(this.build.finishedAt));
            }
        },
        checkDurationUpdate: function() {
            if (this.build.startedAt && !this.build.finishedAt) {
                this.startDurationUpdate();
            } else {
                this.stopDurationUpdate();
            }
        },
        startDurationUpdate: function() {
            if (this.durationUpdate) {
                return;
            }
            this.durationUpdate = setInterval(() => {
                this.now = new Date();
            }, 1000);
        },
        stopDurationUpdate: function() {
            clearInterval(this.durationUpdate);
            this.durationUpdate = null;
        }
    }
});

function formatTime(fromDate, toDate) {
    let secondsPassed = Math.ceil((toDate.getTime() - fromDate.getTime()) / 1000);

    let seconds = secondsPassed % 60;
    let minutes = Math.floor(secondsPassed / 60 % 60);
    let hours = Math.floor(secondsPassed / 3600);

    if (secondsPassed === 0) {
        return null;
    } else if (minutes === 0) {
        return `${secondsPassed}s`;
    } else if(hours === 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${hours}h ${minutes}m ${seconds}s`;
    }
}
