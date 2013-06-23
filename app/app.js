// Configuration

var express = require('express'),
    routes = require('./routes'),
    api = require('./routes/api');


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

// JSON API
app.get('/api/open', api.open);

app.get('/api/name', api.name);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

// Start server
server = require('http').createServer(app);

var io = require('socket.io').listen(server);

server.listen(3000, function(){
    console.log("Server started");
});

var contestants = [];

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    console.log("Connected to mongodb..")
    // yay!
});

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ name: 'Zildjian' });
kitty.save(function (err) {
    if (err) // ...
        console.log('meow');
});

io.sockets.on('connection', function(socket) {

    socket.on('listContestants', function(data) {
        socket.emit('onContestantsListed', contestants);
    });

    socket.on('createContestant', function(data) {
        contestants.push(data);
        socket.broadcast.emit('onContestantCreated', data);
    });

    socket.on('updateContestant', function(data){
        contestants.forEach(function(person){
            if (person.id === data.id) {
                person.display_name = data.display_name;
                person.score = data.score;
            }
        });
        socket.broadcast.emit('onContestantUpdated', data);
    });

    socket.on('deleteContestant', function(data){
        contestants = contestants.filter(function(person) {
            return person.id !== data.id;
        });
        socket.broadcast.emit('onContestantDeleted', data);
    });
});

