/*
 * Serve JSON to our AngularJS client
 */

exports.open = function (req, res) {
    var commit = req.params.commit;
    var user = req.params.user;
    console.log(commit);
    console.log(user);

    res.json({});
};

exports.name = function (req, res) {
    res.json({
  	    name: 'Boo'
    });
};
