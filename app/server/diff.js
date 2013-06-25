var RegexStream = require('regex-stream')
    , parser = {
        "regex": "^([\\S]+) ([\\S]+) ([\\S]+)"
        , "labels": ["A label", "B label", "C label"]
    }
    , regexStream = new RegexStream(parser)
    , _ = require('underscore')

// pipe data from input file to the regexStream parser to stdout
exports.parse = function(input) {
    _.each(input.diff, function(line) {
        console.log(line)
    });
    //input.match(/^(?!\+\+\+$)\+$/);
};
