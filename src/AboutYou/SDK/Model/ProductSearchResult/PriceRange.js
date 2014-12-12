/**
 * @constructor
 */

var _ = require('underscore');

function PriceRange() {
};

/**
 * Expected json format
 * {
     * "count": 25138,
     * "from": 0,
     * "min": 399,
     * "max": 19999,
     * "to": 20000,
     * "total_count": 25138,
     * "total": 133930606,
     * "mean": 5327.8147028403
     * }
 *
 * @param jsonObject
 *
 * @returns {PriceRange}
 */
PriceRange.createFromJson = function (jsonObject) {
    var priceRange = new PriceRange();
    priceRange = _.extend(priceRange, jsonObject);
    return priceRange;
};

/**
 * @returns {number}
 */
PriceRange.prototype.getProductCount = function () {
    return this.count;
}

/**
 * in euro cent
 * @returns {number}
 */
PriceRange.prototype.getFrom = function () {
    return this.from;
}

/**
 * in euro cent
 * @returns {number}
 */
PriceRange.prototype.getTo = function () {
    return this.to ? this.to : null;
}

/**
 * in euro cent
 * @returns {number}
 */
PriceRange.prototype.getMin = function () {
    return this.min ? this.min : null;
}

/**
 * in euro cent
 * @returns {number}
 */
PriceRange.prototype.getMax = function () {
    return this.max ? this.max : null;
}

/**
 * in euro cent
 * @returns {number}
 */
PriceRange.prototype.getMean = function () {
    return parseInt(round(this.mean), 10);
}

/**
 * sum over all product min prices in this range
 * @returns {number}
 */
PriceRange.prototype.getSum = function () {
    return this.total;
}

Object.defineProperty(PriceRange.prototype, 'productCount', {
    get: PriceRange.prototype.getProductCount
});

module.exports = PriceRange;