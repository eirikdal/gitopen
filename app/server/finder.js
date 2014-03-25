var S = require('string');

exports.findRepositories = function(dir, callback) {
    var finder = require('findit')(dir),
        dirs = [];
    //This listens for directories found
    finder.on('directory', function (dir) {
        if (S(dir).endsWith("/.git")) {
            dir.push(dirs);
        }
    });

    finder.on('stop', function () {
        callback(dirs)
    })
};