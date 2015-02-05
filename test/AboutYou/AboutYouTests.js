'use strict';

// configurations
var APP_DETAILS = {
    "appId": 100,
    "appPassword": '3ed93394c2b5ebd12c104b177b928ad0',
    "apiEndPoint": 'live'
};

var when = require('when');

// modules
var _ = require('underscore');
var chai = require('chai');
var aboutYou = require('../../src/AboutYou/AboutYou')(APP_DETAILS.appId, APP_DETAILS.appPassword, APP_DETAILS.apiEndPoint);
var ProductSearchCriteria = require('../../src/AboutYou/SDK/Criteria/ProductSearchCriteria');


var expect = chai.expect;

var chars = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

// tests
describe('AboutYou', function () {

    describe('ProductSearchCriteria Constructor', function () {
        it('should set the sessionId correctly', function (done) {
            var rand = _.shuffle(chars).join('');

            var criteria = new ProductSearchCriteria(rand);
            expect(rand).equal(criteria.getSessionId());
            done();
        });
    });

    describe('ProductSearchCriteria.filterBy', function () {
        it('should set the filters correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            var key = _.shuffle(chars).join('');
            var val = _.shuffle(chars).join('');

            criteria.filterBy(key, val);

            var filter = criteria.getFilter(key);
            expect(filter).equal(val);

            done();
        });
    });

    describe('ProductSearchCriteria.filterBySale', function () {
        it('should set the sale filter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            var values = [true, null];

            for (var i = 0; i < values.length; i++) {
                criteria.filterBySale(values[i]);
                expect(criteria.getSaleFilter()).equal(values[i]);
            }

            done();
        });
    });

    describe('ProductSearchCriteria.filterBySearchword', function () {
        it('should set the searchword filter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var str = chars.join('');
            criteria.filterBySearchword(str);
            expect(criteria.getSearchwordFilter()).equal(str);
            done();
        });
    });

    describe('ProductSearchCriteria.filterByCategoryIds', function () {
        it('should set the category filter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var id1 = _.random(1000, 9999);
            var id2 = _.random(1000, 9999);

            criteria.filterByCategoryIds([id1]);
            criteria.filterByCategoryIds([id2], true); //append
            expect(criteria.getCategoryFilter()).to.eql([id1, id2]);
            done();
        });

        it('should filer the category correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.filterByCategoryIds([74417, 74419]);

            criteria.selectProductFields([
                aboutYou.productFields.CATEGORIES
            ]);

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productResult) {
                    var products = productResult.products;
                    products.forEach(function (product) {
                        expect(product.category.name).not.to.be.empty;
                    });
                    done();
                }
            );
        });
    });

    describe('ProductSearchCriteria.filterByFacetIds', function () {
        it('should set the facet filter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var groupId = _.random(0, 100);
            var facetId1 = _.random(1000, 9999);
            var facetId2 = _.random(1000, 9999);

            var arg = {
                groupId: [facetId1, facetId2]
            };

            criteria.filterByFacetIds(arg);
            expect(criteria.getFacetFilter()).to.eql(arg);
            done();
        });
    });

    describe('ProductSearchCriteria.filterByPriceRange', function () {
        it('should set the price range filter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            var min = _.random(50, 100);
            var max = _.random(1, 49);
            criteria.filterByPriceRange(min, max);

            expect(criteria.getPriceRangeFilter()).to.eql({'from': min, 'to': max});
            done();
        });
    });


    describe('ProductSearchCriteria.sortBy', function () {
        it('should set the sorting parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            criteria.sortBy(
                ProductSearchCriteria.SORT_TYPE_MOST_VIEWED,
                ProductSearchCriteria.SORT_DESC);

            expect(criteria._result).to.eql({
                'sort': {
                    'by': 'most_viewed', 'direction': 'desc'}
            });
            done();
        });
    });

    describe('ProductSearchCriteria.setLimit', function () {
        it('should set the limit and offset parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            var limit = _.random(0, 1000);
            var offset = _.random(0, 1000);
            criteria.setLimit(limit, offset);

            expect(criteria._result).to.eql({
                'limit': 200,
                'offset': offset
            });
            done();
        });
    });


    describe('ProductSearchCriteria.selectSales', function () {
        it('should set the sale parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectSales(true);
            expect(criteria._result['sale']).equal(true);

            criteria.selectSales(false);
            expect(criteria._result).to.eql({});

            done();
        });

        it('should return a result with sale facets', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectSales();

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productResult) {
                    var saleFacet = productResult.getSaleCounts();
                    expect(saleFacet.productCountTotal).not.to.be.empty;
                    expect(saleFacet.productCountInSale).not.to.be.empty;
                    expect(saleFacet.productCountNotInSale).not.to.be.empty;
                    done();
                }
            );
        });

        it('should return a result with price ranges', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectPriceRanges();

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productResult) {
                    var priceRanges = productResult.getPriceRanges();

                    priceRanges.forEach(function (priceRange) {
                        expect(priceRange.from).exist;
                        expect(priceRange.to).exist;
                        expect(priceRange.productCount).exist;
                    });
                    done();
                }
            );
        });

    });

    describe('ProductSearchCriteria.selectCategories', function () {
        it('should set the category parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectCategories(true);
            expect(criteria._result['categories']).equal(true);

            criteria.selectCategories(false);
            expect(criteria._result).to.eql({});

            done();
        });

        it('should return a search result with categories', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectCategories(true);

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productResult) {
                    var categories = productResult.categories;
                    categories.forEach(function (category) {
                        expect(category.name).not.to.be.empty;
                    });
                    done();
                }
            );
        });
    });

    describe('ProductSearchCriteria.selectPriceRanges', function () {
        it('should set the price range parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            criteria.selectPriceRanges(true);
            expect(criteria._result['price']).equal(true);

            criteria.selectPriceRanges(false);
            expect(criteria._result).to.eql({});

            done();
        });

    });

    describe('ProductSearchCriteria.selectFacetsByGroupId', function () {
        it('should set a facet for a given group correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var groupId = _.random(0, 100);
            var limit = _.random(50, 100);
            criteria.selectFacetsByGroupId(groupId, limit);

            expect(criteria._result['facets'][groupId]).to.eql({
                'limit': limit
            });

            done();
        });
    });

    describe('ProductSearchCriteria.selectFacetsByGroupId', function () {
        it('should return a facet for a given group correctly', function (done) {
            var criteria = aboutYou.productSearchCriteria;

            criteria.filterByCategoryIds([74418]);
            criteria.selectFacetsByGroupId(0, criteria.FACETS_UNLIMITED);

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productSearchResult) {
                    var facets = productSearchResult.facets;

                    facets[0].facetCounts.forEach(function (facetCount) {
                        expect(facetCount.facet.name).not.to.be.empty;
                        expect(facetCount.productCount).not.to.be.empty;
                    });
                }
            );
            done();
        });
    });

    describe('ProductSearchCriteria.selectAllFacets', function () {
        it('should set facets for all facet groupsContainer', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var limit = _.random(50, 100);

            criteria.selectAllFacets(limit);

            expect(criteria._result['facets'][ProductSearchCriteria.FACETS_ALL]).to.eql({
                'limit': limit
            });

            done();
        });
    });

    describe('ProductSearchCriteria.boostProducts', function () {
        it('should set product boosts correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var limit = _.random(50, 100);

            var ids = [];
            for (var i = 0; i < 100; i++) {
                var id = _.random(1000000, 9999999);
                ids.push(id);
            }

            criteria.boostProducts(ids);
            expect(criteria._result['boosts']).to.eql(ids);

            done();
        });
    });

    describe('ProductSearchCriteria.boostProducts', function () {
        it('should set product boosts correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            var limit = _.random(50, 100);

            var ids = [];
            for (var i = 0; i < 100; i++) {
                var id = _.random(1000000, 9999999);
                ids.push(id);
            }

            criteria.boostProducts(ids);
            expect(criteria._result['boosts']).to.eql(ids);

            done();
        });
    });

    describe('ProductSearchCriteria.selectProductFields', function () {
        it('should set product fields parameter correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');
            var fields = [
                aboutYou.getProductFields().DEFAULT_VARIANT,
                aboutYou.getProductFields().DEFAULT_IMAGE
            ];

            criteria.selectProductFields(fields);
            expect(criteria._result['fields']).to.eql([
                aboutYou.getProductFields().DEFAULT_VARIANT,
                aboutYou.getProductFields().DEFAULT_IMAGE,
                aboutYou.getProductFields().ATTRIBUTES_MERGED
            ]);

            done();
        });
    });

    describe('ProductSearchCriteria.selectProductFields(BRAND)', function () {
        it('should return the product brand name', function (done) {

            var criteria = aboutYou.productSearchCriteria
                .selectProductFields([aboutYou.productFields.BRAND]);

            aboutYou.fetchProductSearch(
                criteria,
                function (error, productResult) {
                    var products = productResult.products;
                    products.forEach(function (product) {
                        expect(product.brand.name).not.to.be.empty;
                    });
                }
            );

            done();
        });
    });

    describe('ProductSearchCriteria.setSessionId', function () {
        it('should set the session id correctly', function (done) {
            var criteria = new ProductSearchCriteria('session');

            expect(criteria.getSessionId()).to.eql('session');

            var session = _.shuffle(chars).join('');
            criteria.setSessionId(session);

            expect(criteria.getSessionId()).to.eql(session);

            done();
        });
    });


    describe('AY.fetchCategoryTree', function () {
        it('should return a valid category tree result', function (done) {
            aboutYou.fetchCategoryTree().then(function (tree) {
                var categories = tree.getCategories();

                for (var i = 0; i < categories.length; i++) {
                    var category = categories[i];

                    var children = category.subcategories;

                    for (var j = 0; j < children.length; j++) {
                        var child = children[j];
                        expect(child.getParentId()).to.eql(category.getId());
                    }
                }

                var activeCategories = tree.getCategories(true);


                for (var i = 0; i < activeCategories.length; i++) {
                    var category = categories[i];
                    var active = category.isActive();

                    expect(active).to.eql(true);
                }

                done();
            });
        });
        it('should return a valid JSON category tree result', function (done) {
            aboutYou.fetchCategoryTree().then(function (tree) {
                tree = tree.toJSON();
                expect(tree).to.be.instanceof(Array);
                expect(tree[0].subcategories).to.be.instanceof(Array);
                expect(tree[0].subcategories[0].subcategories).to.be.instanceof(Array);
                done();
            });
        });
    });

    describe('fetchProductsByIds()', function () {

        it('should return a reponse for a single id', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds(508558, ['variants', 'default_image'])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(products).not.to.be.empty;

                    done();
                });
        });


        it('should return a reponse for an array of ids', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558, 508560], ['variants', 'default_image', 'attributes_merged'])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(products).to.have.length(2);

                    done();
                });
        });


        it('should return the BRAND id of a product', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], ['brand_id'])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(products[0].brand.name).to.equal('TAMARIS');

                    done();
                });
        });


        it('should return the DESCRIPTION_LONG of a product', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558, 508560],
                [aboutYou.getProductFields().DESCRIPTION_LONG])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(products[0].getDescriptionLong()).to.have.length.above(1);

                    done();
                });
        });

        it('should return the DESCRIPTION_SHORT of a product', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558, 508560], [
                aboutYou.getProductFields().DESCRIPTION_SHORT
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].getDescriptionShort()).to.have.length.above(1);
                done();
            });
        });

        it('should return the DEFAULT_VARIANT of a product', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [
                aboutYou.getProductFields().DEFAULT_VARIANT
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].getDefaultVariant().getId()).to.equal(6736990);
                done();
            });
        });

        it('should return a array of VARIANT objects', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [
                aboutYou.getProductFields().VARIANTS
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].getVariants()).not.to.be.empty;
                done();
            });
        });


        it('should return a array of MAX_PRICE objects', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [
                aboutYou.getProductFields().MAX_PRICE
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].getMaxPrice()).to.equal(5999);
                done();
            });
        });

        it('should return a array of MIN_PRICE objects', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [
                aboutYou.getProductFields().MIN_PRICE
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].getMinPrice()).to.equal(5999);
                done();
            });
        });

        it('should return a array of IS_SALE objects', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [
                aboutYou.getProductFields().IS_SALE
            ]).then(function (productResult) {
                var products = productResult.getProducts();
                expect(products[0].isSale).to.be.true;
                done();
            });
        });

        it('should return the DEFAULT IMAGE', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558, 508560], [aboutYou.getProductFields().DEFAULT_IMAGE])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(productResult.getProducts()[0].getDefaultImage().getUrl(250, 250)).not.to.be.empty;
                    done();
                });
        });

        it('should return the the facetIds of all variants', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [aboutYou.getProductFields().ATTRIBUTES_MERGED])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    expect(products[0].getFacetGroupSet().ids).not.to.be.empty;
                    done();
                });
        });

        it('should return all catergories of a product', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds([508558], [aboutYou.getProductFields().CATEGORIES])
                .then(function (productResult) {
                    var products = productResult.getProducts();
                    done();
                });
        });

        it('should return the javascript tag', function (done) {
            var url = aboutYou.getJavaScriptURL();
            expect(url.length).to.be.above(2);
            done();
        });

        // Callback style
        it('should return a response for an array of ids via CALLBACK', function (done) {
            aboutYou.fetchProductsByIds([508558, 508560],
                [ aboutYou.getProductFields().VARIANTS,
                    aboutYou.getProductFields().DEFAULT_IMAGE,
                    aboutYou.getProductFields().ATTRIBUTES_MERGED
                ],
                function (err, productResult) {
                    var products = productResult.getProducts();
                    expect(products).to.have.length(2);
                    done();
                });
        });

        it('should return a response for a request without a specified field array via CALLBACK', function (done) {
            aboutYou.fetchProductsByIds([508558, 508560],
                function (err, productResult) {
                    var products = productResult.getProducts();
                    expect(products).to.have.length(2);
                    done();
                });
        });

    });


    describe('fetchAutocomplete()', function () {
        it('should find matching products and categories', function (done) {
            aboutYou.fetchAutocomplete('jeans').then(function (result) {
                var categories = result.categories;
                var products = result.products;

                expect(categories.length).to.be.above(1);
                expect(products.length).to.be.above(1);

                done();
            });
        });

        it('should find matching products and categories with a limit', function (done) {
            aboutYou.fetchAutocomplete('jeans', 10, function (error, result) {
                var products = result.products;

                expect(products.length).to.be.above(1);

                done();
            });
        });
    });

    describe('fetchSuggest()', function () {
        it('should find similar suggestions', function (done) {
            aboutYou.fetchSuggest('hose').then(function (result) {
                expect(result).to.include('jeans');
                done();
            });
        });
    });

    describe('fetchProductSearch()', function () {

        it('should find products by searchword', function (done) {
            var sessionId = _.shuffle(chars).join('');
            var criteria = aboutYou.productSearchCriteria;
            criteria.filterBySearchword('hose');
            criteria.setLimit(200, 0);

            aboutYou.fetchProductSearch(criteria).then(function (result) {
                var products = result.getProducts();
                var hasHoseInName = 0;
                for (var i = 0; i < products.length; i++) {
                    var product = products[i];
                    var name = product.getName();

                    if (name.toLowerCase().indexOf('hose') > -1) {
                        hasHoseInName++;
                    }
                }

                expect(hasHoseInName).to.be.above(100);
                expect(result.getProductCount()).to.be.above(500);
                done();
            });
        });

        it('should return products in a proper JSON format', function (done) {
            var sessionId = _.shuffle(chars).join('');
            var criteria = new ProductSearchCriteria(sessionId);

            criteria.filterByCategoryIds([74417, 74419]);

            criteria.selectProductFields(
                [
                    'brand_id'
                ]
            );

            aboutYou.fetchProductSearch(
                criteria,
                function(error, productSearchResult) {
                    var jsonProducts = productSearchResult.toJSON();
                    expect(jsonProducts).to.be.instanceof(Array);
                    expect(jsonProducts[0].brand.id).not.to.be.empty;
                    expect(jsonProducts[0].brand.name).not.to.be.empty;
                    done();
                }
            );
        });

        it('should find category facets correctly', function (done) {
            var sessionId = _.shuffle(chars).join('');
            var criteria = new ProductSearchCriteria(sessionId);
            criteria.filterBySearchword('hose');
            criteria.selectCategories(true);

            aboutYou.fetchProductSearch(criteria).then(function (result) {
                var categories = result.getCategories();
                done();
            });
        });
    });

    describe('fetchCategoriesByIds()', function () {
        it('should return apps categories', function (done) {
            var defer = when.defer();
            aboutYou.fetchCategoriesByIds().then(function (result) {
                var categories = result.getCategories();
                expect(categories).not.to.be.empty;
                done();
            });
        });

        it('should return categories by id', function (done) {
            var defer = when.defer();
            aboutYou.fetchCategoriesByIds([74416]).then(function (result) {
                var categories = result.getCategories();
                expect(categories[0].getId()).to.be.eql(74416);
                done();
            });
        });

        it('should access category by dot notation', function (done) {
            var defer = when.defer();
            aboutYou.fetchCategoriesByIds([74418]).then(function (result) {
                var categories = result.getCategories();
                expect(categories[0].parent).not.to.be.empty;
                done();
            });
        });

        it('should return apps categories PROMISE STYLE', function (done) {
            aboutYou.getCategoryManager().then(function (categoryManager) {
                var categories = categoryManager.categories;
                expect(categories).not.to.be.empty;
                done();
            });
        });

        it('should return apps categories CALLBACK STYLE', function (done) {
            aboutYou.getCategoryManager(function (error, categoryManager) {
                var categories = categoryManager.categories;
                expect(categories).not.to.be.empty;
                done();
            });
        });
    });

    describe('fetchProductsByEans()', function () {
        it('should find products by correct EAN', function (done) {
            var criteria = aboutYou.getProductSearchCriteria('session_id');
            criteria.selectProductFields(['default_variant']);
            criteria.setLimit(1);
            aboutYou.fetchProductSearch(criteria).then(function (searchResult) {
                var products = searchResult.products;
                var product = products[0];

                var variant = product.getDefaultVariant();
                var ean = variant.getEan();

                aboutYou.fetchProductsByEans([ean]).then(function (eansResult) {
                    var products = eansResult.getProducts();
                    var product2 = products[0];

                    expect(product.getId()).to.be.eql(product2.getId());
                    done();
                });
            });
        });
    });

    describe('fetchVariantsByIds()', function () {
        it('should the variants for given ids', function (done) {
            var defer = when.defer();
            aboutYou.fetchVariantsByIds([7482747]).then(function (result) {
                var variants = result.getVariantsFound();
                expect(variants).not.to.be.empty;
                done();
            });
        });
    });

    describe('fetchFacet()', function () {
        it('should return single facet by id and group id', function (done) {
            var defer = when.defer();
            aboutYou.fetchFacet([
                {"group_id": 1, "id": 426},
                {"group_id": 1, "id": 427}
            ]).then(function (facets) {
                expect(facets).not.to.be.empty;
                done();
            });
        });
    });

    describe('fetchFacets()', function () {
        it('should return an array of facets by id', function (done) {
            var defer = when.defer();
            aboutYou.fetchFacets([1], function (error, facets) {
                expect(facets).not.to.be.empty;
                done();
            });
        });
    });

});

describe('ProductsResult', function () {
    describe('getProductsNotFound()', function () {
        it('should return an ProductsNotFound error', function (done) {
            var defer = when.defer();
            aboutYou.fetchProductsByIds(123, ['default_image'])
                .then(function (productResult) {
                    var productsNotFound = productResult.getProductsNotFound();
                    expect(productsNotFound[0]).to.equal('123');
                    done();
                });
        });
    });
});
