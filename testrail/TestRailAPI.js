import Config from '../config/Config.js';
import https from 'https';
export default class TestRailAPI {
    constructor() {
    }
    async getTestCases(project_id, suite_id, filters) {
        let path = `/index.php?/api/v2/get_cases/${project_id}&suite_id=${suite_id}${filters}`;
        let data = await this.get(path);
        return JSON.parse(data).cases;
    }
    async getSections(project_id, suite_id) {
        let path = `/index.php?/api/v2/get_sections/${project_id}&suite_id=${suite_id}`;
        let data = await this.get(path);
        return JSON.parse(data).sections;
    }
    async getSupportedFields() {
        let path = `/index.php?/api/v2/get_case_fields`;
        let data = await this.get(path);
        return JSON.parse(data);
    }
    async get(path) {
        var auth = 'Basic ' + Buffer.from(Config.testrail.login + ':' + Config.testrail.apiKey).toString('base64');
        var options = {
            hostname: Config.testrail.baseURL,
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': auth
            }
        };
        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                console.log(`${options.method} https://${options.hostname}${options.path} responded`, res.statusCode);
                res.setEncoding('utf8');
                let body = '';
                res.on('data', chunk => body += chunk);
                res.on('end', () => {
                    resolve(body);
                });
            });
            req.on('error', (e) => {
                console.error(e.message);
            });
            req.end();
        });
    }
}