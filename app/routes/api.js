/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    mongodb = require('../server/mongodb'),
    diff = require('../server/diff.js');

exports.findAllContestants = function (req, res) {
    mongodb.listContestants(function (contestants) {
        res.json(contestants);
    });
};

exports.search = function(req, res) {
    mongodb.findCommitsByCommitter(req.params.id, function(err, commits) {
        res.json(commits);
    });
};

exports.addCommit = function(req, res) {
    var results = diff.parse(req.body);

    mongodb.findByName(results.contestant.user, function (err, user) {
        if (user) {
            results.contestant.score += user.score;
        }
        mongodb.update({name: results.contestant.user, score: results.contestant.score}, function (resp) {
            results.commit.committer = resp;
            mongodb.saveCommit(results.commit);

            app.notify('onCommit', results.commit);
            res.json(resp);
        });
    });
};