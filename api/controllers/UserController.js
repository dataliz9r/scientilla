/**
 * UserController.js
 *
 * @module      :: Controller
 * @description :: Provides the base user
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

var _ = require('lodash');

module.exports = require('waterlock').actions.user({
    //sTODO: move this function to the user model
    //sTODO: delete references or set the owner to null
    //sTODO: refactor
    destroy: function(req, res) {
        var userId = req.params.id;
        User.destroy({id: userId}).exec(function (err, users) {
            if (err) return res.negotiate(err);
            if (users.length !== 1) return res.negotiate(new Error("An error happened, " + users.length + " users deleted."));
            Auth.destroy({user: userId}).exec(function (err, auths) {
                if (err) return res.negotiate(err);
                if (auths.length !== 1) return res.negotiate(new Error("An error happened, " + auths.length + " auths deleted."));
                res.ok(users[0]);
            });
        });
    },
    create: function(req, res, next) {

        var params = waterlock._utils.allParams(req);
        User.createCompleteUser(params)
            .then(function(user) {
                res.json(user);
            })
            .catch(function(err) {
                sails.log.error(err);
                res.json(err);
            });
    },
    getSuggestedReferences: function(req, res) {
        var userId = req.params.id;
        var user = req.session.user;
        User.getSuggestedReferences(userId, user)
                .then(function(suggestedReferences) {
                    res.json(suggestedReferences);
        });
    },
    getNotifications: function(req, res) {
        var userId = req.params.id;
        var user = req.session.user;
        User.getNotifications(userId, user)
                .then(function(suggestedReferences) {
                    res.json(suggestedReferences);
        });
    },
    getReferences: function(req, res) {
        var userId = req.params.userId; 
        var populate = req.query.populate; 
        if (_.isString(populate))
            populate = [populate];
        var filter = req.query.filter || 'all';
        User.getReferences(userId, populate, filter)
                .then(function(references) {
                    res.json(references);
        });
    }
});
