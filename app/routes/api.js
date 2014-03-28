/*
 * Serve JSON to our AngularJS client
 */
var app = require('../app'),
    url = require('url'),
    config = require('../config.js'),
    Repo = require('git-tools'),
    path = require('path'),
    _ = require('underscore'),
    mongodb = require('../server/mongodb'),
    diff = require('../server/diff.js'),
    finder = require('../server/finder.js'),
    mysql = require('mysql'),
    async = require('async'),
    S = require('string');

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

var getProduct = function(product) {
    return {
        'ekrav': 'p.name like \'%ekrav%\' or p.name like \'%Tilskudd-og-trekk%\'',
        'leveranse': 'p.name like \'%LDB%\' or p.name like \'%Kraftf%\'',
    }[product];
};

exports.bugzilla = function(req, res) {
    var month = req.query.month,
        year = req.query.year,
        connection = mysql.createConnection(config.dataSource.bugzilla);

    connection.connect();

    var between, product;
    if (month === undefined){
        between = 'between \'' + year + '-01-01\' and \'' + (parseInt(year)+1) + '-01-01\'';
    } else {
        between = 'between \'' + year + '-' + month + '-01\' and \'' + year + '-' + (parseInt(month)+1) + '-01\'';
    }

    product = getProduct(req.query.id);
    if (product === undefined) {
        connection.end();
        res.json([]);
    }

    var groupBy = month === undefined ? "MONTH" : "DAY";
    var sql = 'select ' + groupBy + '(l.bug_when) as ' + groupBy + ', sum(l.work_time) as "Timeforbruk" from bugs b inner join products p on b.product_id=p.id left outer join longdescs l on b.bug_id = l.bug_id inner join profiles u on l.who=u.userid where (' + product + ') and l.bug_when ' + between + ' group by ' + groupBy;

    connection.query(sql, function(err, rows, fields) {
        if (err) throw err;

        res.json(rows);
    });

    connection.end();
};

this.repositories = [];
finder.findRepositories(config.workspace, function(repositories){
    this.repositories = _.map(repositories, function(it) { return {name: it} });
});

exports.repositories = function(req, res) {
    res.json(repositories);
};

exports.findAllHistory = function(req, res) {
    if (req.query.repository === undefined) return [];
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
exports.findHistory = function(req, res) {
    var dir = _.find(repositories, function(r) { return S(r.name).endsWith(req.params.id + config.envSep + ".git"); });
    findHistory(dir.name, function(err, result) {
        res.json(result);
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