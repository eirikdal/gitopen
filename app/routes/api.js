/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    mongodb = require('../public/js/mongodb');

exports.addContestant = function (req, res) {
    var contestant = new Contestant({name: req.params.name, score: 0});
    contestant.$save();
    app.notify('contestantCreated', contestant);
    res.json(contestant);
};

exports.updateContestant = function(req, res) {
    mongodb.update(req.body, function (resp) {
        app.notify('onContestantUpdated', resp);
        res.json(resp);
    });
};

exports.findContestantByName = function(req, res) {
    mongodb.findByName(req.params.name, function (err, contestants) {
        res.json(contestants);
    });
}

exports.findAllContestants = function (req, res) {
    mongodb.listContestants(function (contestants) {
        res.json(contestants);
    });
};

exports.newCommit = function(req, res) {
    mongodb.update({name:"foo", score: 1}, function (resp) {
        app.notify('onContestantUpdated', resp);
        res.json(resp);
    });
}