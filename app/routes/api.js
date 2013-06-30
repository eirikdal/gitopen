/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    mongodb = require('../server/mongodb'),
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

exports.search = function(req, res) {
    mongodb.findCommitsByCommitter(req.params.id, function(commits) {
        res.json(commits);
    });
};

exports.newCommit = function(req, res) {
    var results = diff.parse(req.body);

    mongodb.findByName(results.contestant.user, function (err, user) {
        if (user) {
            results.contestant.score += user.score;
        }
        mongodb.update({name: results.contestant.user, score: results.contestant.score}, function (resp) {
            results.commit.committer = resp;
            mongodb.saveCommit(results.commit);

            app.notify('onContestantUpdated', resp);
            res.json(resp);
        });
    });
};