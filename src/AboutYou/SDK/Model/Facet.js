'use strict'

/**
 * @constructor
 * @param {number}      id
 * @param {string}      name
 * @param {string}      value
 * @param {number}      groupId
 * @param {string}      groupName
 * @param {Object[]}    options
 * @returns {Facet}
 */
function Facet(id, name, value, groupId, groupName, options) {
    options = options || null;
    this.id = id;
    this.name = name;
    this.value = value;
    this.groupId = groupId;
    this.groupName = groupName;
    this.options = options;
};

/**
 * @static
 * @param {Object} jsonObject
 *
 * @returns {Facet}
 */
Facet.createFromJson = function (jsonObject) {
    var value = jsonObject.value ? jsonObject.value : null;
    var options = jsonObject.options ? jsonObject.options : null;
    return new Facet(jsonObject.facet_id, jsonObject.name, value, jsonObject.id, jsonObject.group_name, options);
};

/**
 * Get the facet id.
 *
 * @returns {number}
 */
Facet.prototype.getId = function () {
    return this.id;
};

/**
 * a facet is unique with the combination about id and group id
 *
 * @returns {string}
 */
Facet.prototype.getUniqueKey = function () {
    return this.getGroupId() + ':' + this.getId();
};

/**
 * a facet is unique with the combination about id and group id
 * @static
 * @returns {string}
 */
Facet.uniqueKey = function (groupId, facetId) {
    return groupId + ':' + facetId;
};

/**
 * Get the facet name.
 *
 * @returns {string}
 */
Facet.prototype.getName = function () {
    return this.name;
};

/**
 * Get the value.
 *
 * @returns {string}
 */
Facet.prototype.getValue = function () {
    return this.value;
};

/**
 * Get the group id.
 *
 * @return {number}
 */
Facet.prototype.getGroupId = function () {
    return this.groupId;
};

/**
 * Get the group name.
 *
 * @return {string}
 */
Facet.prototype.getGroupName = function () {
    return this.groupName;
};

/**
 * Get option value.
 *
 * @param {string} key The option key.
 *
 * @return {string | null}
 */
Facet.prototype.getOption = function (key) {
    if (this.options) {
        for (var option in this.options) {
            if (option.key == key) {
                return option.value;
            }
        }
    }
    return null;
};

module.exports = Facet;