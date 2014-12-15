'use strict'

var _ = require('underscore');
var Category = require('./Category');

/**
 * @constructor
 * @returns {ProductSearchResult}
 */
function ProductSearchResult() {
    this._pageHash = null;
    this.productCount = 0;
    this.products = [];
    this.categories = [];
    this._rawFacets = null;
};


/**
 * @static
 * @param {Object} jsonObject
 * @param Defaultclear
 * @returns {ProductSearchResult}
 */
ProductSearchResult.createFromJson = function (jsonObject, factory) {

    if (!jsonObject || !factory) {
        return;
    }

    var productSearchResult = new ProductSearchResult();

    productSearchResult._pageHash = jsonObject.pageHash || null;
    productSearchResult.products = [];
    productSearchResult.productCount = jsonObject.product_count;
    productSearchResult._rawFacets = jsonObject.facets;

    if (jsonObject.products) {
        for (var i = 0; i < jsonObject.products.length; i++) {
            var jsonProduct = jsonObject.products[i];
            var product = factory.createProduct(jsonProduct);
            productSearchResult.products.push(product);
        }
    }

    productSearchResult.parseFacets(jsonObject.facets, factory);

    return productSearchResult;
};

/**
 * @returns {string}
 */
ProductSearchResult.prototype.getPageHash = function () {
    return this.pageHash;
}

ProductSearchResult.prototype.parseFacets = function (jsonObject, factory) {

    if (!jsonObject || !factory) {
        return;
    }

    if (!_.isEmpty(jsonObject.categories)) {
        this.categories = factory.createCategoriesFacets(jsonObject.categories);
        delete jsonObject.categories;
    }
    if (!_.isEmpty(jsonObject.prices)) {
        this.priceRanges = factory.createPriceRanges(jsonObject.prices);
        delete jsonObject.prices;
    }

    if (!_.isEmpty(jsonObject.sale)) {
        this.saleCounts = factory.createSaleFacet(jsonObject.sale);
        delete jsonObject.sale;
    }

    this.facets = factory.createFacetsCounts(jsonObject);
    delete jsonObject.facets;

}

/**
 * @returns {number}
 */
ProductSearchResult.prototype.getProductCount = function () {
    return this.productCount;
};

/**
 * @returns {Object}
 */
ProductSearchResult.prototype.getRawFacets = function () {
    return this.rawFacets;
}

/**
 * @returns {ProductSearchResult|FacetCounts[]}
 */
ProductSearchResult.prototype.getFacets = function () {
    return this.facets;
}

/**
 * @returns {PriceRange[]}
 */
ProductSearchResult.prototype.getPriceRanges = function () {
    return this.priceRanges;
}

/**
 * @returns {Product[]}
 */
ProductSearchResult.prototype.getProducts = function () {
    return this.products;
};

/**
 * Returns the min price in euro cent or null, if the price range was not requested/selected
 *
 * @returns {number|null}
 */
ProductSearchResult.prototype.getMinPrice = function () {
    if (_.empty(this.priceRanges)) return null;

    var maxPrice = 0;

    this.priceRanges.reverse().forEach(function (priceRange) {
        if (priceRange.getProductCount() === 0) {
            return;
        }

        return priceRange.getMin();
    });


    return this.priceRanges[0].getMax();
}

/**
 * Returns the max price in euro cent, if the price range was not requested/selected
 *
 * @returns {number|null}
 */
ProductSearchResult.prototype.getMaxPrice = function () {
    if (_.empty(this.priceRanges)) return null;

    var maxPrice = 0;

    this.priceRanges.reverse().forEach(function (priceRange) {
        if (priceRange.getProductCount() === 0) {
            return;
        }

        return priceRange.getMax();
    });


    return _.last(this.priceRanges).getMax();
}

/**
 * @returns {number} SaleCounts
 */
ProductSearchResult.prototype.getSaleCounts = function () {
    return this.saleCounts;
}

/**
 * @returns {Category[]}
 */
ProductSearchResult.prototype.getCategories = function () {
    return this.categories;
};

/**
 * @returns {Category[]}
 */
ProductSearchResult.prototype.getCategoryTree = function () {
    var topLevelCategories = [];
    this.categories.forEach(function (category) {
        if (category.getParent() === null) {
            topLevelCategories.push(category);
        }
    });
    return topLevelCategories;
}


/**
 * @returns JSONArray
 **/

ProductSearchResult.prototype.toJSON = function() {
    var products = [];

    if(this.products) {
        this.products.forEach(function(product) {
            products.push(product.toJSON());
        });
    }

    return products;
}


module.exports = ProductSearchResult;