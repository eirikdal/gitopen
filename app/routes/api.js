/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    Repo = require('git-tools'),
    path = require('path'),
    mongodb = require('../server/mongodb'),
    diff = require('../server/diff.js'),
    mysql      = require('mysql');

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
    var connection = mysql.createConnection({
        host     : '****',
        user     : '****',
        password : '****',
        database: '****'
    });

    connection.connect();

    var sql = 'select WEEK(l.bug_when, 1) as WEEK, sum(l.work_time) as "Timeforbruk" from bugs b inner join products p on b.product_id=p.id left outer join longdescs l on b.bug_id = l.bug_id inner join profiles u on l.who=u.userid where p.name like \'LDB%\' or p.name like \'%Kraftf%\' and l.bug_when between \'2013-01-01\' and \'2014-01-01\' group by WEEK';
    connection.query(sql, function(err, rows, fields) {
        if (err) throw err;

        res.json(rows);
    });

    connection.end();
};

exports.history = function(req, res) {
    var repo = new Repo("/home/hauk184/workspace/leveranse/.git");
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