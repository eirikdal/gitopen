// Configuration

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    mongodb = require('./server/mongodb.js'),
    less = require('less-middleware'),
    url = require('url');

/**
 * Module dependencies.
 */
var app = module.exports = express();
var publicDir = __dirname + '/public';

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(require('less-middleware')(__dirname + '/public'));
    app.use(express.static(publicDir));
    app.use(app.router);
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Routes
app.get('/', routes.index);
app.get('/clear', routes.clear);
app.get('/partials/:name', routes.partial);

app.get('/api/entries/:product/:year/:month', api.entries);
app.get('/api/history', api.findAllHistory);
app.get('/api/history/:id', api.findHistory);
app.get('/api/history/:id/:month', api.findHistory);
app.get('/api/repository', api.repositories);
app.get('/api/bugzilla/:product/:year', api.bugzilla);
app.get('/api/bugzilla/:product/:year/:month', api.bugzillaWithMonth);
app.get('/api/commit/committer/:id', api.search);
app.get('/api/contestant', api.findAllContestants);
app.post('/api/commit', api.addCommit);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
server = require('http').createServer(app);

var io = require('socket.io').listen(server);

server.listen(3000, function(){
    console.log("Server started");
});

mongodb.setup();

var _socket;
exports.notify = function(handle, data) {
    if (_socket)
        _socket.emit(handle, data);
}

io.sockets.on('connection', function(socket) {
    _socket = socket;

    socket.on('listContestants', function(data) {
        mongodb.listContestants(function(contestants) {
            socket.emit('onContestantsListed', contestants);
        });
    });

    socket.on('createContestant', function(data) {
        mongodb.addContestant(data);
        socket.broadcast.emit('onContestantCreated', data);
    });

    socket.on('updateContestant', function(data) {
        mongodb.update(data, function(contestant) {
            socket.emit('onContestantUpdated', contestant);
        })
    })
});

