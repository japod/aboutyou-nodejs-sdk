'use strict'

var _ = require('underscore');

/*
 * id and name is set per default
 */

ProductFields.IS_ACTIVE = "active";
ProductFields.BRAND = "brand_id";
ProductFields.DESCRIPTION_LONG = "description_long";
ProductFields.DESCRIPTION_SHORT = "description_short";
ProductFields.DEFAULT_VARIANT = "default_variant";
ProductFields.VARIANTS = "variants";
ProductFields.MIN_PRICE = "min_price";
ProductFields.MAX_PRICE = "max_price";
ProductFields.IS_SALE = "sale";
ProductFields.DEFAULT_IMAGE = "default_image";
ProductFields.ATTRIBUTES_MERGED = "attributes_merged";
ProductFields.CATEGORIES = "categories";
ProductFields.INACTIVE_VARIANTS = "inactive_variants";
ProductFields.MAX_SAVINGS = "max_savings";
ProductFields.MAX_SAVINGS_PERCENTAGE = "max_savings_percentage";
ProductFields.tags = "tags";
ProductFields.styles = "styles";

ProductFields.CONSTANTS = {
    IS_ACTIVE: "active",
    BRAND: "brand_id",
    DESCRIPTION_LONG: "description_long",
    DESCRIPTION_SHORT: "description_short",
    DEFAULT_VARIANT: "default_variant",
    VARIANTS: "variants",
    MIN_PRICE: "min_price",
    MAX_PRICE: "max_price",
    IS_SALE: "sale",
    DEFAULT_IMAGE: "default_image",
    ATTRIBUTES_MERGED: "attributes_merged",
    CATEGORIES: "categories",
    INACTIVE_VARIANTS: "inactive_variants",
    MAX_SAVINGS: "max_savings",
    MAX_SAVINGS_PERCENTAGE: "max_savings_percentage",
    TAGS: "tags",
    STYLES: "styles"
};

function ProductFields() {
};

ProductFields.filterFields = function (fields) {
    fields = _.uniq(fields);

    // styles are not yet supported by the API
    var index = _.indexOf(this.STYLES, fields);

    if (index != -1) {
        delete fields[index];
    }

    if (_.indexOf(this.ATTRIBUTES_MERGED, fields) === -1 && this.requiresFacets(fields)) {
        fields.push(ProductFields.ATTRIBUTES_MERGED);
    }
    return fields;
};

ProductFields.requiresFacets = function (fields) {
    var requiredFacetFields = _.intersection([
        ProductFields.BRAND,
        ProductFields.VARIANTS,
        ProductFields.DEFAULT_VARIANT,
        ProductFields.ATTRIBUTES_MERGED
    ], fields);

    return requiredFacetFields.length;
};

ProductFields.requiresCategories = function (fields) {
    if (_.indexOf(fields, ProductFields.CATEGORIES) != -1) {
        return true;
    }
    return false;
}

module.exports = ProductFields;