import TestRailAPI from './TestRailAPI.js';
import FieldReader from './FieldReader.js';
import TestCaseStatus from './TestCaseStatus.js';
export default class TestCaseReader {
    constructor() {
        this.testRailAPI = new TestRailAPI();
        this.fieldReader = new FieldReader();
        this.testCaseStatus = new TestCaseStatus();
        this.groups = [];
    }
    async read(tabConfig) {
        let testCases = await this.testRailAPI.getTestCases(tabConfig.project_id, tabConfig.suite_id, tabConfig.filters);
        let sections = await this.testRailAPI.getSections(tabConfig.project_id, tabConfig.suite_id);
        let fields = await this.fieldReader.getFields();
        testCases = this.addSectionsInfoToTestCases(testCases, sections);
        testCases = await this.setValuesToLabelsInTestCases(testCases, fields);
        testCases = this.testCaseStatus.addStatusToTestCases(testCases, tabConfig);
        if (tabConfig.group_by) testCases = this.groupTestCases(testCases, tabConfig.group_by);
        if (!tabConfig.show_without_group) testCases = this.removeWithEmptyGroup(testCases, tabConfig.group_by);
        if (tabConfig.group_by) await this.getGroups(testCases, fields, tabConfig.group_by);
        console.log(`${testCases.length} test-cases found for ${tabConfig.name} tab`);
        return testCases;
    }
    async getGroups(testCases, fields, group_by) {
        this.groups = [];
        let field = await fields.find(x => x.system_name === group_by);
        if (field.options) this.groups = Object.values(field.options);
        else for (const testCase of testCases)
            if (testCase[group_by] && testCase[group_by] != "" && !this.groups.includes(testCase[group_by])) {
                let groupSplit = testCase[group_by].split("#");
                let groupName = groupSplit[0].trim();
                //if (groupSplit.length > 1) let groupTags = groupSplit.slice(1);
                this.groups.push(groupName);
            }
    }
    groupTestCases(testCases, group_by) {
        if (group_by)
            testCases = testCases.sort(
                (a, b) => {
                    const aValue = a[group_by] || "";
                    const bValue = b[group_by] || "";
                    return aValue.toString().localeCompare(bValue.toString());
                }
            );
        return testCases;
    }
    removeWithEmptyGroup(testCases, group_by) {
        let testCasesCleared = [];
        for (const testCase of testCases)
            if (testCase[group_by] && testCase[group_by] != "")
                testCasesCleared.push(testCase);
        return testCasesCleared;
    }
    addSectionsInfoToTestCases(testCases, sections) {
        for (let i = 0; i < testCases.length; i++) {
            testCases[i].section = sections.find(x => x.id === testCases[i].section_id);
        }
        return testCases;
    }
    async setValuesToLabelsInTestCases(testCases, fields) {
        for (let i = 0; i < testCases.length; i++) {
            let properties = Object.keys(testCases[i]);
            for (let j = 0; j < properties.length; j++) {
                let field = await fields.find(x => x.system_name === properties[j]);
                if (field && field.options) {
                    let key = testCases[i][properties[j]];
                    let label = field.options[key];
                    testCases[i][properties[j]] = label;
                }
            }
        }
        return testCases;
    }
}