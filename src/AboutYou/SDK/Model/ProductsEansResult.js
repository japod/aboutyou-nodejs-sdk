'use strict'

var Product = require('./Product');

/**
 * @constructor
 * @returns {ProductEansResult}
 */
function ProductsEansResult() {
    this.eansNotFound = [];
    this.errors = [];

    this.getProducts = function () {
        return this.products;
    };

    this.getPageHash = function () {
        return this.pageHash;
    };
};

/**
 * @static
 * @param {Object} jsonObject
 * @param DefaultModelFactory factory
 *
 * @return {ProductEansResult}
 */
ProductsEansResult.createFromJson = function (jsonObject, factory) {
    var productsEansResult = new ProductsEansResult();

    productsEansResult.pageHash = jsonObject.pageHash || null;
    productsEansResult.products = [];

    if (jsonObject && typeof jsonObject.eans != 'undefined') {

        var eans = jsonObject.eans;

        eans.forEach(function (jsonProduct) {
            if (jsonProduct.error_code) {
                productsEansResult.eansNotFound = productsEansResult.eansNotFound.concat(jsonProduct.ean);
                productsEansResult.errors.push(jsonProduct);
            } else {
                productsEansResult.products.push(factory.createProduct(jsonProduct));
            }
        });
    }
    return productsEansResult;
};

ProductsEansResult.prototype.getEansNotFound = function () {
    return this.eansNotFound;
}

/**
 * @returns JSONArray
 **/
ProductsEansResult.prototype.toJSON = function() {
    var products = [];

    if(this.products) {
        this.products.forEach(function(product) {
            products.push(product.toJSON());
        });
    }

    return products;
}

module.exports = ProductsEansResult;