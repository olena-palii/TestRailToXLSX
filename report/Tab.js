export default class Tab {
    constructor(name) {
        this.name = name;
        this.content = [];
    } 
    addResult(result) {
        for (let i = 0; i < result.length; i++) this.content.push([...result[i]]);
    }
}