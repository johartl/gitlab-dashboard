import Vue from 'vue';
import rangeSlider from 'rangeslider-pure';

Vue.component('settings-menu', {
    props: ['visible'],
    template: `
        <div class="settings-menu" v-bind:style="{display: visible ? 'inline-block' : 'none'}">
            
            <div class="settings-close" v-on:click="$emit('close')">
                <i class="fa fa-remove" aria-hidden="true"></i>
            </div>
            
            <div class="settings-triangle"></div>
            
            <div class="settings-item">
                <div class="settings-header">Branches</div>
                <div class="settings-description">
                    The maximum number of recent branches to show for each project.
                </div>
                <div class="settings-setter">
                    <div class="settings-input-range">
                        <input type="range" min="1" max="16" step="1" v-model.number="branchesCount">
                    </div>
                    <div class="settings-value">
                        {{ branchesCount }}
                    </div>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-header">Pipeline History</div>
                <div class="settings-description">
                    The maximum number of recent pipeline builds to show for each branch.
                </div>
                <div class="settings-setter">
                    <div class="settings-input-range">
                        <input type="range" min="0" max="16" step="1" v-model.number="pipelineHistoryCount">
                    </div>
                    <div class="settings-value">
                        {{ pipelineHistoryCount || 'off' }}
                    </div>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-header">Columns</div>
                <div class="settings-description">
                    Splits the layout into multiple columns.
                </div>
                <div class="settings-setter">
                    <div class="settings-input-range">
                        <input type="range" min="1" max="4" step="1" v-model.number="columnCount">
                    </div>
                    <div class="settings-value">
                        {{ columnCount }}
                    </div>
                </div>
            </div>
            
            <div class="settings-item">
                <div class="settings-header">Include latest build in history</div>
                <div class="settings-description">
                    Whether to include or skip the most recent build in the branch build history.
                </div>
                <div class="settings-setter">
                    <div class="settings-input-toggle">
                        <div class="onoffswitch">
                            <input type="checkbox" name="onoffswitch" class="onoffswitch-checkbox"  
                            v-model="includeLatestPipelineInHistory" id="include-pipeline-toggle">
                            <label class="onoffswitch-label" for="include-pipeline-toggle"></label>
                        </div>
                    </div>
                    <div class="settings-value">
                        {{ includeLatestPipelineInHistory ? 'yes' : 'no' }}
                    </div>
                </div>
            </div>
        
        </div>
    `,
    data() {
        const settings = this.$root.settings;

        return {
            columnCount: settings.columnCount,
            branchesCount: settings.branchesCount,
            pipelineHistoryCount: settings.pipelineHistoryCount,
            includeLatestPipelineInHistory: settings.includeLatestPipelineInHistory
        }
    },
    watch: {
        columnCount: function(val, oldVal) {
            this.$root.settings.columnCount = val;
        },
        branchesCount: function(val, oldVal) {
            this.$root.settings.branchesCount = val;
        },
        pipelineHistoryCount: function(val, oldVal) {
            this.$root.settings.pipelineHistoryCount = val;
        },
        includeLatestPipelineInHistory: function(val, oldVal) {
            this.$root.settings.includeLatestPipelineInHistory = val;
        }
    },
    mounted() {
        const sliders = this.$el.querySelectorAll('input[type="range"]');
        rangeSlider.create(sliders);
    }
});
