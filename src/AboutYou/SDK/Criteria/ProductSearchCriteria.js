'use strict'

var _ = require('underscore');

var ProductFields = require('./ProductFields');

/*
 * id and name is set per default
 */
ProductSearchCriteria.SORT_TYPE_RELEVANCE = 'relevance';
ProductSearchCriteria.SORT_TYPE_UPDATED = 'updated_date';
ProductSearchCriteria.SORT_TYPE_CREATED = 'created_date';
ProductSearchCriteria.SORT_TYPE_MOST_VIEWED = 'most_viewed';
ProductSearchCriteria.SORT_TYPE_PRICE = 'price';

ProductSearchCriteria.SORT_ASC = 'asc';
ProductSearchCriteria.SORT_DESC = 'desc';

ProductSearchCriteria.FACETS_ALL = '_all';
ProductSearchCriteria.FACETS_UNLIMITED = -1;

ProductSearchCriteria.FILTER_SALE = 'sale';
ProductSearchCriteria.FILTER_CATEGORY_IDS = 'categories';
ProductSearchCriteria.FILTER_PRICE = 'prices';
ProductSearchCriteria.FILTER_SEARCHWORD = 'searchword';
ProductSearchCriteria.FILTER_ATTRIBUTES = 'facets';

function ProductSearchCriteria(sessionId) {
    this._sessionId = sessionId;
    this._result = {};
    this._filter = {};

    return this;
};

ProductSearchCriteria.create = function (sessionId) {
    return new ProductSearchCriteria(sessionId);
};

ProductSearchCriteria.prototype = {
    filterBy: function (key, value) {
        this._filter[key] = value;
        return this;
    },

    getFilter: function (key) {
        return this._filter[key] || null;
    },

    filterBySale: function (sale) {
        if (typeof sale !== 'boolean') {
            sale = null;
        }

        this.filterBy(ProductSearchCriteria.FILTER_SALE, sale);
        return this;
    },

    getSaleFilter: function () {
        return this.getFilter(ProductSearchCriteria.FILTER_SALE);
    },

    filterBySearchword: function (searchword) {
        return this.filterBy(ProductSearchCriteria.FILTER_SEARCHWORD, searchword);
    },

    getSearchwordFilter: function () {
        return this.getFilter(ProductSearchCriteria.FILTER_SEARCHWORD);
    },

    filterByCategoryIds: function (categoryIds, append) {
        if (!(categoryIds instanceof Array)) {
            var id = parseInt(categoryIds, 10);
            categoryIds = [id];
        }

        if(categoryIds instanceof Array) {
            categoryIds = categoryIds.map(function(id) {
                return parseInt(id, 10);
            });
        }

        var filter = [];

        if (append) {
            filter = this.getFilter(ProductSearchCriteria.FILTER_CATEGORY_IDS) || [];
        }

        filter = _.uniq(filter.concat(categoryIds));

        this.filterBy(ProductSearchCriteria.FILTER_CATEGORY_IDS, filter);

        return this;
    },

    getCategoryFilter: function () {
        return this.getFilter(ProductSearchCriteria.FILTER_CATEGORY_IDS);
    },

    filterByFacetIds: function (attributes, append) {
        var filter = {};

        if (append) {
            filter = this.getFilter(ProductSearchCriteria.FILTER_ATTRIBUTES) || {};
        }

        for (var groupId in attributes) {
            var facetIds = attributes[groupId];

            if (filter[groupId] && append) {
                filter[groupId] = _.uniq(filter[groupId].concat(facetIds));
            } else {
                filter[groupId] = facetIds;
            }
        }

        return this.filterBy(ProductSearchCriteria.FILTER_ATTRIBUTES, filter);
    },

    getFacetFilter: function () {
        return this.getFilter(ProductSearchCriteria.FILTER_ATTRIBUTES);
    },

    filterByFacetGroup: function (facetGroup, append) {
        return this.filterByFacetIds(facetGroup.ids, append);
    },

    filterByFacetGroupSet: function (facetGroupSet, $append) {
        return this.filterByFacetIds(facetGroupSet.ids, append);
    },

    filterByPriceRange: function (from, to) {
        from = parseInt(from);
        to = parseInt(to);

        var price = {};
        if (from > 0) {
            price.from = from;
        }

        if (to > 0) {
            price.to = to;
        }

        return this.filterBy(ProductSearchCriteria.FILTER_PRICE, price);
    },

    getPriceRangeFilter: function () {
        return this.getFilter(ProductSearchCriteria.FILTER_PRICE);
    },

    sortBy: function (type, direction) {
        if (!direction) {
            direction = ProductSearchCriteria.SORT_ASC;
        }

        this._result['sort'] = {
            'by': type,
            'direction': direction
        };

        return this;
    },

    setLimit: function (limit, offset) {
        limit = limit ? parseInt(limit) : 200;
        limit = Math.max(Math.min(limit, 200), 0);

        offset = offset ? parseInt(offset) : 0;
        offset = Math.max(offset, 0);

        this._result['limit'] = limit;
        this._result['offset'] = offset;

        return this;
    },

    selectSales: function (enable) {
        if (typeof(enable) === 'undefined') {
            enable = true;
        }

        if (enable) {
            this._result['sale'] = true;
        } else if (this._result['sale']) {
            delete this._result['sale'];
        }

        return this;
    },

    selectPriceRanges: function (enable) {
        if (typeof(enable) === 'undefined') {
            enable = true;
        }

        if (enable) {
            this._result['price'] = true;
        } else if (this._result['price']) {
            delete this._result['price'];
        }

        return this;
    },

    selectFacetsByGroupId: function (groupId, limit) {
        limit = limit || ProductSearchCriteria.FACETS_UNLIMITED;

        if (!this._result['facets']) {
            this._result['facets'] = {};
        }

        if (!this._result['facets'][groupId]) {
            this._result['facets'][groupId] = {
                'limit': limit
            };
        }

        return this;
    },

    selectFacetsByFacetGroup: function (group, limit) {
        return this.selectFacetsByGroupId(group.groupId, limit);
    },

    selectAllFacets: function (limit) {

        this._result['facets'] = {};
        this._result['facets'][ProductSearchCriteria.FACETS_ALL] = {
            'limit': limit
        }
    },

    selectCategories: function (enable) {
        if (enable) {
            this._result['categories'] = true;
        } else if (this._result['categories']) {
            delete this._result['categories'];
        }

        return this;
    },

    boostProducts: function (ids) {
        if (!(ids instanceof Array)) {
            ids = [ids];
        }

        for (var i = 0; i < ids.length; i++) {
            if (typeof ids[i] === 'Product') {
                ids[i] = ids[i].id;
            }
        }

        ids = _.uniq(ids);
        this._result['boosts'] = ids;

        return this;
    },

    selectProductFields: function (fields) {
        this._result['fields'] = ProductFields.filterFields(fields);
        return this;
    },

    setSessionId: function (sessionId) {
        this._sessionId = sessionId;
        return this;
    },

    getSessionId: function () {
        return this._sessionId;
    },

    requiresCategories: function () {
        var productCategories =
            this._result['fields'] && ProductFields.requiresCategories(this._result['fields']);

        var categoryFacets = this._result['categories'] && this._result['categories'];

        return productCategories || categoryFacets;
    },

    requiresFacets: function () {
        var productFacets = this._result['fields'] && ProductFields.requiresFacets(this._result['fields']);
        var facetFacets = !_.isEmpty(this._result['facets']);

        return productFacets || facetFacets;
    },

    toArray: function () {
        var params = {
            'session_id': this.getSessionId()
        };

        if (this._result) {
            params.result = this._result;
        }

        if (this._filter) {
            params.filter = this._filter;
        }

        return params;
    }
};

module.exports = ProductSearchCriteria;