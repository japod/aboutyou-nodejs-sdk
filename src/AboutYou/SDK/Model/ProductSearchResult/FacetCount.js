/**
 * @param {Facet} facet
 * @param {number} count
 * @constructor
 */
function FacetCount(facet, count) {
    this.facet = facet;
    this.count = count;
};

/**
 * @returns {Facet}
 */
FacetCount.prototype.getFacet = function () {
    return this.facet;
};

/**
 * @returns {number}
 */
FacetCount.prototype.getProductCount = function () {
    return this.count;
}

/**
 * @returns {number}
 */
FacetCount.prototype.getId = function () {
    return this.facet.Id();
}

/**
 * @returns {string}
 */
FacetCount.prototype.getName = function () {
    return this.facet.name;
}

/**
 * @returns {number}
 */
FacetCount.prototype.getGroupId = function () {
    return this.facet.groupId();
}

/**
 * @returns {string}
 */
FacetCount.getGroupName = function () {
    return this.facet.groupName;
}

Object.defineProperty(FacetCount.prototype, 'productCount', {
    get: FacetCount.prototype.getProductCount
});

module.exports = FacetCount;