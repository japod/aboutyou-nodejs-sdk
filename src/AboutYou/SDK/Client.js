'use strict';

var request = require('request');
var when = require('when');

/**
 * @constructor
 * @param {string} appId
 * @param {string} appPassword
 * @property {string} apiEndPoint 'live' for live environment, 'stage' for staging
 * @returns {Client} Client instance
 **/
function Client(appId, appPassword, apiEndPoint) {
    // properties
    this.API_END_POINT_STAGE = 'http://shop-api.staging.aboutyou.de/api';
    this.API_END_POINT_SANDBOX = 'http://shop-api.sandbox.aboutyou.de/api';
    this.API_END_POINT_LIVE = 'https://shop-api.aboutyou.de/api';


    this.appId;
    this.appPassword;
    this._apiEndPoint;

    // constructor code
    this.setAppCredentials(appId, appPassword);
    this.setApiEndpoint(apiEndPoint);
};

Client.prototype = {

    /**
     * @param {string} appId        the app id for client authentication
     * @param {string} appPassword  the app password/token for client authentication.
     */
    setAppCredentials: function (appId, appPassword) {
        this.appId = appId;
        this.appPassword = appPassword;
    },

    /**
     * @returns {string} current used api endpoint
     */
    getApiEndPoint: function () {
        return this._apiEndPoint;
    },


    /**
     * @param {string} apiEndPoint  the endpoint can be the string 'stage' or 'live',
     *                              then the default endpoints will be used or
     *                              an absolute url
     */
    setApiEndpoint: function (apiEndPoint) {
        switch (apiEndPoint) {
            case 'stage':
                this._apiEndPoint = this.API_END_POINT_STAGE;
                break;
            case 'sandbox':
                this._apiEndPoint = this.API_END_POINT_SANDBOX;
                break;
            case 'live':
                this._apiEndPoint = this.API_END_POINT_LIVE;
                break;
            default:
                this._apiEndPoint = apiEndPoint;
        }
    },

    /**
     * Builds a JSON string representing the request data.
     * Executes the API request.
     *
     * @param {string} body the queries as json string
     *
     * @return {Promise} promise response object
     *
     */
    request: function (body) {
        var defer = when.defer();
        var options = {
            'auth': {
                'user': this.appId.toString(),
                'pass': this.appPassword
            },
            'body': body
        };

        request.post(this.getApiEndPoint(), options, function (error, response, body) {
            if (error) {
                defer.reject(error);
            } else {
                defer.resolve(response);
            }
        });

        return defer.promise;
    }
};

module.exports = Client;