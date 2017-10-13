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
var researchEntityController = require('../lib/ResearchEntityController');
const request = require('request-promise');

module.exports = require('waterlock').actions.user(_.merge({}, researchEntityController, {
    //sTODO: move this function to the user model
    //sTODO: delete documents or set the owner to null
    //sTODO: refactor
    destroy: function (req, res) {
        var userId = req.params.id;
        User.destroy({id: userId}).exec(function (err, users) {
            if (err)
                return res.negotiate(err);
            if (users.length !== 1)
                return res.negotiate(new Error("An error happened, " + users.length + " users deleted."));
            Auth.destroy({user: userId}).exec(function (err, auths) {
                if (err)
                    return res.negotiate(err);
                if (auths.length !== 1)
                    return res.negotiate(new Error("An error happened, " + auths.length + " auths deleted."));
                res.ok(users[0]);
            });
        });
    },
    create: function (req, res, next) {
        var params = waterlock._utils.allParams(req);
        res.halt(User.createCompleteUser(params));
    },
    addTags: function (req, res) {
        var documentId = req.params.documentId;
        var userId = req.params.researchEntityId;
        var tags = req.param('tags');
        res.halt(User.addTags(Tag, userId, documentId, tags));
    },
    getDocumentsByUsername: async (req, res) => {
        const username = req.params.username;
        const user = await User.findOneByUsername(username);
        if (!user)
            return res.notFound();
        const baseUrl = sails.getBaseUrl();
        const path = `/api/v1/users/${user.id}/publicDocuments`;
        const reqOptions = {
            uri: baseUrl+path,
            json: true,
            qs: req.query
        };

        const r = await request(reqOptions);
        res.ok(r);
    }
}));
