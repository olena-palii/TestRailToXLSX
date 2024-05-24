import Config from '../config/Config.js';
import TestRailAPI from '../testrail/TestRailAPI.js';
import Report from './Report.js';
import ReportWriterXLSX from './ReportWriterXLSX.js';
export default class ReportGenerator {
    constructor() {
    }
    async generate(name) {
        this.report = new Report(name);
        let testRailAPI = new TestRailAPI();
        let tabConfigs = Config.report;
        for (const tabConfig of tabConfigs) {
            let testCases = await testRailAPI.getTestCases(tabConfig.project_id, tabConfig.suite_id, tabConfig.filters);
            this.report.addTab(tabConfig.name);
            let result = [["result"]]; //need to convert test-cases to result here
            this.report.addResult(result);
        }
    }
    saveToXLSX() {
        let reportWriterXLSX = new ReportWriterXLSX(this.report.name);
        for (const tab of this.report.tabs)
            reportWriterXLSX.addTabToFile(tab.content, tab.name);
    }
}