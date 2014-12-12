'use strict';

var Variant = require('./Variant');

/**
 * @constructor
 * @returns {VariantsResult}
 */
function VariantsResult() {
    this.variants = [];
    this.errors = [];
};

/**
 * @static
 * @param {Object} jsonObject
 * @param {DefaultModelFactory} factory
 * @param {ProductSearchResult} productSearchResult
 * @returns {VariantsResult}
 */
VariantsResult.create = function (variants, errors, productSearchResult) {
    var variantsResult = new VariantsResult();
    variantsResult.errors = errors;

    if (productSearchResult === false || variants.length === 0) {
        // no variant was found
        return variantsResult;
    }

    // get products from product-search
    var products = productSearchResult.getProducts();

    for (var variantId in variants) {
        var productId = variants[variantId];
        for (var index in products) {
            var product = products[index];

            if (product.getId() === productId) {
                var variant = product.getVariantById(variantId);
                if (variant instanceof Variant) {
                    variantsResult.variants.push(variant);
                }
                continue;
            }
            // product was not delivered
            variantsResult.errors.push(variantId);
        }
    }

    return variantsResult;
}

/**
 * @returns {boolean}
 */
VariantsResult.prototype.hasVariantsFound = function () {
    return this.variants.length > 0;
}

/**
 * @returns {boolean}
 */
VariantsResult.prototype.hasVariantsNotFound = function () {
    return this.errors.length > 0;
}

/**
 * @returns {Variant[]}
 */
VariantsResult.prototype.getVariantsFound = function () {
    return this.variants;
}

/**
 * @param {number} id
 *
 * @returns {Variant|null}
 */
VariantsResult.prototype.getVariantById = function (id) {
    var result = null;

    if (this.variants[id]) {
        result = this.variants[id];
    }

    return result;
}

/**
 * @returns {number[]}
 */
VariantsResult.prototype.getVariantsNotFound = function () {
    return this.errors;
}

// dot accessors

Object.defineProperty(VariantsResult.prototype, 'variantsFound', {
    get: VariantsResult.prototype.getVariantsFound
});

module.exports = VariantsResult;