var RegexStream = require('regex-stream')
    , parser = {
        "regex": "^([\\S]+) ([\\S]+) ([\\S]+)"
        , "labels": ["A label", "B label", "C label"]
    }
    , regexStream = new RegexStream(parser)
    , _ = require('underscore')

// pipe data from input file to the regexStream parser to stdout
exports.parse = function(input) {
    var emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/m;
    var inserts = /^\+(?!\+)/;
    var deletions = /^\-(?!\-)/;

    var results = {user: "", score: 0};

    _.each(input.diff, function(line) {
        if (emailRegex.test(line)) {
            results.user = emailRegex.exec(line)[0];
        } else if (inserts.test(line)) {
            results.score++;
        } else if (deletions.test(line)) {
            results.score--;
        }
    });

    return results;
};
