'use strict'

var ImageModel = require('./Image'),
    Variant = require('./Variant'),
    Category = require('./Category'),
    FacetGroupSet = require('./FacetGroupSet'),
    _ = require('underscore'),
    util = require('util');

/**
 * @constructor
 * @return {Product}
 */
function Product() {
};

/**
 * @returns {boolean}
 */
Product.prototype.isActive = function () {
    return this.isActive;
};

/**
 * @returns {Facet}
 */
Product.prototype.getBrand = function () {
    return this.getFacetGroupSet().getFacet(0, this.brandId);
};

/**
 * @returns {Variant|null}
 */
Product.prototype.getDefaultVariant = function () {
    return this.defaultVariant;
};

/**
 * @returns {string|null}
 */
Product.prototype.getDescriptionLong = function () {
    return this.descriptionLong;
}
/**
 * @returns {string|null}
 */
Product.prototype.getDescriptionShort = function () {
    return this.descriptionShort;
}

/**
 * @returns {number}
 */
Product.prototype.getId = function () {
    return this.id;
}

Product.prototype.getVariants = function () {
    return this.variants;
};

/**
 * @returns {string}
 */
Product.prototype.getName = function () {
    return this.name;
};

/**
 * @returns {number}
 */
Product.prototype.getMinPrice = function () {
    return this.minPrice;
};

/**
 * @returns {Product[]}
 */
Product.prototype.getStyles = function () {
    return this.styles;
};

/**
 * @returns {number}
 */
Product.prototype.getMaxPrice = function () {
    return this.maxPrice;
};

/**
 * @returns {ImageModel|null}
 */
Product.prototype.getDefaultImage = function () {
    return this.defaultImage;
};

Product.prototype.generateFacetGroupSet = function () {
    this.facetGroups = new FacetGroupSet(this.facetIds);
};

/**
 * @returns {FacetGroupSet|null}
 */
Product.prototype.getFacetGroupSet = function () {
    if (!this.facetGroups) {
        this.generateFacetGroupSet();
    }
    return this.facetGroups;
};

Product.prototype.getCategoryIdHierachies = function () {
    return this.categoryIdPaths;
};

/**
 * This is a low level method.
 *
 * Returns an array of arrays:
 * [
 *  "<facet group id>" => [<facet id>, <facet id>, ...],
 *  "<facet group id>" => [<facet id>, ...],
 *  ...
 * ]
 * "<facet group id>" are strings with digits
 * <facet id> are integers
 *
 * for example:
 * [
 *  "0"   => [264],
 *  "1"   => [1234],
 *  "206" => [123,234,345]
 * ]
 *
 * @returns {Object[]}
 */
Product.prototype.getFacetIds = function () {
    return this.facetIds;
}

/**
 * Returns the first active category and, if non active, then it return the first category

 * @param bool $activeOnly return only categories that are active
 *
 * @return Category|null
 */
Product.prototype.getCategory = function (active) {
    active = active || false;
    if (_.isEmpty(this.categoryIdPaths)) {
        return;
    }

    var categories = this.getLeafCategories(active);

    return categories[0];
};

/**
 * Returns array of categories without subcategories. E.g. of the product is in the category
 * Damen > Schuhe > Absatzschuhe and Damen > Schuhe > Stiefelleten then
 * [Absatzschuhe, Stiefelleten] will be returned
 *
 * @param bool $activeOnly return only categories that are active
 *
 * @return Category[]
 */
Product.prototype.getLeafCategories = function (activeOnly) {
    var activeOnly = Category.ACTIVE_ONLY;
    var categoryIds = this.getLeafCategoryIds();

    var categories = this.getCategoryManager().getCategories(categoryIds, activeOnly);

    return categories;
}

Product.prototype.getRootCategoryIds = function () {
    var ids = this.categoryIdPaths.map(function (categoryIdPath) {
        return categoryIdPath[0];
    });
    return _.uniq(ids);
};

Product.prototype.getLeafCategoryIds = function () {
    return _.map(this.categoryIdPaths, function (categoryIdPath) {
        return categoryIdPath[categoryIdPath.length - 1];
    });
};


Product.prototype.getCategories = function (activeOnly) {
    var activeOnly = activeOnly || true;
    return this.getRootCategories(activeOnly);
};

/**
 * @param {boolean} activeOnly  return only active categories
 *
 * @returns {Category[]}
 */
Product.prototype.getRootCategories = function (activeOnly) {
    var activeOnly = activeOnly || true;

    var categoryIds = this.getRootCategoryIds();
    var categories = this.getCategoryManager().getCategories(categoryIds, activeOnly);

    return categories;
};

/**
 * @returns {DefaultCategoryManager}
 */
Product.prototype.getCategoryManager = function () {
    return this.factory.getCategoryManager();
};

/**
 * @returns {Category|null}
 */
Product.prototype.getCategoryWithLongestActivePath = function () {
    if (_.isEmpty(this.categoryIdPaths)) {
        return;
    }

    // get reverse sorted category paths
    var pathLengths = _.map(this.categoryIdPaths, function (categoryIdPath) {
        return categoryIdPath.length;
    });
    pathLengths.reverse();

    for (var index in pathLengths) {
        var pathLength = pathLengths[index];
        var categoryPath = this.categoryIdPaths[index];
        var leafId = categoryPath[categoryPath.length - 1];

        var category = this.getCategoryManager().getCategory(leafId, true);

        if (category.isPathActive()) {
            return category;
        }
    }
    return null;
};

/**
 * Get variant by id.
 *
 * @param {number} variantId The variant id.
 *
 * @returns {Variant}
 */
Product.prototype.getVariantById = function (variantId) {
    if (this.variants && this.variants[variantId]) {
        return this.variants[variantId];
    }

    return null;
};

/**
 * @param {string} ean
 *
 * @return {Variant[]}
 */
Product.prototype.getVariantsByEan = function (ean) {
    var variants = [];
    this.variants.forEach(function (variant) {
        if (variant.ean === ean) {
            variants.push(variant);
        }
    });
    return variants;
};

Product.parseVariants = function (jsonObject, product, attributeName) {
    var variants;
    if (jsonObject.variants && jsonObject.variants.length > 0) {
        variants = [];
        for (var i = 0; i < jsonObject.variants.length; i++) {
            var variant = jsonObject.variants[i];
            variants.push(Variant.createFromJson(variant, product));
        }
    } else {
       variants = null;
    }
    return variants;
};

Product.parseStyles = function (jsonObject) {
    var styles;
    var that = this;
    if (jsonObject.styles && jsonObject.styles.length > 0) {
        styles = [];
        jsonObject.styles.forEach(function (style) {
            styles.push(that.createFromJson(style));
        });
    } else {
        styles = null;
    }
    return styles;
};

Product.parseFacetIds = function (jsonObject) {
    var ids = this.parseFacetIdsInAttributesMerged(jsonObject);
    if (ids === null) {
        ids = this.parseFacetIdsInVariants(jsonObject);
    }
    if (ids === null) {
        ids = this.parseFacetIdsInBrand(jsonObject);
    }
    return (ids !== null) ? ids : null;
};

Product.parseFacetIdsInAttributesMerged = function (jsonObject) {
    if (!jsonObject.attributes_merged) {
        return null;
    }

    return this.parseAttributesJson(jsonObject.attributes_merged);
};

Product.parseAttributesJson = function (AttributesJsonObject) {
    var ids = {};

    for (var group in AttributesJsonObject) {
        var facetIds = AttributesJsonObject[group];

        var gid = group.substr(11); // rm prefix "attributes"

        ids[gid] = facetIds;
    }

    return ids;
};

Product.parseFacetIdsInVariants = function (jsonObject) {
    if (jsonObject.variants) {
        var ids = [];

        for (var i = 0; i < jsonObject.variants.length; i++) {
            var variant = jsonObject.variants[i];
            ids.push(this.parseAttributesJson(variant.attributes));
        }
        ids = FacetGroupSet.mergeFacetIds(ids);
        return ids;
    } else if (jsonObject.default_variant) {
        ids = this.parseAttributesJson(jsonObject.default_variant.attributes);
        return ids;
    }
    return null;
};

Product.parseFacetIdsInBrand = function (jsonObject) {
    if (!jsonObject.brand_id) {
        return null;
    }
    return [jsonObject.brand_id];
};

/**
 * @static
 * @param {Object} jsonObject
 * @param DefaultModelFactory factory
 *
 * @return {Product}
 */
Product.createFromJson = function (jsonObject, factory) {
    var product = new Product();

    product.factory = factory;

    product.id = jsonObject.id;
    product.name = jsonObject.name;
    product.isActive = typeof(jsonObject.active) != 'undefined' ? jsonObject.active : true;

    product.isSale = typeof(jsonObject.sale) != 'undefined' ? jsonObject.sale : undefined;
    product.descriptionShort = typeof(jsonObject.description_short) != 'undefined' ? jsonObject.description_short : undefined;
    product.descriptionLong = typeof(jsonObject.description_long) != 'undefined' ? jsonObject.description_long : undefined;
    product.brandId = typeof(jsonObject.brand_id) != 'undefined' ? jsonObject.brand_id : undefined;
    product.merchantId = typeof(jsonObject.merchant_id) != 'undefined' ? jsonObject.merchant_id : undefined;

    product.minPrice = typeof(jsonObject.min_price) != 'undefined' ? jsonObject.min_price : undefined;
    product.maxPrice = typeof(jsonObject.max_price) != 'undefined' ? jsonObject.max_price : undefined;
    product.maxSavingsPrice = typeof(jsonObject.max_savings) != 'undefined' ? jsonObject.max_savings : undefined;
    product.maxSavingsPercentage = typeof(jsonObject.max_savings_percentage) != 'undefined' ? jsonObject.max_savings_percentage : undefined;


    product.defaultImage = typeof(jsonObject.default_image) != 'undefined' ? ImageModel.createFromJson(jsonObject.default_image) : undefined;
    product.defaultVariant = typeof(jsonObject.default_variant) != 'undefined' ? Variant.createFromJson(jsonObject.default_variant, product) : undefined;
    product.variants = this.parseVariants(jsonObject, product);
    product.inactiveVariants = this.parseVariants(jsonObject, product, 'inactive_variants');

    product.styles = this.parseStyles(jsonObject);

    var getAppCategoryKey = function () {
        var regex = /^categories.*/;
        for (var key in jsonObject) {
            var match = regex.exec(key);
            if (match) {
                var key = match[0];
                return jsonObject[key];
            }
        }
        return false;
    };

    var appCategoryKey = getAppCategoryKey();

    product.categoryIdPaths = appCategoryKey ? appCategoryKey : null;
    product.facetIds = this.parseFacetIds(jsonObject);

    return product;
};

/**
 * @returns JSONObject
 **/

Product.prototype.toJSON = function() {
    var jsonObj = {};

    jsonObj.id = this.id;
    jsonObj.name = this.name;

    if (typeof(this.isSale) !== 'undefined') {
        jsonObj.sale = this.isSale;
    }
    if (typeof(this.descriptionShort) !== 'undefined') {
       jsonObj.descriptionShort = this.descriptionShort;
    }
    if (typeof(this.descriptionLong) !== 'undefined') {
        jsonObj.descriptionLong = this.descriptionLong;
    }
    if (typeof(this.brandId) !== 'undefined') {
        var brand = this.brand;
        jsonObj.brand = {
            "id" : brand ? brand.id : undefined,
            "name": brand ? brand.name : undefined
        };
    }
    if (typeof(this.merchantId) !== 'undefined') {
        jsonObj.merchantId = this.merchantId;
    }

    if (typeof(this.minPrice) !== 'undefined') {
        jsonObj.minPrice = this.minPrice;
    }
    if (typeof(this.maxPrice) !== 'undefined') {
        jsonObj.maxPrice = this.maxPrice;
    }
    if (typeof(this.maxSavingsPrice) !== 'undefined') {
        jsonObj.maxSavingsPrice = this.maxSavingsPrice;
    }
    if (typeof(this.maxSavingsPercentage) !== 'undefined') {
        jsonObj.maxSavingsPercentage = this.maxSavingsPercentage;
    }

    if (typeof(this.defaultImage) !== 'undefined') {
        jsonObj.defaultImage = {
            "url" : this.defaultImage.getUrl()
        }
    }
    if (typeof(this.defaultVariant) !== 'undefined') {
        var images = this.defaultVariant.jsonObject ? this.defaultVariant.getImages() : [];
        var imagesPopulated = populateImages(images);

        jsonObj.defaultVariant = {
            "id" : this.defaultVariant.jsonObject ? this.defaultVariant.jsonObject.id : 'undefined',
            "ean" : this.defaultVariant.jsonObject ? this.defaultVariant.jsonObject.ean : 'undefined',
            "price" : this.defaultVariant.jsonObject ? this.defaultVariant.jsonObject.price : 'undefined',
            "images" : imagesPopulated
        }

        if (this.defaultVariant.jsonObject && this.defaultVariant.jsonObject.old_price) {
            jsonObj.defaultVariant.oldPrice = this.defaultVariant.jsonObject.old_price;
        }
    }

    if (this.variants !== null) {

        var variantsPopulated = this.variants.map(function(variant) {
           var imagesPopulated = populateImages(variant.getImages());
           var variantPopulated = {
               "id" : variant.jsonObject ? variant.jsonObject.id : 'undefined',
               "ean" : variant.jsonObject ? variant.jsonObject.ean : 'undefined',
               "price" : variant.jsonObject ? variant.jsonObject.price : 'undefined',
               "images" : imagesPopulated
           };

            return variantPopulated;
        });

        jsonObj.variants = variantsPopulated;
    }

    if (this.inactiveVariants !== null) {

        var variantsPopulated = this.inactiveVariants.map(function(variant) {
            var imagesPopulated = populateImages(variant.getImages());
            var variantPopulated = {
                "id" : variant.jsonObject ? variant.jsonObject.id : 'undefined',
                "ean" : variant.jsonObject ? variant.jsonObject.ean : 'undefined',
                "price" : variant.jsonObject ? variant.jsonObject.price : 'undefined',
                "images" : imagesPopulated
            };

            return variantPopulated;
        });

        jsonObj.variants = variantsPopulated;
    }

    if (this.categoryIdPaths !== null) {
        jsonObj.categoryIdPaths = this.categoryIdPaths;
    }

    return jsonObj;
};

// dot access
Object.defineProperty(Product.prototype, 'active', {
    get: Product.prototype.isActive
});

// dot access
Object.defineProperty(Product.prototype, 'category', {
    get: Product.prototype.getCategory
});

Object.defineProperty(Product.prototype, 'brand', {
    get: Product.prototype.getBrand
});

Object.defineProperty(Product.prototype, 'categoryWithLongestActivePath', {
    get: Product.prototype.getCategoryWithLongestActivePath
});

module.exports = Product;

var populateImages = function(images) {
    return images.map(function(image) {
        var imagePopulated = {
            "url" : image.getUrl()
        };
        if(image.type) {
            imagePopulated.type = image.type;
        }
        if(image.tags) {
            imagePopulated.tags = image.tags;
        }
        return imagePopulated;
    });
};