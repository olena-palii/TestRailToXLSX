import Tab from './Tab.js';

export default class Report {
  constructor(name) {
    this.name = name ? name : "";
    this.tabs = [];
  }
  addTab(tabName) {
    this.tabs.push(new Tab(tabName));
  }
  addResult(result) {
    this.tabs[this.tabs.length - 1].addResult(result);
  }
}