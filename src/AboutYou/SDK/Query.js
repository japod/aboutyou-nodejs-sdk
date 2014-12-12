'use strict';

var util = require('util');
var when = require('when');

var _ = require('underscore');
var ProductFields = require('./Criteria/ProductFields');

var mapping = {
    'autocompletion': 'createAutocomplete',
    'basket': 'createBasket',
    'category': 'createCategoriesResult',
    'facet': 'createFacetList',
    'facet_types': 'createFacetTypes',
    'products': 'createProductsResult',
    'products_eans': 'createProductsEansResult',
    'product_search': 'createProductSearchResult',
    'suggest': 'createSuggest',
    'get_order': 'createOrder',
    'initiate_order': 'initiateOrder',
    'child_apps': 'createChildApps',
    'live_variant': 'createVariantsResult'
};

Query.QUERY_TREE = 'category_tree';
Query.QUERY_FACETS = 'facets';
Query.QUERY_LIVE_VARIANT = 'live_variant';

/**
 * @constructor
 * @param {Client}              client
 * @param {DefaultModelFactory} factory
 * @returns {Query}
 */
function Query(client, factory) {
    this._ghostQuery = {};
    this._allQuery = [];
    this._query = [];

    this.client = client;
    this.factory = factory;
};

Query.prototype = {

    /**
     * request the queries and returns an array of the results
     *
     * @returns {Object[]} request results
     */
    execute: function () {
        var that = this;
        var defer = when.defer();
        var isMultiRequest = (that._query.length > 1);

        if (_.isEmpty(this._query) && _.isEmpty(this._ghostQuery)) {
            return [];
        }

        this._allQuery = _.values(this._ghostQuery).concat(this._query);

        var queryString = this.getQueryString();

        this.client.request(queryString).then(function (response) {
            var jsonResponse = JSON.parse(response.body);
            var results = that.parseResult(jsonResponse, isMultiRequest);
            defer.resolve(results);
        }, function (error) {
            // deal with an error
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * request the current query and returns the first result
     *
     * @returns {Object} first result of the current query
     */
    executeSingle: function () {

        var defer = when.defer();

        this.execute().then(function (response) {
            defer.resolve(response[0]);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;

    },

    /**
     * @param {string[]|int[]} ids
     * @param {string[]} fields
     *
     * @returns {Query}
     */
    fetchProductsByIds: function (ids, fields) {
        ids = ids.map(function (id) {
            return parseInt(id);
        });

        // make sure the keys are correct to avoid creating an json array instead of object
        ids = _.values(ids);

        this._query.push({
            'products': {
                'ids': ids,
                'fields': ProductFields.filterFields(fields)
            }
        });

        if (ProductFields.requiresCategories(fields)) {
            this.requireCategoryTree();
        }

        if (ProductFields.requiresFacets(fields)) {
            this.requireFacets();
        }

        return this;
    },

    /**
     * @param {string[]} eans
     * @param {string[]} fields
     *
     * @returns {Query}
     */
    fetchProductsByEans: function (eans, fields) {
        // make sure the keys are correct to avoid creating an json array instead of object
        eans = _.values(eans);

        this._query.push({
            'products_eans': {
                'eans': eans,
                'fields': ProductFields.filterFields(fields)
            }
        });

        if (ProductFields.requiresCategories(fields)) {
            this.requireCategoryTree();
        }

        if (ProductFields.requiresFacets(fields)) {
            this.requireFacets();
        }

        return this;
    },

    /**
     * @param {ProductSearchCriteria} criteria
     *
     * @returns {Query}
     */
    fetchProductSearch: function (criteria) {
        this._query = [
            {
                'product_search': criteria.toArray()
            }
        ];

        if (criteria.requiresCategories()) {
            this.requireCategoryTree();
        }
        if (criteria.requiresFacets()) {
            this.requireFacets();
        }
        return this;
    },

    /**
     * @param {boolean} fetchIfEmpty | default: false
     * @returns {Query}
     */
    requireCategoryTree: function (fetchForced) {
        fetchForced = fetchForced || false;
        if (!(fetchForced || this.factory.getCategoryManager().isEmpty())) {
            return this;
        }

        this._ghostQuery[Query.QUERY_TREE] = {
            'category_tree': {
                'version': '2'
            }
        };

        return this;
    },

    requireFacets: function (fetchForced) {
        fetchForced = fetchForced || false;
        if (!(fetchForced || this.factory.getFacetManager().isEmpty())) {
            return this;
        }

        this._ghostQuery[Query.QUERY_FACETS] = {
            'facets': {}
        };

        return this;
    },


    /**
     * @param {number} maxDepth -1 <= maxDepth <= 10
     *
     * @returns {Query}
     *
     * @deprecated use Query#requireCategoryTree and the CategoryManager instead of
     */
    fetchCategoryTree: function () {
        this._query = [
            {
                'category_tree': {
                    'version': '2'
                }
            }
        ];
        return this;
    },

    /**
     * @param {string}      searchword   The prefix search word to search for.
     * @param {number}      limit        Maximum number of results.
     * @param {string[]}    types        Array of types to search for
     *
     * @returns {Query}
     */
    fetchAutocomplete: function (searchword, limit, types) {
        searchword = String(searchword);
        // TODO searchword = unescape(encodeURIComponent(searchword));
        searchword = searchword.toLowerCase();

        limit = parseInt(limit);

        var options = {
            'searchword': searchword,
            'limit': limit
        };

        if (types) {
            options.types = types;
        }

        this._query = [
            {
                'autocompletion': options
            }
        ];

        return this;
    },

    /**
     * @param {string} searchWord The search string to search for.
     *
     * @returns {Query}
     */
    fetchSuggest: function (searchword) {
        this._query = [
            {
                'suggest': {
                    'searchword': searchword
                }
            }
        ];
    },

    /**
     * @return string
     */
    getQueryString: function () {
        return JSON.stringify(this._allQuery);
    },

    /**
     * @param {number[]|string[]} ids either a single category ID as integer or an array of IDs
     *
     * @returns {Query}
     */
    fetchCategoriesByIds: function (ids) {
        var ids = ids || null;
        if (ids === null) {
            this._query.push({
                'category': null
            });
        } else {
            /*
             foreach ($ids as $id) {
             if (!is_long($id) && !ctype_digit($id)) {
             throw new \InvalidArgumentException('A single category ID must be an integer or a numeric string');
             } else if ($id < 1) {
             throw new \InvalidArgumentException('A single category ID must be greater than 0');
             }
             }
             */

            ids = ids.map(parseInt);

            ids = _.values(ids);

            this._query.push({
                'category': {
                    'ids': ids
                }
            });
        }
        return this;
    },

    /**
     * @param {string[]|number[]} ids
     *
     * @returns {Query}
     */
    fetchLiveVariantByIds: function (ids) {
        ids = ids.map(function (id) {
            return parseInt(id, 10);
        });
        ids = _.values(ids);

        this._query.push({
            'live_variant': {'ids': ids}
        });

        return this;
    },

    /**
     * @param {string[]} params
     *
     * @returns {Query}
     *
     */
    fetchFacet: function (params) {
        if (params && params.length < 1) {
            // TODO throw new \InvalidArgumentException('no params given');
            return null;
        }

        this._query.push({
            'facet': params
        });

        return this;
    },

    /**
     * @param {number[]} groupIds
     *
     * @returns {Query}
     *
     */
    fetchFacets: function (groupIds) {
        groupIds = groupIds || [];
        groupIds = groupIds.map(parseInt);

        this._query.push({
            'facets': {
                'group_ids': groupIds
            }
        });
        return this;
    },


    /**
     * returns an array of parsed results
     *
     * @param {Object[]} jsonResponse the response body as json array
     * @param {boolean} isMultiRequest
     *
     * @returns {Object[]}
     *
     */
    parseResult: function (jsonResponse, isMultiRequest) {
        isMultiRequest = isMultiRequest || true;

        // TODO $this->checkResponse($jsonResponse);

        var results = [];
        var queryKeys = [];

        for (var query in this._allQuery) {
            queryKeys.push(_.keys(this._allQuery[query])[0]);
        }

        for (var index in jsonResponse) {
            var responseObject = jsonResponse[index];
            var queryKey = queryKeys[index];
            var jsonObject = responseObject[queryKey];
            var query = this._allQuery[index][queryKey];
            var factory = this.factory;

            /* TODO
             if (isset($jsonObject->error_code)) {
             $result = $factory->preHandleError($jsonObject, $responseKey, $isMultiRequest);
             if ($result !== false) {
             $results[$responseKey] = $result;
             continue;
             }
             }*/

            if (queryKey === Query.QUERY_FACETS) {
                factory.updateFacetManager(jsonObject);
            } else if (queryKey === Query.QUERY_TREE) {
                factory.initializeCategoryManager(jsonObject);
            } else if (queryKey === Query.QUERY_LIVE_VARIANT) {
                // async case
                var variantsResult = factory.createVariantsResult(jsonObject, query).then(function (result) {
                    return result;
                }, function (err) {
                    // TODO ERROR HANDLING
                    return null;
                });
                results.push(variantsResult);
            } else {
                var method = mapping[queryKey];
                results.push(factory[method](jsonObject, query));
            }
        }

        return results;
    }

};

module.exports = Query;