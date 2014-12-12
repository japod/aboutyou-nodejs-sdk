'use strict'

function Suggest() {
    this.suggestions = [];
};

Suggest.createFromJson = function (jsonArray) {
    return jsonArray;
}

module.exports = Suggest;