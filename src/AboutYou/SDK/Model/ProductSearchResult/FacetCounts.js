var util = require("util");
var TermsCounts = require('./TermsCounts');

/**
 * @constructor
 */
function FacetCounts(total, other, missing) {
    TermsCounts.call(this, total, other, missing);
};

util.inherits(FacetCounts, TermsCounts);

/**
 * @param {number}     groupId
 * @param              jsonObject
 * @param {FacetCount[]} facetCounts
 *
 * @return {FacetCounts}
 */
FacetCounts.createFromJson = function (groupId, jsonObject, counts) {

    var facetCounts = new FacetCounts(jsonObject.total, jsonObject.other, jsonObject.missing);

    facetCounts.groupId = groupId;

    facetCounts.facetCounts = counts;

    return facetCounts;
};

FacetCounts.prototype.getGroupId = function () {
    return this.groupId;
};

FacetCounts.prototype.getFacetCounts = function () {
    return this.facetCounts;
};

module.exports = FacetCounts;