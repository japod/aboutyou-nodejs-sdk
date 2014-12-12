'use strict'

var Category = require('../Model/Category')

CategoryManager.DEFAULT_CACHE_DURATION = 7200;

/**
 * @constructor
 * @param {string} appId  This must set, when you use more then one instances with different apps
 * @param {CacheProvider} cache
 * @returns {CategoryManager}
 */
function CategoryManager(appId, cache) {
    var appId = appId || '';
    this.cache = cache || null;
    this.cacheKey = 'AY:SDK:' + appId + ':categories';
    //this.loadCachedCategories();
};

CategoryManager.prototype.loadCachedCategories = function () {
    if (this.cache) {
        this.categories = this.cache.fetch(this.cacheKey) || null;
    }
};

CategoryManager.prototype.cacheCategories = function () {
    if (this.cache) {
        this.cache.save(this.cacheKey, this.categories, CategoryManager.DEFAULT_CACHE_DURATION);
    }
};

CategoryManager.prototype.clearCache = function () {
    if (this.cache) {
        this.cache.delete(this.cacheKey);
    }
};

/**
 * @param jsonObject
 * @returns {CategoryManager}
 */
CategoryManager.prototype.parseJson = function (jsonObject, factory) {
    this.categories = [];

    this.parentChildIds = jsonObject.parent_child;

    for (var id in jsonObject.ids) {
        var jsonCategory = jsonObject.ids[id];
        this.categories.push(factory.createCategory(jsonCategory, this));
    }

    //this.cacheCategories();

    return this;
}

/**
 *
 * @returns {boolean}
 */
CategoryManager.prototype.isEmpty = function () {
    return (this.categories && this.categories.length > 0) ? false : true;
};

/**
 *
 * @param {boolean} activeOnly
 * @returns {Category[]}
 */
CategoryManager.prototype.getCategoryTree = function (activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;
    return this.getSubcategories(0, activeOnly);
}

/**
 *
 * @param {number} id
 * @returns {Category|null}
 */
CategoryManager.prototype.getCategory = function (id) {
    for (var index in this.categories) {
        var category = this.categories[index];
        if (category.id === id) {
            return category;
        }
    }
    return null;
};

/**
 *
 * @param {number[]} ids
 * @param {boolean}activeOnly
 * @returns {Category[]}
 */
CategoryManager.prototype.getCategories = function (ids, activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;

    if (!this.categories) {
        return [];
    }

    if (!ids) {
        return this.categories;
    }

    var categories = [];

    for (var i = 0; i < this.categories.length; i++) {
        var category = this.categories[i];

        if ((activeOnly === Category.ALL || category.isActive()) && ids.indexOf(category.getId()) >= 0) {
            categories.push(category);

        }
    }

    return categories;
};

/**
 * @param {numnber} id
 * @param {boolean} activeOnly
 *
 * @returns {Category[]}
 */
CategoryManager.prototype.getSubcategories = function (id, activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;

    if (!this.parentChildIds[id]) {
        return [];
    }

    var ids = this.parentChildIds[id];
    ids = ids.map(function (id) {
        return parseInt(id, 10);
    });

    return this.getCategories(ids, activeOnly);
};

/**
 * @param {boolean} activeOnly
 *
 * @returns {Category[]}
 */
CategoryManager.prototype.getCategoryTree = function (activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;
    return this.getSubcategories(0, activeOnly);
};

/**
 * @returns {Category[]}
 */
CategoryManager.prototype.getAllCategories = function () {
    return this.categories;
};

/**
 *
 * @param {string} name
 * @param {boolean} activeOnly
 * @returns {Category}
 */
CategoryManager.prototype.getFirstCategoryByName = function (name, activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;
    for (var category in this.categories) {
        if (category.getName() === name && (activeOnly === Category.ALL || category.isActive())) {
            return category;
        }
    }
    return null;
};

/**
 *
 * @param {string} name
 * @param {boolean} activeOnly
 * @returns {Category}
 */
CategoryManager.prototype.getCategoriesByName = function (name, activeOnly) {
    activeOnly = activeOnly || Category.ACTIVE_ONLY;

    var categories = _.filter(this.categories, function (category) {
        return (category.getName() === name && (activeOnly === Category.ALL || category.isActive()));
    });

    return categories;
};

module.exports = CategoryManager;
