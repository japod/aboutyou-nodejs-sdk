'use strict';

var Autocomplete = require('../Model/Autocomplete');
var CategoriesResult = require('../Model/CategoriesResult');
var Category = require('../Model/Category');
var CategoryTree = require('../Model/CategoryTree');
var Product = require('../Model/Product');
var ProductsResult = require('../Model/ProductsResult');
var Image = require('../Model/Image');
var Facet = require('../Model/Facet');
var FacetGroupSet = require('../Model/FacetGroupSet');
var ProductSearchResult = require('../Model/ProductSearchResult');
var _ = require('underscore');
var ProductsEansResult = require('../Model/ProductsEansResult');
var VariantsResult = require('../Model/VariantsResult');
var FacetCounts = require('../Model/ProductSearchResult/FacetCounts');
var FacetCount = require('../Model/ProductSearchResult/FacetCount');
var PriceRange = require('../Model/ProductSearchResult/PriceRange');
var SaleCounts = require('../Model/ProductSearchResult/SaleCounts');
var when = require('when');

/**
 * @constructor
 * @param {AboutYou} ay
 * @param {DefaultFacetManager} facetManager
 * @param {DefaultCategoryManager} categoryManager
 * @returns {DefaultModelFactory}
 */
function DefaultModelFactory(aboutYou, facetManager, categoryManager) {
    if (!this.aboutYou) {
        this.setAboutYou(aboutYou);
    }
    this.categoryManager = categoryManager;
    this.setFacetManager(facetManager);
}

/**
 * @param {AboutYou} aY
 */
DefaultModelFactory.prototype.setAboutYou = function (aboutYou) {
    this.aboutYou = aboutYou;
};

/**
 * @returns {AboutYou}
 */
DefaultModelFactory.prototype.getAboutYou = function () {
    return this.aboutYou;
};

/**
 * @param {DefaultFacetManager} facetManager
 */
DefaultModelFactory.prototype.setFacetManager = function (facetManager) {
    this.facetManager = facetManager;
    FacetGroupSet.setFacetManager(facetManager);
};

/**
 * @returns {DefaultFacetManager}
 */
DefaultModelFactory.prototype.getFacetManager = function () {
    return this.facetManager;
};

DefaultModelFactory.prototype.setBaseImageUrl = function (baseUrl) {
    Image.setBaseUrl(baseUrl);
};

/**
 *
 * @param jsonObject
 * @returns {Autocomplete}
 */
DefaultModelFactory.prototype.createAutocomplete = function (jsonObject) {
    return Autocomplete.createFromJson(jsonObject, this);
}

/**
 *
 * @param {Object} jsonObject
 * @param queryParams
 * @returns {CategoriesResult}
 */
DefaultModelFactory.prototype.createCategoriesResult = function (jsonObject, queryParams) {
    return CategoriesResult.createFromJson(jsonObject, queryParams['ids'], this);
}

/**
 *
 * @param jsonObject
 * @returns {Category}
 */
DefaultModelFactory.prototype.createCategory = function (jsonObject) {
    return Category.createFromJson(jsonObject, this.getCategoryManager());
}

/**
 *
 * @param jsonArray
 * @returns {CategoryTree}
 */
DefaultModelFactory.prototype.createCategoryTree = function (jsonArray) {
    this.initializeCategoryManager(jsonArray);
    return new CategoryTree(this.getCategoryManager());
};

/**
 *
 * @param categoryManager
 */
DefaultModelFactory.prototype.setCategoryManager = function (categoryManager) {
    this.categoryManager = categoryManager;
};

/**
 *
 * @returns {DefaultCategoryManager}
 */
DefaultModelFactory.prototype.getCategoryManager = function () {
    return this.categoryManager;
};

DefaultModelFactory.prototype.initializeCategoryManager = function (jsonObject) {
    return this.getCategoryManager().parseJson(jsonObject, this);
}

DefaultModelFactory.prototype.updateFacetManager = function (jsonObject) {
    var facets = this.createFacetsList(jsonObject);
    this.getFacetManager().setFacets(facets);
};

/**
 *
 * @param jsonObject
 * @returns {Facet}
 */
DefaultModelFactory.prototype.createFacet = function (jsonObject) {
    return Facet.createFromJson(jsonObject);
};

/**
 *
 * @param jsonArray
 * @returns {Facet[]}
 */
DefaultModelFactory.prototype.createFacetList = function (jsonArray) {
    var facets = [];
    for (var index in jsonArray) {
        var facet = this.createFacet(jsonArray[index]);
        facets.push(facet);
    }
    return facets;
}

DefaultModelFactory.prototype.createFacetsCounts = function (jsonObject) {
    var facetsCounts = {};

    for (var groupId in jsonObject) {
        var jsonResultFacet = jsonObject[groupId];
        var facetCounts = this.getTermFacets(groupId, jsonResultFacet.terms);

        facetsCounts[groupId] = FacetCounts.createFromJson(
            groupId,
            jsonResultFacet,
            facetCounts
        );
    }

    return facetsCounts;
}

DefaultModelFactory.prototype.getTermFacets = function (groupId, jsonTerms) {
    var facetManager = this.facetManager;

    var facetCounts = [];
    jsonTerms.forEach(function (jsonTerm) {
        var id = parseInt(jsonTerm.term, 10);
        groupId = parseInt(groupId, 10);

        var facet = facetManager.getFacet(groupId, id);

        if (facet) {
            var count = jsonTerm.count;
            facetCounts.push(new FacetCount(facet, count));
        }
    });

    return facetCounts;
}


/**
 *
 * @param jsonObject
 * @returns {Facet[]}
 */
DefaultModelFactory.prototype.createFacetsList = function (jsonObject) {
    return this.createFacetList(jsonObject.facet);
};

/**
 *
 * @param jsonArray
 * @returns {number[]}
 */
DefaultModelFactory.prototype.createFacetTypes = function (jsonArray) {
    return jsonArray;
};

/**
 *
 * @param jsonObject
 * @returns {ImageModel}
 */
DefaultModelFactory.prototype.createImage = function (jsonObject) {
    return Image.createFromJson(jsonObject);
};

/**
 *
 * @param jsonObject
 * @returns {Product}
 */
DefaultModelFactory.prototype.createProduct = function (jsonObject) {
    return Product.createFromJson(jsonObject, this, this.aboutYou.getAppId());
};

/**
 * @returns {PriceRange[]}
 */
DefaultModelFactory.prototype.createPriceRanges = function (jsonObject) {
    var priceRanges = [];
    jsonObject.ranges.forEach(function (range) {
        priceRanges.push(PriceRange.createFromJson(range));
    });
    return priceRanges;
}

/**
 *
 * @returns {SaleCounts}
 */
DefaultModelFactory.prototype.createSaleFacet = function (jsonObject) {
    return SaleCounts.createFromJson(jsonObject);
};

/**
 *
 * @param jsonObject
 * @returns {Promise}
 */
DefaultModelFactory.prototype.createVariantsResult = function (jsonObject) {
    var variants = [];
    var errors = [];
    var productIds = [];
    var productSearchResult = false;
    var defer = when.defer();

    for (var id in jsonObject) {
        var data = jsonObject[id];
        if (data.error_code) {
            errors.push(id);
        } else {
            variants.push(data.product_id);
            productIds.push(data.product_id);
        }
    }

    if (productIds.length > 0) {

        var productIds = _.uniq(productIds),
            productFields = this.aboutYou.getProductFields();

        // search products for valid variants
        this.aboutYou
            .fetchProductsByIds(
            productIds, [
                productFields.ATTRIBUTES_MERGED,
                productFields.BRAND,
                productFields.CATEGORIES,
                productFields.DEFAULT_IMAGE,
                productFields.DEFAULT_VARIANT,
                productFields.DESCRIPTION_LONG,
                productFields.DESCRIPTION_SHORT,
                productFields.IS_ACTIVE,
                productFields.IS_SALE,
                productFields.MAX_PRICE,
                productFields.MIN_PRICE,
                productFields.VARIANTS
            ]
        ).then(function (productSearchResult) {
                var result = VariantsResult.create(variants, errors, productSearchResult);
                defer.resolve(result)
            }, function (err) {
                defer.reject(err);
            })

    } else {
        var result = VariantsResult.create(variants, errors, productSearchResult);
        defer.resolve(result);
    }

    return defer.promise;
}

/**
 *
 * @param jsonObject
 * @returns {Product}
 */
DefaultModelFactory.prototype.createSingleProduct = function (jsonObject) {
    return this.createProduct(jsonObject);
}

/**
 *
 * @param jsonObject
 * @returns {ProductResult}
 */
DefaultModelFactory.prototype.createProductsResult = function (jsonObject) {
    return ProductsResult.createFromJson(jsonObject, this);
}

/**
 *
 * @param jsonObject
 * @returns {ProductEansResult}
 */
DefaultModelFactory.prototype.createProductsEansResult = function (jsonObject) {

    return ProductsEansResult.createFromJson(jsonObject, this);
}

/**
 *
 * @param jsonObject
 * @returns {ProductSearchResult}
 */
DefaultModelFactory.prototype.createProductSearchResult = function (jsonObject) {
    return ProductSearchResult.createFromJson(jsonObject, this);
};

/**
 *
 * @param jsonArray
 * @returns {string[]}
 */
DefaultModelFactory.prototype.createSuggest = function (jsonArray) {
    return jsonArray;
}

/**
 *
 * @param jsonObject
 * @param {Product} product
 * @returns {Variant}
 */
DefaultModelFactory.prototype.createVariant = function (jsonObject, product) {
    return Variant.createFromJson($jsonObject, $this, $product);
}

/**
 *
 * @param jsonArray
 * @returns {ProductSearchResult}
 */
DefaultModelFactory.prototype.createCategoriesFacets = function (jsonArray) {
    var categoryManager = this.getCategoryManager();

    var flattenCategories = [];

    jsonArray.forEach(function (item) {
        var id = item.term;
        var category = categoryManager.getCategory(id);
        if (category) {
            category.setProductCount(item.count);
            flattenCategories[id] = category;
        }
    });

    return flattenCategories;
};

module.exports = DefaultModelFactory;