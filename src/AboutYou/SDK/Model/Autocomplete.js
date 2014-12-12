'use strict'

var Category = require('./Category');
var Product = require('./Product');

/**
 * @constructor
 * @param {Category[]} categories
 * @param {Product[]} products
 * @returns {Autocomplete}
 **/
function Autocomplete(categories, products) {
    this.categories = categories;
    this.products = products;
};

/**
 * @static
 * @param {Object} The autocomplete data as JSON object
 * @returns {Autocomplete}
 **/
Autocomplete.createFromJson = function (jsonObject, factory) {
    var autocomplete = new Autocomplete();

    autocomplete.categories = Autocomplete.parseCategories(jsonObject, factory);
    autocomplete.products = Autocomplete.parseProducts(jsonObject, factory);

    return autocomplete;

}

/**
 * parse autocompleted categories.
 * @static
 *
 * @param {Object} jsonObject
 * @param DefaultModelFactory factory
 *
 * @returns {Category[]}
 */
Autocomplete.parseCategories = function (jsonObject, factory) {
    if (!jsonObject.categories) {
        return [];
    }

    var categories = [];
    for (var i = 0; i < jsonObject.categories.length; i++) {
        var jsonCategory = jsonObject.categories[i];
        var category = factory.createCategory(jsonCategory);
        categories.push(category);
    }

    return categories;
}


/**
 * parse autocompleted products.
 * @static
 *
 * @param {Object} jsonObject
 * @param {DefaultModelFactory} factory
 *
 * @returns {Product[]}
 */
Autocomplete.parseProducts = function (jsonObject, factory) {
    if (!jsonObject.products) {
        return [];
    }

    var products = [];
    for (var i = 0; i < jsonObject.products.length; i++) {
        var jsonProduct = jsonObject.products[i];
        var product = factory.createProduct(jsonProduct);
        products.push(product);
    }

    return products;
}

/**
 * Get autocompleted products.
 *
 * @returns {Product[]}
 */
Autocomplete.prototype.getProducts = function () {
    return this.products;
}

/**
 * Get autocompleted categories.
 *
 * @returns {Category[]}
 */
Autocomplete.prototype.getCategories = function () {
    return this.categories;
}

module.exports = Autocomplete;