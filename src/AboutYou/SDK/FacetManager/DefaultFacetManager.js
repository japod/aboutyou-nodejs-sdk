'use strict'

var Facet = require('../Model/Facet');
var _ = require('underscore');

DefaultFacetManager.DEFAULT_CACHE_DURATION = 7200;

/**
 * @constructor
 * @param {Cache} cache
 * @param {string} appId
 * @returns {DefaultFacetManager}
 */
function DefaultFacetManager(cache, appId) {
    cache = cache || null;
    appId = cache || '';

    this.facets = null;

    this.cache = cache;
    this.cacheKey = 'AY:SDK:' + appId + ':facets';

    //this.loadCachedFacets();
};

DefaultFacetManager.prototype.loadCachedFacets = function () {
    if (this.cache) {
        this.facets = this.cache.fetch(this.cacheKey) || null;
    }
};

DefaultFacetManager.prototype.cacheFacets = function () {
    if (this.cache) {
        this.cache.save(this.cacheKey, this.facets, DefaultFacetManager.DEFAULT_CACHE_DURATION);
    }
};

DefaultFacetManager.prototype.clearCache = function () {
    if (this.cache) {
        this.cache.delete(this.cacheKey);
    }
};

DefaultFacetManager.prototype.isEmpty = function () {
    return this.facets === null;
};

DefaultFacetManager.prototype.setFacets = function (facets) {
    this.facets = facets;
    //this.cacheFacets();
};

/**
 *
 * @param {number} groupId group id of a facet
 * @param {number} id id of the facet
 * @returns {Facet}
 */
DefaultFacetManager.prototype.getFacet = function (groupId, id) {
    groupId = parseInt(groupId, 10);

    var foundFacet = _.findWhere(this.facets, {
        "groupId": groupId,
        "id": id
    });

    return foundFacet ? foundFacet : null;
};

DefaultFacetManager.prototype.getFacetsByGroupId = function (groupIds) {
    groupIds = groupIds || [];
    var foundFacets = [];

    var that = this;

    groupIds.forEach(function (groupId) {
        var foundFacet = _.where(that.facets, {
            "groupId": groupId
        });

        foundFacets = foundFacets.concat(foundFacet);
    });

    return foundFacets ? foundFacets : null;
}


module.exports = DefaultFacetManager;