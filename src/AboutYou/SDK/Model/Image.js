'use strict'

var ImageSize = require('./ImageSize');

/**
 * @constructor
 * @returns {Image}
 */
function Image() {
    this.MIN_WIDTH = 50;
    this.MIN_HEIGHT = 50;
    this.MAX_WIDTH = 1400;
    this.MAX_HEIGHT = 2000;
};

/**
 * @static
 * @param {Object} jsonObject
 * @returns {ImageModel}
 */
Image.createFromJson = function (jsonObject) {
    var image = new Image();

    image.additionalItems = typeof(jsonObject.additional_items) != 'undefined' ? jsonObject.additional_items : null;
    image.angle = typeof(jsonObject.angle) != 'undefined' ? jsonObject.angle : null;
    image.background = typeof(jsonObject.background) != 'undefined' ? jsonObject.background : null;
    image.color = typeof(jsonObject.color) != 'undefined' ? jsonObject.color : null;
    image.ext = typeof(jsonObject.ext) != 'undefined' ? jsonObject.ext : null;
    image.filesize = typeof(jsonObject.size) != 'undefined' ? jsonObject.size : 0;
    image.focus = typeof(jsonObject.focus) != 'undefined' ? jsonObject.focus : null;
    image.gender = typeof(jsonObject.gender) != 'undefined' ? jsonObject.gender : null;
    image.hash = jsonObject.hash;
    image.mimetype = jsonObject.mime;
    image.modelData = typeof(jsonObject.model_data) != 'undefined' ? jsonObject.model_data : null;
    image.nextDetailLevel = typeof(jsonObject.next_detail_level) != 'undefined' ? jsonObject.next_detail_level : null;
    image.preparation = typeof(jsonObject.preparation) != 'undefined' ? jsonObject.preparation : null;
    image.tags = typeof(jsonObject.tags) != 'undefined' ? jsonObject.tags : null;
    image.type = typeof(jsonObject.type) != 'undefined' ? jsonObject.type : null;
    image.view = typeof(jsonObject.view) != 'undefined' ? jsonObject.view : null;

    image.imageSize = new ImageSize(jsonObject.image.width, jsonObject.image.height);

    return image;
};

Image.getBaseUrl = function () {
    return Image.baseUrl;
};

Image.setBaseUrl = function (baseUrl) {
    Image.baseUrl = baseUrl || '';
};

/**
 * returns null, if not set or an array of EAN codes
 *
 * @returns {string[]}
 */
Image.prototype.getAdditionalItems = function () {
    return this.additionalItems;
};

/**
 * returns null, if not set or some of "rigth", "left"
 *
 * @returns {null|string}
 */
Image.prototype.getAngle = function () {
    return this.angle;
};

/**
 * returns null, if not set or e.g. "grey", "white", "ambience" or "transparent"
 *
 * @returns {null|string}
 */
Image.prototype.getBackground = function () {
    return this.background;
};

/**
 * @return {null|string[]}
 */
Image.prototype.getColor = function () {
    return this.color;
};

/**
 * @returns {null|string}
 */
Image.prototype.getExt = function () {
    return this.ext;
};

/**
 * @returns {number}
 */
Image.prototype.getFileSize = function () {
    return this.filesize;
};

/**
 * returns null, if not set or some of "combination", "product", "detail", "haptic"
 *
 * @returns {null|string}
 */
Image.prototype.getFocus = function () {
    return this.focus;
};

/**
 * returns null, if not set or some of "female", "male"
 *
 * @returns {null|string}
 */
Image.prototype.getGender = function () {
    return this.gender;
};

/**
 * @returns {null|string}
 */
Image.prototype.getHash = function () {
    return this.hash;
};

/**
 * @returns {ImageSize}
 */
Image.prototype.getImageSize = function () {
    return this.imageSize;
};

/**
 * returns null, if not set or an object with human model specific data, e.g.
 * - firstname (string)
 * - lastname (string)
 * - gender ("female" or "female)
 * - height (number)
 * - chest (numnber)
 * - waist (number)
 * - hips (number)
 * - arms (number)
 * - legs (number)
 * all sizes are in metric unit mm
 *
 * @returns {null|Object}
 */
Image.prototype.getModelData = function () {
    return this.modelData;
};

/**
 * @returns {string}
 */
Image.prototype.getMimetype = function () {
    return this.mimetype;
};

/**
 * several pictures of one product may have the same detail_level
 * from small to large
 *
 * @returns {null|number}
 */
Image.prototype.getNextDetailLevel = function () {
    return this.nextDetailLevel;
};

/**
 * returns null, if not set or some of "draped", "pleated", "opened"
 *
 * @returns {null|string}
 */
Image.prototype.getPreparation = function () {
    return this.preparation;
};

/**
 * @returns {null|string[]}
 */
Image.prototype.getTags = function () {
    return this.tags;
};

/**
 * returns null, if not set or some of "model", "bust", "tray"
 *
 * @returns {null|string}
 */
Image.prototype.getType = function () {
    return this.type;
};

/**
 * returns null, if not set or some of "front", "back", "side", "top", "bottom"
 *
 * @returns {null|string}
 */
Image.prototype.getView = function () {
    return this.view;
};


/**
 * @param {number} width
 * @param {number} height
 *
 * @returns {string} returns the relative url
 */
Image.prototype.getUrl = function (width, height) {
    if (width || height) {
        width = width || 200;
        height = height || 200;

        width = Math.max(Math.min(width, this.MAX_WIDTH), this.MIN_WIDTH);
        height = Math.max(Math.min(height, this.MAX_WIDTH), this.MIN_WIDTH);

        return Image.getBaseUrl() + '/' + this.hash + '?width=' + width + '&height=' + height;
    } else {
        return Image.getBaseUrl() + '/' + this.hash;
    }
};

// dot accessors
Object.defineProperty(Image.prototype, 'defaultImage', {
    get: Image.prototype.getDefaultImage
});

Object.defineProperty(Image.prototype, 'url', {
    get: Image.prototype.getUrl
});

module.exports = Image;