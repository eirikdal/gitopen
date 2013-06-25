/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    mongodb = require('../public/js/mongodb'),
    diff = require('../server/diff.js');

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
    diff.parse(req.body);

    mongodb.update({name:"foo", score: 3}, function (resp) {
        app.notify('onContestantUpdated', resp);
        res.json(resp);
    });
}