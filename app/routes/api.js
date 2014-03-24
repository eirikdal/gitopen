/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    Repo = require('git-tools'),
    path = require('path'),
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

exports.history = function(req, res) {
    var repo = new Repo("C:\\Users\\Eirik\\workspace\\gitopen\\.git");
    repo.activeDays("--all", function(error, activeDays) {
        res.json(activeDays);
    });
};

exports.addCommit = function(req, res) {
    var results = diff.parse(req.body);

    mongodb.findByName(results.contestant.user, function (err, user) {
        mongodb.update({name: results.contestant.user}, function (resp) {
            results.commit.committer = resp;
            mongodb.saveCommit(results.commit);

            app.notify('onCommit', results.commit);
            res.json(resp);
        });
    });
};