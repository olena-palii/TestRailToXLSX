import TestRailAPI from './TestRailAPI.js';
export default class TestCaseReader {
    constructor() {
    }
    async read(config) {
        let testRailAPI = new TestRailAPI();
        let testCases = await testRailAPI.getTestCases(config.project_id, config.suite_id, config.filters);
        let sections = await testRailAPI.getSections(config.project_id, config.suite_id);
        testCases = this.groupTestCases(testCases, config.group_by);
        testCases = this.addSectionsInfoToTestCases(testCases, sections);
        return testCases;
    }
    groupTestCases(testCases, group_by) {
        if (group_by)
            testCases = testCases.sort(
                (a, b) => a[group_by].toString().localeCompare(b[group_by])
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