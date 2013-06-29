var mongodb = require('../public/js/mongodb');

exports.index = function(req, res){
    res.render('index');
};

exports.partial = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};

exports.clear = function(req, res) {
    mongodb.clearContestants(function() {
        res.render('index');
    })
}