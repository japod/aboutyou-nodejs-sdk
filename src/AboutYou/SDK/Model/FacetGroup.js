'use strict'

var _ = require('underscore');

/**
 * @constructor
 * @param {number} id
 * @param {string}  name
 * @returns {FacetGroup}
 */
function FacetGroup(id, name) {
    this.id = id;
    this.name = name;
    this.facets = [];
};

/**
 * @param {Facet} facet
 */
FacetGroup.prototype.addFacet = function (facet) {
    this.facets.push(facet);
};

/**
 * @param {Facet[]} facet
 */
FacetGroup.prototype.addFacets = function (facets) {
    for (var facet in facets) {
        this.addFacet(facet);
    }
};

/**
 * @returns {number}
 */
FacetGroup.prototype.getId = function () {
    return this.id;
};

/**
 * @returns {number}
 */
FacetGroup.prototype.getGroupId = function () {
    return this.id;
};

/**
 * @returns {string}
 */
FacetGroup.prototype.getName = function () {
    return this.name;
};

/**
 * Returns all facet names separated with the given parameter
 * eg. for size with to size facets "36" and "37" -> "36/37"
 *
 * @param {string} separator
 *
 * @returns {string}
 */
FacetGroup.prototype.getFacetNames = function (separator) {
    separator = separator || '/';
    var names = [];
    for (var facet in this.facets) {
        names.push(facet.getName());
    }
    return names.join(separator);
};

/**
 * @returns {Facet[]}
 */
FacetGroup.prototype.getFacets = function () {
    return this.facets;
};

/**
 * facet groups are equal, if the ids and all child ids are equal
 *
 * @param {FacetGroup} $facetGroup
 *
 * @returns {boolean}
 */
FacetGroup.prototype.isEqual = function (facetGroup) {
    if (this.id !== facetGroup.id) {
        return false;
    }
    return this.getUniqueKey() === facetGroup.getUniqueKey();
};

/**
 * @see FacetGroup#isEqual
 *
 * @returns {string}
 */
FacetGroup.prototype.getUniqueKey = function () {
    var facetIds = _.keys(this.facets);
    facetIds.sort();
    return this.id + ':' + facetIds.join(',');
};

/**
 *
 * @returns {string[]} ids
 */
FacetGroup.prototype.getIds = function () {
    var result = {};
    result[this.id] = _.keys(this.facets);
    return result;
};

/**
 * @param
 * @returns {string[]} ids
 */
FacetGroup.prototype.contains = function (facet) {
    if (this.facets[facet.getId()]) {
        return true;
    }
    return false;
};

// dot accessors
Object.defineProperty(FacetGroup.prototype, 'facetNames', {
    get: FacetGroup.prototype.getFacetNames
});

module.exports = FacetGroup;
