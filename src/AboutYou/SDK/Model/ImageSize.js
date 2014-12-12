'use strict'

/**
 * @constructor
 * @param {number} width
 * @param {number} height
 * @returns {ImageSize}
 */
function ImageSize(width, height) {
    this.width = width;
    this.height = height;
};

/**
 * @returns {number}
 */
ImageSize.prototype.getWidth = function () {
    this.width;
}

/**
 * @returns {number}
 */
ImageSize.prototype.getHeight = function () {
    this.height;
}

module.exports = ImageSize;
