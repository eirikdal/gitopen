var _ = require('underscore');

// pipe data from input file to the regexStream parser to stdout
exports.parse = function(input) {
    var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/m;
    var nameRegex = /Author: (.*) <.*>/;
    var inserts = /^\+(?!\+)/;
    var deletions = /^\-(?!\-)/;

    var results = {user: "", score: 0};

    _.each(input.diff, function(line) {
        if (emailRegex.test(line)) {
            results.name = nameRegex.exec(line)[1];
            results.user = emailRegex.exec(line)[0];
        } else if (inserts.test(line)) {
            results.score++;
        } else if (deletions.test(line)) {
            results.score--;
        }
    });

    return results;
};
