'use strict';

var _ = require('underscore');

Category.ALL = false;
Category.ACTIVE_ONLY = true;

/**
 * @constructor
 * @returns {Category}
 */
function Category() {
    this.productCount = 0;
}

/**
 * @static
 * @param {Object} jsonObject  json as object tree
 * @param CategoryManagerInterface categoryManager
 *
 * @return {Category}
 */
Category.createFromJson = function (jsonObject, categoryManager) {
    var category = new Category();

    category._categoryManager = categoryManager;
    category.parentId = jsonObject.parent;
    category.id = jsonObject.id;
    category.name = jsonObject.name;
    category.active = jsonObject.active;
    category.position = jsonObject.position;

    return category;
}

/**
 * @returns {number}
 */
Category.prototype.getId = function () {
    return this.id;
}

/**
 * @returns {boolean}
 */
Category.prototype.isActive = function () {
    return this.active ? true : false;
}

/**
 * @returns {boolean}
 */
Category.prototype.isPathActive = function () {
    var parent = this.getParent();

    return this.isActive() && (parent === null || parent.isPathActive());
}

/**
 * @returns {string}
 */
Category.prototype.getName = function () {
    return this.name;
}

/**
 * @returns {number}
 */
Category.prototype.getParentId = function () {
    return this.parentId;
}

/**
 * @returns {number}
 */
Category.prototype.getPosition = function () {
    return this.position;
}

/**
 * @param {number} productCount
 */
Category.prototype.setProductCount = function (productCount) {
    this.productCount = productCount;
}

/**
 * @returns {number}
 */
Category.prototype.getProductCount = function () {
    return this.productCount;
}

/**
 * @returns {Category|null}
 */
Category.prototype.getParent = function () {
    if (!this.getParentId()) {
        return null;
    }
    return this._categoryManager.getCategory(this.getParentId());
}

/**
 * @param {boolean} activeOnly
 *
 * @returns {Category[]}
 */
Category.prototype.getSubcategories = function (activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;

    var subcategories = this._categoryManager.getSubcategories(this.getId());

    if (activeOnly === Category.ALL) {
        return subcategories;
    }

    return _.filter(subcategories, function (subCategory) {
        return subCategory.isActive();
    });
}

/**
 * @returns {Category[]}
 */
Category.prototype.getBreadCrumb = function () {
    var breadcrumb = this.getParent() ? this.getParent().getBreadCrumb() : [];
    breadcrumb.push(this);
    return breadcrumb;
}

/**
 * @param {number} productCount
 */
Category.prototype.setProductCount = function (count) {
    this.productCount = parseInt(count);
}

/**
 * @returns {number} productCount
 */
Category.prototype.getProductCount = function () {
    return this.productCount;
}

/**
 * @returns JSONObject
 **/

Category.prototype.toJSON = function() {
    var copy = _.clone(this, true);
    var subcats = [];

    if(this.subcategories) {
        this.subcategories.forEach(function(subcategory) {
            subcats.push(subcategory.toJSON());
        });
    }

    copy.subcategories = subcats;

    // delete unused properties
    delete copy._categoryManager;
    delete copy.productCount;
    delete copy.parentId;
    delete copy.position;

    return copy;
};

// dot access
Object.defineProperty(Category.prototype, 'parent', {
    get: Category.prototype.getParent
});

Object.defineProperty(Category.prototype, 'subcategories', {
    get: Category.prototype.getSubcategories
});

Object.defineProperty(Category.prototype, 'breadcrumb', {
    get: Category.prototype.getBreadCrumb
});

module.exports = Category;