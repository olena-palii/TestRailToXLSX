import Config from '../config/Config.js';
export default class StatisticsGenerator {
    constructor() {
    }
    async addStatisticsStatusToTestCases(testCases) {
        let config = Config.statistics.rules;
        let statuses = Object.keys(config);
        for (let i = 0; i < testCases.length; i++) {
            for(const status of statuses){
                let rules = config[status];
                for(const rule of rules){
                    let fields = Object.keys(rule);
                    let isValid = true;
                    for(const field of fields){
                        if(testCases[i][field] != rule[field]) isValid = false;
                    }
                    if(isValid) testCases[i].statistics_status = status;
                }
            }
            if(!testCases[i].statistics_status)
                testCases[i].statistics_status = Config.statistics.skipped_status
        }
        return testCases;
    }
}