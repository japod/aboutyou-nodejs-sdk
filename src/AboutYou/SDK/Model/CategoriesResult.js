'use strict'

var _ = require('underscore');
var Category = require('./Category');

/**
 * @constructor
 * @param {CategoryManager}
 * @param {string[]} ids
 * @returns {CategoriesResult}
 */
function CategoriesResult(categoryManager, ids) {
    this.ids = ids;
    this.categories = categoryManager.getCategories(ids, Category.ALL);
};

/**
 * @returns {Category[]}
 */
CategoriesResult.prototype.getCategories = function () {
    return this.categories;
};

/**
 * @return {string[]} array of product ids
 */
CategoriesResult.prototype.getCategoriesNotFound = function () {
    var idsFound = _.keys(this.categories);

    var idsNotFound = _.difference(this.ids, idsFound);

    return _.values(idsNotFound);
};

/**
 * Count of all fetched Products
 * @returns {number}
 */
CategoriesResult.prototype.count = function () {
    return this.categories.length;
};

// dot accessors
Object.defineProperty(CategoriesResult.prototype, 'categoriesNotFound', {
    get: CategoriesResult.prototype.getCategoriesNotFound
});

module.exports = CategoriesResult;
