function TermsCounts(productCountTotal, productCountWithOtherFacet, productCountWithoutAnyFacet) {
    this.productCountTotal = productCountTotal;
    this.productCountWithOtherFacet = productCountWithOtherFacet;
    this.productCountWithoutAnyFacet = productCountWithoutAnyFacet;
};

/**
 * @returns {number}
 */
TermsCounts.prototype.getProductCountTotal = function () {
    return this.productCountTotal;
}

/**
 * @returns {number}
 */
TermsCounts.prototype.getProductCountWithOtherFacetId = function () {
    return this.productCountWithOtherFacet;
}

/**
 * @returns {number}
 */
TermsCounts.prototype.getProductCountWithoutAnyFacet = function () {
    return this.productCountWithoutAnyFacet;
}

module.exports = TermsCounts;