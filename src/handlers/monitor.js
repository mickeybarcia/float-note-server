const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const { hostname } = require('os');
const config = require('../config');

const writeApi = new InfluxDB({ 
    url: config.influx.url,
    token: config.influx.token
}).getWriteApi(config.influx.org, config.influx.bucket);

writeApi.useDefaultTags({ location: hostname() });

const getDurationInMilliseconds = (start) => {
    const NS_PER_SEC = 1e9;
    const NS_TO_MS = 1e6;
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

module.exports.trackRequestDuration = (start, method, url) => {
    const ms = getDurationInMilliseconds(start);
    const point = new Point('request-duration')
        .tag('url', method + ' ' + url)
        .floatField('value', ms);
    writeApi.writePoint(point);    
};

module.exports.trackDuration = (start, tag) => {
    const ms = getDurationInMilliseconds(start);
    const point = new Point('duration')
        .tag('process', tag)
        .floatField('value', ms);
    writeApi.writePoint(point);    
};