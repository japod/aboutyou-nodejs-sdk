'use strict'

var Category = require('./Category');
var _ = require('underscore');

/**
 * @constructor
 * @param {CategoryManager}
 * @returns {CategoryTree}
 */
function CategoryTree(categoryManager) {
    this._categoryManager = categoryManager;
};

/**
 * @param {boolean} activeOnly if true, then only active categories will returned, otherwise all categories
 * @returns {Category[]}
 */
CategoryTree.prototype.getCategories = function (activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;
    return this._categoryManager.getCategoryTree(activeOnly);
};


/**
 * @returns JSONArray
 **/

CategoryTree.prototype.toJSON = function() {
    var categories = [];

    if(this.categories) {
        this.categories.forEach(function(category) {
            categories.push(category.toJSON());
        });
    }

    return categories;
};

/**
 * Count active root all categories
 */
CategoryTree.prototype.count = function () {
    return count(this.getCategories(true));
};

// dot accessors
Object.defineProperty(CategoryTree.prototype, 'categories', {
    get: CategoryTree.prototype.getCategories
});

module.exports = CategoryTree;
