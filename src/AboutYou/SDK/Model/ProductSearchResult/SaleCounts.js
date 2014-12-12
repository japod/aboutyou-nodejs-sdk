var util = require("util");
var TermsCounts = require('./TermsCounts');

/**
 * @constructor
 */
function SaleCounts(total, other, missing) {
    this.productCountNotInSale = 0;
    this.productCountInSale = 0;

    TermsCounts.call(this, total, other, missing);
};

util.inherits(SaleCounts, TermsCounts);

/**
 * @returns {number}
 */
SaleCounts.prototype.getProductCountInSale = function () {
    return this.productCountInSale;
}

/**
 * @returns {number}
 */
SaleCounts.prototype.getProductCountNotInSale = function () {
    return this.productCountNotInSale;
}

/**
 * @param jsonObject
 *
 * @returns {SaleCounts}
 */
SaleCounts.createFromJson = function (jsonObject) {
    var saleCounts = new SaleCounts(jsonObject.total, jsonObject.other, jsonObject.missing);
    saleCounts.parseTerms(jsonObject.terms);
    return saleCounts;
};

SaleCounts.prototype.parseTerms = function (jsonTerms) {
    var that = this;
    jsonTerms.forEach(function (term) {
        if (term.term == 0) {
            that.productCountNotInSale = term.count;
        } else {
            that.productCountInSale = term.count;
        }
    });
};

module.exports = SaleCounts;