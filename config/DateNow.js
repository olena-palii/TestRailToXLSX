export default class DateNow {
    static _instanceCache;
    static get instance() {
        if (!this._instanceCache) this._instanceCache = new this();
        return this._instanceCache;
    }
    constructor() {
    }
    static numberToFixedLength(number, fixedLength) {
        let numberString = number.toString();
        let numberLength = numberString.length;
        if (numberLength < fixedLength) {
            for (let i = 0; i < fixedLength - numberLength; i++) {
                numberString = '0' + numberString;
            }
        }
        return numberString;
    }
    static get yyyy() {
        return new Date().getFullYear();
    }
    static get dd() {
        return this.numberToFixedLength(new Date().getDate(), 2);
    }
    static get mm() {
        return this.numberToFixedLength(new Date().getMonth() + 1, 2);
    }
    static get hh() {
        return this.numberToFixedLength(new Date().getHours(), 2);
    }
    static get mi() {
        return this.numberToFixedLength(new Date().getMinutes(), 2);
    }
    static get ss() {
        return this.numberToFixedLength(new Date().getSeconds(), 2);
    }
    static get ms() {
        return this.numberToFixedLength(new Date().getMilliseconds(), 3);
    }
    static get timestamp() {
        return new Date().getTime();
    }
}