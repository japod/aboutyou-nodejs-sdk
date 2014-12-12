'use strict';

/**
 * @fileOverview Provides access to the ABOUT YOU Frontend Platform.
 * @author patrick.michelberger@aboutyou.de
 * @version 0.1.1
 * @example
 *
 * var aboutYou = new AboutYou(100,'3ed93394c2b5ebd12c104b177b928ad0');
 *
 * aboutYou.getCategoryTree().then(function(categories) {
 *     categories.forEach(function(category) {
 *         var name = category.getName();
 *         console.log("Category name: ", name);
 *     });
 * });
 */

var Client = require('./SDK/Client'),
    Query = require('./SDK/Query'),
    helpers = require('./helpers'),
    ImageModel = require('./SDK/Model/Image'),
    ProductFields = require('./SDK/Criteria/ProductFields'),
    ProductSearchCriteria = require('./SDK/Criteria/ProductSearchCriteria'),
    DefaultModelFactory = require('./SDK/Factory/DefaultModelFactory'),
    DefaultFacetManager = require('./SDK/FacetManager/DefaultFacetManager'),
    DefaultCategoryManager = require('./SDK/CategoryManager/DefaultCategoryManager'),
    CategoryTree = require('./SDK/Model/CategoryTree'),
    CategoriesResult = require('./SDK/Model/CategoriesResult'),
    _ = require('underscore');

var IMAGE_URL_STAGE = 'http://mndb.staging.aboutyou.de/mmdb/file';
var IMAGE_URL_SANDBOX = 'http://mndb.sandbox.aboutyou.de/mmdb/file';
var IMAGE_URL_LIVE = 'http://cdn.aboutyou.de/file';

/**
 * @constructor
 * @property {string} appId
 * @property {string} appPassword
 * @property {string} apiEndPoint 'live' for live environment, 'stage' for staging | default: 'live'
 * @returns {AboutYou} AboutYou instance
 */
function AboutYou(appId, appPassword, apiEndPoint) {
    apiEndPoint = apiEndPoint || 'live';

    if (!(this instanceof AboutYou)) {
        return new AboutYou(appId, appPassword, apiEndPoint);
    }

    // constructor code
    this.client = new Client(appId, appPassword, apiEndPoint);

    if (apiEndPoint === 'stage') {
        this.setBaseImageUrl(IMAGE_URL_STAGE);
        this.environment = 'stage';
    } else if (apiEndPoint === 'sandbox') {
        this.setBaseImageUrl(IMAGE_URL_SANDBOX);
        this.environment = 'sandbox';
    } else {
        this.setBaseImageUrl(IMAGE_URL_LIVE);
        this.environment = 'live';
    }

    this.appId = appId;
    this.appPassword = appPassword;
}

// public, non-privileged methods.
AboutYou.prototype = {

    /**
     * @returns Client
     */
    getClient: function () {
        return this.client;
    },

    /**
     * @param {string} appId        the app id for client authentication
     * @param {string} appPassword  the app password/token for client authentication.
     */
    setAppCredentials: function (appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    },

    /**
     * @returns {string}
     */
    getAppId: function () {
        return this.appId;
    },

    /**
     * @returns string
     */
    getApiEndPoint: function () {
        return this.client.getApiEndPoint();
    },

    /**
     * @param {string} apiEndPoint  the endpoint can be the string 'stage' or 'live',
     *                              then the default endpoints will be used or
     *                              an absolute url
     */
    setApiEndpoint: function (apiEndPoint) {
        this.client.setApiEndpoint(apiEndPoint);
    },

    /**
     * @param {null|false|string} baseImageUrl  null will reset to the default url, false to get relative urls, otherwise the url prefix
     */
    setBaseImageUrl: function (baseImageUrl) {
        if (baseImageUrl === null) {
            this.baseImageUrl = this.IMAGE_URL_LIVE;
        } else if (typeof baseImageUrl === 'string') {
            this.baseImageUrl = helpers.rtrim(baseImageUrl, '/');
        } else {
            this.baseImageUrl = '';
        }

        // we use no factory therefore we set the ImageBaseUrl directly
        ImageModel.setBaseUrl(this.baseImageUrl);
    },

    getQuery: function () {
        return new Query(this.client, this.getResultFactory());
    },

    /**
     * The Categories will be fetch automatically, if required by any other fetch method
     *
     * @example
     *
     * aboutYou.fetchProductsByIds([12345], ['categories']).then(function(products) {
     *     // will fetch the categories with the same request.
     *  });
     *
     * aboutYou.getCategoryManager().getCategoryTree().then(function(categories) {
     *     // will give you all categories for your Menu without an other request
     * });
     *
     *
     * @param {boolean} fetchIfEmpty
     * @returns DefaultCategoryManager
     */
    getCategoryManager: function (fetchIfEmpty) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            categoryManager = this.getResultFactory().getCategoryManager(),
            query = this.getQuery();

        if (typeof fetchIfEmpty === 'function' || !fetchIfEmpty) {
            fetchIfEmpty = true;
        }

        if (fetchIfEmpty && categoryManager.isEmpty()) {
            query.requireCategoryTree();
            query.executeSingle().then(function () {
                defer.resolve(categoryManager);
            }, function (error) {
                defer.reject(error);
            });
        } else {
            defer.resolve(categoryManager);
        }

        return defer.promise;
    },

    /**
     * @param {requestCallback} cb The callback that handles the response
     * @returns CategoryTree
     *
     * @deprecated use the CategoryManager instead of
     * @see AboutYou#getCategoryManager
     */
    fetchCategoryTree: function () {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback);

        this.getCategoryManager(true).then(function (response) {
            var tree = new CategoryTree(response);
            defer.resolve(tree);
        }, function (error) {
            defer.reject(error);
        });
        return defer.promise;
    },

    /**
     * @param {number[]} array of product ids
     * @param {string[]} required product fields
     * @see {@link https://developer.aboutyou.de/doc/products#produktfelder} for further information on product fields
     *
     * @returns ProductsResult
     */
    fetchProductsByIds: function (ids, fields) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        if (!fields || typeof fields === 'function') {
            fields = [];
        }

        // we allow to pass a single ID instead of an array
        if (!(ids instanceof Array)) {
            if (typeof ids === 'number' || typeof ids === 'string') {
                ids = [ids];
            } else {
                ids = [];
            }
        }

        query.fetchProductsByIds(ids, fields);
        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * @param {number[]} array of a product's variant ean
     * @param {string[]} required product fields
     * @see {@link https://developer.aboutyou.de/doc/products#produkte-anhand-der-id-oder-ean-auslesen} for further information on product ids and variant eans
     * @see {@link https://developer.aboutyou.de/doc/products#produktfelder} for further information on product fields
     *
     * @returns ProductsEansResult
     */
    fetchProductsByEans: function (eans, fields) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        if (!fields || (typeof fields === 'function')) {
            fields = [];
        }

        if (!(eans instanceof Array)) {
            eans = [eans];
        }

        // we allow to pass a single ID instead of an array
        if (!(eans instanceof Array)) {
            if (typeof eans === 'number' || typeof eans === 'string') {
                eans = [eans];
            } else {
                eans = [];
            }
        }

        query.fetchProductsByEans(eans, fields);
        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * Returns the result of a category search API request.
     * By passing one or several category ids it will return
     * a result of the categories data.
     *
     * @param {number | number[]} ids either a single category ID as integer or an array of IDs
     *
     * @returns CategoriesResult
     *
     * @deprecated use the CategoryManager instead of
     * @see AboutYou#getCategoryManager
     */
    fetchCategoriesByIds: function (ids) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback);

        // we allow to pass a single ID instead of an array
        if (ids && !_.isArray(ids)) {
            if (typeof ids === 'number' || typeof ids === 'string') {
                ids = [ids];
            } else {
                ids = [];
            }
        }

        this.getCategoryManager().then(function (categoryManager) {
            defer.resolve(new CategoriesResult(categoryManager, ids));
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;

    },

    /**
     * @param {integer[]} ids
     *
     * @returns VariantsResult
     *
     */
    fetchVariantsByIds: function (ids) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery().fetchLiveVariantByIds(ids);

        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * @param ProductSearchCriteria criteria
     *
     * @returns ProductSearchResult
     *
     */
    fetchProductSearch: function (criteria) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        query.fetchProductSearch(criteria);

        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * Returns the result of an auto completion API request.
     * Auto completion searches for products and categories by
     * a given prefix (searchword).
     *
     * @param {string} searchword   The prefix search word to search for.
     * @param {number} limit        Maximum number of results.
     * @param {string[]} types            Array of types to search for.
     *
     * @returns Autocomplete
     */
    fetchAutocomplete: function (searchword, limit, types) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        if (typeof limit === 'function' || !limit) {
            limit = 50;
        }

        if (typeof types === 'function' || !types) {
            types = ['products', 'categories'];
        }

        query.fetchAutocomplete(searchword, limit, types);

        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * Returns the result of a suggest API request.
     * Suggestions are words that are often searched together
     * with the searchword you pass (e.g. "stretch" for "jeans").
     *
     * @param {string} searchword The search string to search for.
     *
     * @returns {string[]}
     */
    fetchSuggest: function (searchword) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        query.fetchSuggest(searchword);

        query.executeSingle().then(function (response) {
            defer.resolve(response);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * Returns a list of all available product fields
     * @returns {Object} object keys contain all available product fields
     * @see {@link https://developer.aboutyou.de/doc/products#produktfelder} for further information on product fields
     */
    getProductFields: function () {
        return ProductFields.CONSTANTS;
    },

    /**
     * @returns string
     */
    getSessionId: function () {
        return 'session_id_yeah';
    },

    /**
     * @param {string|null} sessionId
     *
     * @returns ProductSearchCriteria
     */
    getProductSearchCriteria: function (sessionId) {
        sessionId = sessionId || null;
        if (!sessionId) {
            sessionId = this.getSessionId();
        }

        return new ProductSearchCriteria(sessionId);
    },

    /**
     * @returns {DefaultModelFactory}
     */
    getResultFactory: function () {
        if (!this.modelFactory) {
            this.initDefaultFactory();
        }
        return this.modelFactory;
    },

    /**
     * @param {DefaultModelFactory} modelFactory
     */
    setResultFactory: function (modelFactory) {
        this.modelFactory = modelFactory;
    },

    getFacetGroups: function () {
        return {
            0: 'brand',
            1: 'color',
            5: 'length',
            206: 'size_code',
            172: 'size_run',
            211: 'channel',
            247: 'care_symbol',
            173: 'clothing_unisex_int',
            204: 'clothing_unisex_onesize',
            175: 'clothing_womens_de',
            180: 'clothing_womens_inch',
            194: 'shoes_unisex_eur',
            189: 'clothing_mens_inch',
            185: 'clothing_womens_scotchsoda_81hours',
            187: 'clothing_mens_de',
            178: 'clothing_womens_uk',
            183: 'clothing_womens_us',
            181: 'clothing_womens_belts_cm',
            190: 'clothing_mens_belts_cm',
            176: 'clothing_womens_it',
            192: 'clothing_mens_acc'
        };
    },

    /**
     * Returns the URL to the ABOUT YOU JavaScript file for helper functions
     * to add product variants into the basket of Mary & Paul or auto-resizing
     * the Iframe. This URL may be changed in future, so please use this method instead
     * of hardcoding the URL into your HTML template.
     *
     * @returns {string} URL to the JavaScript file
     */
    getJavaScriptURL: function () {
        var url;
        if (this.environment === 'stage') {
            url = '//devcenter-staging-www1.pub.collins.kg:81/appjs/' + this.appId + '.js';
        } else {
            url = '//developer.aboutyou.de/appjs/' + this.appId + '.js';
        }

        return url;
    },

    /**
     * @param {Cache|null} cache
     *
     * @returns {DefaultModelFactory}
     */
    initDefaultFactory: function (cache) {
        cache = cache || null;

        var categoryManager = new DefaultCategoryManager(cache, this.appId),
            facetManager = new DefaultFacetManager(cache, this.appId),
            resultFactory = new DefaultModelFactory(
                this,
                facetManager,
                categoryManager
            );

        resultFactory.setBaseImageUrl(this.baseImageUrl);

        this.setResultFactory(resultFactory);
    },

    fetchFacet: function (params) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            query = this.getQuery();

        query.fetchFacet(params);
        query.executeSingle().then(function (result) {
            defer.resolve(result);
        }, function (error) {
            defer.reject(error);
        });

        return defer.promise;
    },

    /**
     * Fetch the facets of the given groupIds.
     *
     * @param {string[] | number[]} groupIds The group ids.
     *
     * @returns {Facet[]} With facet id as key.
     *
     */
    fetchFacets: function (groupIds) {
        var args = [].slice.call(arguments),
            callback = typeof args[args.length - 1] === 'function' && args.pop(),
            defer = helpers.createDeferred(callback),
            facetManager = this.getResultFactory().getFacetManager(),
            query = this.getQuery();

        if (facetManager.isEmpty()) {
            query.fetchFacets(groupIds);
            query.executeSingle().then(function () {
                defer.resolve(facetManager.getFacetsByGroupId(groupIds));
            }, function (error) {
                defer.reject(error);
            });
        } else {
            return defer.resolve(facetManager.getFacetsByGroupId(groupIds));
        }

        return defer.promise;
    },

    getConstants: function () {
        return AboutYou.constants;
    }
};

// dot accessors
Object.defineProperty(AboutYou.prototype, 'javaScriptTag', {
    get: AboutYou.prototype.getJavaScriptURL
});

Object.defineProperty(AboutYou.prototype, 'productFields', {
    get: AboutYou.prototype.getProductFields
});

Object.defineProperty(AboutYou.prototype, 'productSearchCriteria', {
    get: AboutYou.prototype.getProductSearchCriteria
});

Object.defineProperty(AboutYou.prototype, 'constants', {
    get: AboutYou.prototype.getConstants
});

// Contants
AboutYou.constants = {};
AboutYou.constants.FACET_BRAND = 0;
AboutYou.constants.FACET_COLOR = 1;
AboutYou.constants.FACET_SIZE = 2;
AboutYou.constants.FACET_CUPSIZE = 4;
AboutYou.constants.FACET_LENGTH = 5;
AboutYou.constants.FACET_DIMENSION3 = 6;
AboutYou.constants.FACET_SIZE_CODE = 206;
AboutYou.constants.FACET_SIZE_RUN = 172;
AboutYou.constants.FACET_CLOTHING_UNISEX_INT = 173;
AboutYou.constants.FACET_CLOTHING_UNISEX_INCH = 174;
AboutYou.constants.FACET_SHOES_UNISEX_EUR = 194;
AboutYou.constants.FACET_CLOTHING_WOMEN_DE = 175;
AboutYou.constants.FACET_CLOTHING_UNISEX_ONESIZE = 204;
AboutYou.constants.FACET_SHOES_UNISEX_ADIDAS_EUR = 195;
AboutYou.constants.FACET_CLOTHING_WOMEN_BELTS_CM = 181;
AboutYou.constants.FACET_CLOTHING_WOMEN_INCH = 180;
AboutYou.constants.FACET_CLOTHING_MEN_BELTS_CM = 190;
AboutYou.constants.FACET_CLOTHING_MEN_INCH = 189;
AboutYou.constants.FACET_CLOTHING_MEN_DE = 187;
AboutYou.constants.FACET_CONDITION = 234;
AboutYou.constants.FACET_QUANTITY_PER_PACK = 263;
AboutYou.constants.FACET_SEASON_CODE = 289;

module.exports = AboutYou;