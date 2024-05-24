import ReportGenerator from './report/ReportGenerator.js';
let reportGenerator = new ReportGenerator();
await reportGenerator.generate("Report");
reportGenerator.saveToXLSX();