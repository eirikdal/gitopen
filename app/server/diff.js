var util = require('util')
    , RegexStream = require('regex-stream')
    , input = require('fs').createReadStream('./data.txt', {encoding:'utf-8'})
    , parser = {
        "regex": "^([\\S]+) ([\\S]+) ([\\S]+)"
        , "labels": ["A label", "B label", "C label"]
    }
    , regexStream = new RegexStream(parser)

// pipe data from input file to the regexStream parser to stdout
exports.parse = function(input) {
    util.pump(input, regexStream)
    util.pump(regexStream, process.stdout)
}
