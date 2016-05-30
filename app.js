var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var miners = require('./routes/miners');

var app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make miner data accessible to the router
app.use(function(req, res, next) {
    req.title = config.title;
    req.json = {
        "miners" : miners.json,
        "refresh" : config.web_refresh,
        "updated" : moment().format("YYYY-MM-DD HH:mm:ss")
    };
    next();
});

app.use('/', routes);
app.use('/miners', miners);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// Error handlers

// Development error handler will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production error handler, no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

// --------------- REQUESTER ---------------

var net = require('net');
var moment = require('moment');
require("moment-duration-format");

var config = require('./config.json');

var miners = [];
miners.json = [];

console.log('config: ' + config.miners.length + ' rig(s) configured');

config.miners.forEach(function(item, i, arr) {
    console.log(item.name + ': config[' + i + ']');

    // settings
    var m = miners[i] = {};
    var c = config.miners[i];
    var j = miners.json[i];

    m.name = c.name;
    m.host = c.host;
    m.port = c.port;
    m.poll = (typeof c.poll !== 'undefined') ? c.poll : config.miner_poll;
    m.timeout = (typeof c.timeout !== 'undefined') ? c.timeout : config.miner_timeout;

    // stats
    m.reqCnt = 0;
    m.rspCnt = 0;

    // socket
    m.socket = new net.Socket()

    .on('connect', function() {
        console.log(m.name + ': connected to ' + m.socket.remoteAddress + ':' + m.socket.remotePort);
        var req = '{"id":0,"jsonrpc":"2.0","method":"miner_getstat1"}';
        ++m.reqCnt;
        console.log(m.name + ': req[' + m.reqCnt + ']: ' + req);
        m.socket.write(req + '\n');
        m.socket.setTimeout(m.timeout);
    })

    .on('timeout', function() {
        console.log(m.name + ': response timeout');
        m.socket.destroy();
        miners.json[i] = {
            "name"     : m.name,
            "host"     : m.host + ':' + m.port,
            "uptime"   : "",
            "eth"      : "",
            "dcr"      : "",
            "temps"    : "",
            "pools"    : "",
            "ver"      : "",
            "comments" : c.comments,
            "error"    : 'Error: no response'
        };
    })

    .on('data', function(data) {
        ++m.rspCnt;
        console.log(m.name + ': rsp[' + m.rspCnt + ']: ' + data.toString().trim());
        m.socket.setTimeout(0);
        var d = JSON.parse(data);
        miners.json[i] = {
            "name"     : m.name,
            "host"     : m.host + ':' + m.port,
            "uptime"   : moment.duration(parseInt(d.result[1]), 'minutes').format('d [days,] hh:mm'),
            "eth"      : d.result[2],
            "dcr"      : d.result[4],
            "temps"    : d.result[6],
            "pools"    : d.result[7],
            "ver"      : d.result[0],
            "comments" : c.comments,
            "error"    : null
        };
    })

    .on('close', function() {
        console.log(m.name + ': connection closed');
        setTimeout(poll, m.poll);
    })

    .on('error', function(e) {
        console.log(m.name + ': socket error: ' + e.message);
        miners.json[i] = {
            "name"     : m.name,
            "host"     : m.host + ':' + m.port,
            "uptime"   : "",
            "eth"      : "",
            "dcr"      : "",
            "temps"    : "",
            "pools"    : "",
            "ver"      : "",
            "comments" : c.comments,
            "error"    : e.name + ': ' + e.message
        };
    });

    function poll() {
        m.socket.connect(m.port, m.host);
    };

    if ((typeof c.offline === 'undefined') || !c.offline) {
        poll();
    } else {
        miners.json[i] = {
            "name"     : m.name,
            "host"     : m.host + ':' + m.port,
            "uptime"   : "",
            "eth"      : "",
            "dcr"      : "",
            "temps"    : "",
            "pools"    : "",
            "ver"      : "",
            "comments" : c.comments,
            "error"    : null
        };
    }
});

// --------------- /REQUESTER ---------------
