# TestRail To XLSX

Get data from TestRail API and export to XLSX.

## Project installation

1. Install Node.js on PC
2. Install Visual Studio Code (VSC) and recommended extensions: Babel JavaScript, JavaScript (ES6), Code Runner, Office Viewer(Markdown Editor)
3. Clone git repository and open in VSC
4. Open terminal in VSC and run “npm install --save-dev” command
5. Now you can open Main.js file and run

## TestRail settings

1. Enable API on ADMINISTRATION - Site Settings - API page
2. Generate API key on My Settings - API KEYS page

## Project configs

### testrail.json

* baseURL - base url of TestRail in "domain.testrail.io" format
* login - login email for which apiKey was generated in TestRail
* apiKey - apiKey generated in TestRail

### report.json

Tab will be generated in XLSX report for every config.

* name - name of tab in XLSX report
* project_id - id of testrail project
* suite_id - id of testrail suite
* filters - every filter must start with "&" and define filtration value, e.g. "&is_deleted=0", you can apply many filters for the same field, e.g. "&priority_id=3,4" will include only test-cases with 3 and 4 priorities
* group_by - test-cases will be grouped by this field
* show_groups - displaing or hiding group names in the report
* sections_max_depth - displaying section name if its depth is less
