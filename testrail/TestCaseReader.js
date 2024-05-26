import TestRailAPI from './TestRailAPI.js';
export default class TestCaseReader {
    constructor() {
        this.testRailAPI = new TestRailAPI();
    }
    async read(config) {
        let testCases = await this.testRailAPI.getTestCases(config.project_id, config.suite_id, config.filters);
        let sections = await this.testRailAPI.getSections(config.project_id, config.suite_id);
        testCases = this.groupTestCases(testCases, config.group_by);
        testCases = this.addSectionsInfoToTestCases(testCases, sections);
        console.log(`${testCases.length} test-cases found for ${config.name} tab`);
        return testCases;
    }
    groupTestCases(testCases, group_by) {
        if (group_by)
            testCases = testCases.sort(
                (a, b) => { if (a[group_by]) a[group_by].toString().localeCompare(b[group_by]) }
            );
        return testCases;
    }
    addSectionsInfoToTestCases(testCases, sections) {
        for (let i = 0; i < testCases.length; i++) {
            testCases[i].section = sections.find(x => x.id === testCases[i].section_id);
        }
        return testCases;
    }
}