'use strict'

var _ = require('underscore');
var FacetGroup = require('./FacetGroup');

/**
 * @constructor
 * @param {string[]} ids two dimensional array of group ids and array ids
 * @returns {FacetGroupSet}
 */
function FacetGroupSet(ids) {
    this.groups = {};
    this.facets = {};
    this.ids = ids;
};


FacetGroupSet.setFacetManager = function (facetManager) {
    FacetGroupSet.facetManager = facetManager;
}

FacetGroupSet.prototype.isEmpty = function () {
    return _.isEmpty(this.ids);
}

FacetGroupSet.prototype.getIds = function () {
    return this.ids;
};

FacetGroupSet.prototype.genLazyGroups = function () {
    var groups = [];
    for (var groupId in this.ids) {
        var facetIds = this.ids[groupId],
            group = new FacetGroup(groupId, null);
        for (var facetId in facetIds) {
            var facet = new Facet(facetId, null, null, groupId, null);
            group.addFacet(facet);
        }
        groups[groupId] = group;
    }
    return groups;
};

FacetGroupSet.prototype.getLazyGroups = function () {
    if (this.facets !== null) {
        return this.groups;
    } else {
        return this.genLazyGroups();
    }
};

FacetGroupSet.prototype.fetch = function () {
    var that = this;

    if (!_.isEmpty(this.facets)) return;

    for (var groupId in this.ids) {

        var facetIds = this.ids[groupId];

        facetIds.forEach(function (facetId) {

            var facet = FacetGroupSet.facetManager.getFacet(groupId, facetId);

            if (facet) {
                if (that.groups[groupId]) {
                    var group = that.groups[groupId];
                } else {
                    var group = new FacetGroup(groupId, facet.groupName);
                    that.groups[groupId] = group;
                }
                group.addFacet(facet);
                that.facets[facet.getUniqueKey()] = facet;
            }
        });
    }
};

/**
 * @returns {FacetGroup[]}
 */
FacetGroupSet.prototype.getGroups = function () {
    if (_.isEmpty(this.groups)) {
        this.fetch();
    }

    return this.groups;
};

/**
 * @param {string} groupId
 *
 * @returns {FacetGroup|null}
 */
FacetGroupSet.prototype.getGroup = function (groupId) {
    var groups = this.getGroups();
    if (groups && groups[groupId]) {
        return groups[groupId];
    }
    return null;
}

/**
 * @param {string} groupId
 *
 * @returns {boolean}
 */
FacetGroupSet.prototype.hasGroup = function (groupId) {
    return !empty(this.ids[groupId]);
};

/**
 * @param {string} key
 *
 * @returns {Facet|null}
 */
FacetGroupSet.prototype.getFacetByKey = function (key) {
    this.fetch();
    return (this.facets[key]) ? this.facets[$key] : null;
};


FacetGroupSet.prototype.getFacet = function (facetGroupId, facetId) {

    if (_.isEmpty(this.facets)) {
        this.fetch();
    }

    var foundFacet = _.findWhere(this.facets, {
        "groupId": facetGroupId,
        "id": facetId
    });

    return foundFacet;
};

/**
 * set are equal, if all groups are equal
 * which means, that all included facet ids per group must be the same
 *
 * @returns {string}
 */
FacetGroupSet.prototype.getUniqueKey = function () {
    var ids = this.ids;
    ids.sort();
    return JSON.stringify(ids);
};

FacetGroupSet.prototype.contains = function (facetCompable) {
    if (facetCompable instanceof FacetGroupSet) {
        return this._containsFacetGroupSet(facetCompable);
    }

    if (facetCompable instanceof FacetGetGroupInterface) {
        return this._containsFacetGetGroupInterface(facetCompable);
    }

    return false;
};

FacetGroupSet.prototype._containsFacetGetGroupInterface = function (facet) {
    var myLazyGroups = this.getLazyGroups();
    var id = facet.getGroupId();

    if (myLazyGroups[id]) {
        return myLazyGroups[id].getUniqueKey() === facet.getUniqueKey();
    }
    return false;
};

FacetGroupSet.prototype._containsFacetGroupSet = function (facetGroupSet) {
    if (this.getUniqueKey() === facetGroupSet.getUniqueKey()) {
        return true;
    }

    var myLazyGroups = this.getLazyGroups();
    var facetGroups = facetGroupSet.getLazyGroups();
    for (var id in facetGroups) {
        var group = facetGroups[id];
        if (!myLazyGroups[id] || myLazyGroups[id].getUniqueKey() !== group.getUniqueKey()) {
            return false;
        }
    }

    return true;
};

FacetGroupSet.mergeFacetIds = function (facetIdsArray) {
    var ids = [];
    for (var facetIds in facetIdsArray) {
        for (var groupId in facetIds) {
            var fIds = facetIds[groupId];
            if (ids[groupId]) {
                ids[groupId] = ids[groupId].concat(fIds);
            } else {
                ids[groupId] = fIds;
            }
        }
    }
    return ids;
};

/**
 * @return {string[]}
 */

FacetGroupSet.prototype.getGroupIds = function () {
    return _.key(this.ids);
};

// dot accessors
Object.defineProperty(FacetGroupSet.prototype, 'groupIds', {
    get: FacetGroupSet.prototype.getGroupIds
});

module.exports = FacetGroupSet;