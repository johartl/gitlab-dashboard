const SETTINGS_KEY = 'dashboard_settings';
const SETTINGS_VERSION = '2017-02-18';

const SETTINGS_DEFAULT = {
    branchesCount: 4,
    pipelineHistoryCount: 2,
    includeLatestPipelineInHistory: false,
    columnCount: 1
};

export class Settings {

    constructor() {
        this.settings = this.getStoredSettings() || SETTINGS_DEFAULT;
    }

    getStoredSettings() {
        let storedSettings = localStorage.getItem(SETTINGS_KEY);
        try {
            storedSettings = JSON.parse(storedSettings);
            if (storedSettings.version === SETTINGS_VERSION) {
                return Object.assign({}, SETTINGS_DEFAULT, storedSettings);
            }
        } catch (err) {}

        this.clearSettings();
        return null;
    }

    storeSettings() {
        const settings = Object.assign({}, this.settings, {version: SETTINGS_VERSION});
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    }

    clearSettings() {
        localStorage.removeItem(SETTINGS_KEY);
    }

    get branchesCount() {
        return this.settings.branchesCount;
    }

    set branchesCount(branchesCount) {
        if (typeof branchesCount !== 'number' || branchesCount < 1 || branchesCount > 16) {
            throw new Error(`Invalid value for setting branchesCount: ${branchesCount}`);
        }
        this.settings.branchesCount = branchesCount;
        this.storeSettings();
    }

    get pipelineHistoryCount() {
        return this.settings.pipelineHistoryCount;
    }

    set pipelineHistoryCount(pipelineHistoryCount) {
        if (typeof pipelineHistoryCount !== 'number' || pipelineHistoryCount < 0 || pipelineHistoryCount > 16) {
            throw new Error(`Invalid value for setting pipelineHistoryCount: ${pipelineHistoryCount}`);
        }
        this.settings.pipelineHistoryCount = pipelineHistoryCount;
        this.storeSettings();
    }

    get includeLatestPipelineInHistory() {
        return this.settings.includeLatestPipelineInHistory;
    }

    set includeLatestPipelineInHistory(includeLatestPipelineInHistory) {
        if (typeof includeLatestPipelineInHistory !== 'boolean') {
            throw new Error(`Invalid value for setting includeLatestPipelineInHistory: ${includeLatestPipelineInHistory}`);
        }
        this.settings.includeLatestPipelineInHistory = includeLatestPipelineInHistory;
        this.storeSettings();
    }

    get columnCount() {
        return this.settings.columnCount;
    }

    set columnCount(columnCount) {
        if (typeof columnCount !== 'number' || columnCount < 1 || columnCount > 4) {
            throw new Error(`Invalid value for setting columnCount: ${columnCount}`);
        }
        this.settings.columnCount = columnCount;
        this.storeSettings();
    }
}
