var _ = require('underscore');

// pipe data from input file to the regexStream parser to stdout
exports.parse = function(input) {
    var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/m;
    var nameRegex = /^Author: (.*) <.*>$/;
    var hashRegex = /^commit (.*)$/;
    var commitRegex = /^ {4}(.*)$/;
    var inserts = /^\+(?!\+)/;
    var deletions = /^\-(?!\-)/;

    var results = {user: "", commit: null};
    var commit = {hash: "", score: 0, date: new Date(), message: ""};

    _.each(input.diff, function(line) {
        if (emailRegex.test(line)) {
            results.name = nameRegex.exec(line)[1];
            results.user = emailRegex.exec(line)[0];
        } else if (inserts.test(line)) {
            commit.score++;
        } else if (deletions.test(line)) {
            commit.score--;
        } else if (hashRegex.test(line)) {
            commit.hash = hashRegex.exec(line)[1];
        } else if (commit.message == "" && commitRegex.test(line)) {
            commit.message = commitRegex.exec(line)[1];
        }
    });

    return {contestant: results, commit: commit};
};
