'use strict';

var mongoose = require('mongoose');

var Contestant;

exports.setup = function () {
    mongoose.connect('mongodb://localhost/test');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        console.log("Connected to mongodb..")
    });

    Contestant = mongoose.model('Contestant', { name: {type: String, unique: true }, score: Number });
};

exports.findByName = function (name, callback) {
    Contestant.findOne({name: name}, callback);
};

exports.clearContestants = function(callback) {
    Contestant.remove({}, callback)
}

exports.addContestant = function (name) {
    var contestant = new Contestant({ name: name, score: 0 });
    save(contestant)
}

exports.addScore = function (name, score) {
    var contestant = Contestant.find({name: name});
    contestant.score = score;
    save(contestant);
}

exports.update = function (body, callback) {
    delete body._id
    Contestant.findOneAndUpdate({name: body.name}, body, {upsert: true}, function (err, contestant) {
        if (err) {
            console.log("error updating model:" + err);
            return;
        }
        callback(contestant);
    });
};

exports.listContestants = function (callback) {
    Contestant.find(function (err, contestants) {
        callback(contestants)
    });
}

function save(contestant) {
    contestant.save(function (err) {
        if (err) {
            console.log(err)
        }
    });
}
