/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    Repo = require('git-tools'),
    path = require('path'),
    _ = require('underscore'),
    mongodb = require('../server/mongodb'),
    diff = require('../server/diff.js'),
    finder = require('../server/finder.js'),
    mysql      = require('mysql')
    async = require('async');

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

exports.bugzilla = function(req, res) {
//    var connection = mysql.createConnection({
//        host     : 'slfbugzilla.master.no',
//        user     : 'Steria_les',
//        password : 'Steria_les',
//        database: 'bugs'
//    });
//
//    connection.connect();
//
//    var sql = 'select WEEK(l.bug_when, 1) as WEEK, sum(l.work_time) as "Timeforbruk" from bugs b inner join products p on b.product_id=p.id left outer join longdescs l on b.bug_id = l.bug_id inner join profiles u on l.who=u.userid where p.name like \'ekrav%\' and l.bug_when between \'2013-01-01\' and \'2014-01-01\' group by WEEK';
//    connection.query(sql, function(err, rows, fields) {
//        if (err) throw err;
//
//        res.json(rows);
//    });
//
//    connection.end();
    res.json([])
};

exports.repositories = function(req, res) {
    finder.findRepositories("C:\\Users\\Eirik\\workspace", function(repositories){
        var response = _.map(repositories, function(it) { return {name: it} });
        res.json(response)
    });
};

exports.findAllHistory = function(req, res) {
    async.map(req.query.repository, function(repository, callback) {
        findHistory(repository, callback);
    }, function (err, results) {
        res.json(results);
    });
};

function findHistory(repositoryId, callback) {
    var repo = new Repo(repositoryId);
    repo.activeDays("--all", function (error, activeDays) {
        callback(null, activeDays);
    });
}
exports.history = function(req, res) {
    res.json(findHistory(req.query.repository));
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