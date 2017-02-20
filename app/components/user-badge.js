import Vue from 'vue';

Vue.component('user-badge', {
    props: ['user', 'avatar'],
    template: `
        <div class="user-badge">
            <img v-bind:src="avatar">
            <div class="user-name">{{ firstName }}</div>
        </div>
    `,
    computed: {
        firstName: function() {
            return this.user.split(' ')[0];
        }
    }
});
