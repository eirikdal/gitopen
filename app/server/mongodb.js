'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var Contestant;
var Commit;

exports.setup = function () {
    mongoose.connect('mongodb://localhost/test');

    var db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function callback() {
        console.log("Connected to mongodb..")
    });

    var contestantSchema = new Schema(
        {
            name: {type: String, unique: true },
            score: Number
        }
    );

    var commitSchema = new Schema(
        {
            hash: {type: String},
            committer: {type: ObjectId, ref: 'Contestant'},
            date: {type: Date},
            message: {type: String}
        }
    );

    Contestant = mongoose.model('Contestant', contestantSchema);
    Commit = mongoose.model('Commit', commitSchema);
};

exports.findByName = function (name, callback) {
    Contestant.findOne({name: name}, callback);
};

exports.clearContestants = function(callback) {
    Contestant.remove({}, callback)
}

exports.addScore = function (name, score) {
    var contestant = Contestant.find({name: name});
    contestant.score = score;
    save(contestant);
}

exports.saveCommit = function(body, callback) {
    var commit = new Commit(body);
    save(commit);
}

exports.update = function (body, callback) {
    delete body._id
    Contestant.findOneAndUpdate({name: body.name}, body, {upsert: true}, function (err, contestant) {
        if (err) {
            console.log("error updating model:" + err);
            return;
        }
        callback(contestant);
    });
};

exports.findCommitsByCommitter = function (committer, callback) {
    Contestant.findById(committer, function(err, contestant) {
        if (contestant) {
            Commit.find({committer: contestant._id}).populate("committer").exec(callback)
        }
    })
};

exports.listContestants = function (callback) {
    Contestant.find(function (err, contestants) {
        callback(contestants)
    });
}

function save(contestant) {
    contestant.save(function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log("Commit stored")
        }
    });
}
