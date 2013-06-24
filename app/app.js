// Configuration

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api'),
    mongodb = require('./public/js/mongodb.js');

/**
 * Module dependencies.
 */
var app = module.exports = express();

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.static(__dirname + '/public'));
    app.use(express.static(__dirname + '/components'));
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

app.get('/partials/:name', routes.partial);
app.get('/api/contestant', api.findAllContestants);
app.get('/api/contestant/:name', api.findContestantByName);
app.post('/api/contestant/:name', api.updateContestant);
app.post('/api/contestant', api.addContestant);

// redirect all others to the index (HTML5 history)
//app.get('*', routes.index);

// Start server
server = require('http').createServer(app);

var io = require('socket.io').listen(server);

server.listen(3000, function(){
    console.log("Server started");
});

mongodb.setup();

io.sockets.on('connection', function(socket) {
    exports.notify = function(handle, data) {
        socket.emit(handle, data);
    };

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

