'use strict'

/**
 * @constructor
 * @returns {ProductsResult}
 */
function ProductsResult() {
    this.idsNotFound = [];
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
 * @param {DefaultModelFactory} factory
 *
 * @returns {ProductResult}
 */
ProductsResult.createFromJson = function (jsonObject, factory) {
    var productsResult = new ProductsResult();

    productsResult.pageHash = jsonObject.pageHash || null;
    productsResult.products = [];

    if (jsonObject && typeof jsonObject.ids != 'undefined') {

        var ids = jsonObject.ids;

        for (var key in ids) {

            var jsonProduct = ids[key];

            if (jsonProduct.error_code) {
                productsResult.idsNotFound.push(key);
                productsResult.errors.push(jsonProduct);
                continue;
            }
            productsResult.products.push(factory.createProduct(jsonProduct));
        }
    }
    return productsResult;
};

/**
 * @returns {number[]} array of product ids
 */
ProductsResult.prototype.getProductsNotFound = function () {
    return this.idsNotFound;
}

/**
 * @returns JSONArray
 **/
ProductsResult.prototype.toJSON = function() {
    var products = [];

    if(this.products) {
        this.products.forEach(function(product) {
            products.push(product.toJSON());
        });
    }

    return products;
}

Object.defineProperty(ProductsResult.prototype, 'productsNotFound', {
    get: ProductsResult.prototype.getProductsNotFound
});

module.exports = ProductsResult;