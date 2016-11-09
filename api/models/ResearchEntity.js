/* global ResearchEntity, Reference, SqlService */

"use strict";
/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


const Promise = require("bluebird");
const _ = require("lodash");
const BaseModel = require("../lib/BaseModel.js");


module.exports = _.merge({}, BaseModel, {
    attributes: {},
    createDraft: function (ResearchEntityModel, researchEntityId, draftData) {
        const documentFields = Reference.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        selectedDraftData.draft = true;
        return Promise.all([
            ResearchEntityModel.findOneById(researchEntityId).populate('drafts'),
            Reference.create(selectedDraftData)
        ])
            .spread(function (researchEntity, draft) {
                researchEntity.drafts.add(draft);
                return Promise.all([
                    draft.id,
                    researchEntity.savePromise()
                ]);
            })
            .spread(function (draftId) {
                const authorshipFields = ['position', 'affiliations'];
                const authorships = _.map(draftData.authorships, a => _.pick(a, authorshipFields));
                _.forEach(authorships, a => a.document = draftId);
                return Promise.all([
                    draftId,
                    Authorship.create(authorships)
                ]);
            })
            .spread(function (draftId) {
                return Reference.findOneById(draftId);
            });
    },
    unverifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        var authorshipModel = getAuthorshipModel(ResearchEntityModel);
        return authorshipModel
            .findOne({researchEntity: researchEntityId, document: documentId})
            .then(function (authorship) {
                if (!authorship)
                    throw new Error('Authorship ' + documentId + ' does not exist');
                return authorship.destroy();
            })
            .then(function () {
                return Reference.deleteIfNotVerified(documentId);
            });
    },
    verifyDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.verifyDocument(researchEntityId, documentId);
        }));
    },
    createDrafts: function (Model, researchEntityId, documents) {
        return Promise.all(documents.map(function (document) {
            return Model.createDraft(Model, researchEntityId, document);
        }));
    },
    discardDocument: function (researchEntityId, documentId) {
        return this
            .findOneById(researchEntityId)
            .populate('discardedReferences')
            .then(function (researchEntity) {

                var doc = _.find(
                    researchEntity.discardedReferences,
                    {id: documentId});

                if (doc)
                    return false;

                researchEntity
                    .discardedReferences
                    .add(documentId);

                return researchEntity
                    .savePromise()
                    .then(function () {
                        return true;
                    });
            });

    },
    discardDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.discardDocument(researchEntityId, documentId);
        }));
    },
    verifyDraft: function (ResearchEntityModel, researchEntityId, draftId, position, affiliationInstituteIds) {
        return Reference.findOneById(draftId)
            .then(function (draft) {
                if (!draft || !draft.draft) {
                    throw new Error('Draft ' + draftId + ' does not exist');
                }
                if (!draft.isValid()) {
                    return draft;
                }
                return Reference.findCopies(draft)
                    .then(function (documents) {
                        var n = documents.length;
                        if (n === 0) return draft;
                        if (n > 1)
                            sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
                        var doc = documents[0];
                        sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + doc.id);
                        return Reference.destroy({id: draft.id}).then(_ => doc);
                    })
                    .then(d => ResearchEntityModel.verifyDocument(researchEntityId, d.id, position, affiliationInstituteIds))
                    .then(d => {
                        d.draft = false;
                        d.draftCreator = null;
                        d.draftGroupCreator = null;
                        return d.savePromise();
                    });
            });
    },
    verifyDrafts: function (ResearchEntityModel, researchEntityId, draftIds) {
        return Promise.all(
            draftIds.map(
                draftId => ResearchEntityModel
                        .verifyDraft(ResearchEntityModel, researchEntityId, draftId)
                        .catch(e => ({error: e, skip: true}))
            )
        ).then(docs => docs.filter(d => !d.skip));
    },
    getAllDocuments: function (ResearchEntity, researchEntityid) {
        return ResearchEntity
            .findOneById(researchEntityid)
            .populate('drafts')
            .populate('documents')
            .then(function (researchEntity) {
                return _.union(
                    researchEntity.drafts,
                    researchEntity.documents
                );
            });
    },
    checkCopiedDocuments: function (ResearchEntity, researchEntityId, documentsToCheck) {
        var threeshold = .50;
        return ResearchEntity.getAllDocuments(ResearchEntity, researchEntityId)
            .then(function (documents) {
                documentsToCheck.forEach(function (docToCheck) {
                    var isCopied = _.some(documents, function (d) {
                        return d.getSimiliarity(docToCheck) >= threeshold;
                    });
                    if (!docToCheck.tags)
                        docToCheck.tags = [];
                    if (isCopied)
                        docToCheck.tags.push('copied');
                });
                return documentsToCheck;
            });
    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
});

function getAuthorshipModel(ResearchEntityModel) {
    var authorshipModelName = ResearchEntityModel._attributes.documents.through;
    return sails.models[authorshipModelName];
}