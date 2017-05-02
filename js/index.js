"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require('request');
var defaultConfig = {
    username: process.env.DICOM_USERNAME,
    password: process.env.DICOM_PASSWORD,
    token: process.env.DICOM_TOKEN,
    baseUrl: process.env.DICOM_BASEURL || 'http://api.godicom.com/sandbox/ws/external/shipping'
};
var DicomAPI = (function () {
    function DicomAPI(config) {
        this.config = defaultConfig;
        if (config) {
            Object.assign(this.config, config);
        }
        DicomAPI.authorization = 'Basic ' + Buffer.from(this.config.username + ':' + this.config.password).toString('base64');
    }
    DicomAPI.prototype.createPickup = function (data, callback) {
        var path = '/pickup';
        this.post(path, data, callback);
    };
    DicomAPI.prototype.createShipment = function (data, callback) {
        var path = '/shipment';
        this.post(path, data, callback);
    };
    DicomAPI.prototype.getWaybill = function (id, format, callback) {
        if (format === void 0) { format = '4x5'; }
        var path = "shipment/" + id + "/waybills?format=" + format;
        this.getDoc(path, id, callback);
    };
    DicomAPI.prototype.getManifest = function (id, callback) {
        var path = "/pickup/" + id + "/manifests";
        this.getDoc(path, id, callback);
    };
    DicomAPI.prototype.getDoc = function (path, id, callback) {
        if (!id) {
            throw new Error("id is required");
        }
        var options = {
            url: "" + this.config.baseUrl + path,
            method: 'GET',
            headers: {
                'Authorization': DicomAPI.authorization,
                'accept': 'application/pdf',
                'content-type': 'application/json'
            },
            encoding: null
        };
        request(options, function (error, response) {
            callback(error, response.body);
        });
    };
    DicomAPI.prototype.post = function (path, data, callback) {
        var options = {
            url: "" + this.config.baseUrl + path,
            method: 'POST',
            headers: {
                'Authorization': DicomAPI.authorization,
                'accept': 'application/json',
                'content-type': 'application/json',
                'Ocp-Apim-Subscription-Key': this.config.token
            },
            body: data,
            json: true
        };
        request(options, function (error, response) {
            if (!error && response.statusCode == 201) {
                var url = response.headers.location;
                var fragUrl = url.split('/');
                var id = fragUrl[fragUrl.length - 1];
                callback(null, id, response.body);
            }
            else {
                callback(response.body, null, null);
            }
        });
    };
    return DicomAPI;
}());
exports.default = DicomAPI;
//# sourceMappingURL=index.js.map