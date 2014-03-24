/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    git = require('nodegit'),
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

exports.foo = function(req, res) {
    var repodir = path.resolve(__dirname, '/home/hauk184/workspace/gitopen/.git');
    git.Branch.foreach(repodir, git.GIT_BRANCH_LOCAL, function() {
        console.log('foo')
    });
//    git.Repo.open(repodir, function(error, repo) {
//        if (error) throw error;
//
//        repo.getMaster(function(error, branch) {
//            if (error) throw error;
//
//            // History returns an event.
//            var history = branch.history();
//
//            // History emits 'commit' event for each commit in the branch's history
//            history.on('commit', function(commit) {
//                console.log('commit ' + commit.sha());
//                console.log('Author:', commit.author().name() + ' <' + commit.author().email() + '>');
//                console.log('Date:', commit.date());
//                console.log('\n    ' + commit.message());
//            });
//
//            // Don't forget to call `start()`!
//            history.start();
//        });
//    });
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