/**
 * Institute.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {
    attributes: {
        name: {
            type: 'STRING',
            //unique: true,
            required: true
        },
        country: 'STRING',
        city: 'STRING',
        shortname: 'STRING',
        scopusId: 'STRING',
        group: {
            model: 'group'
        },
        authorships: {
            collection: 'authorship',
            via: 'affiliations',
            through: 'affiliation'
        },
        aliasOf: {
            model: 'institute'
        },
        documents: {
            collection: 'document',
            via: 'institutes',
            through: 'affiliation'
        },
        parentId: 'INTEGER'
    },
    findOrCreateRealInstitute: function (i) {
        return Institute.findOrCreate({scopusId: i.scopusId}, i)
            .then(i => {
                if (!i.aliasOf)
                    return i;
                return findOneById(i.aliasOf);
            });
    },
    async getChildInstitutes(parentId) {
        if (!parentId)
            return await Institute.find({parentId: {'!': null}});

        return await Institute.find({parentId: parentId});
    }

};

