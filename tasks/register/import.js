/* global Importer, ExternalImporter */
const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('import', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            const methods = {
                'people': Importer.importPeople,
                'groups': Importer.importGroups,
                'sources': Importer.importSources,
                'external': {
                    'user': ExternalImporter.updateUserExternal,
                    'group': ExternalImporter.updateGroupExternal,
                    'all': ExternalImporter.updateAllExternal,
                }
            };

            try {
                const task = getMethod(args, methods);
                await task.method(...task.params);
            } catch (err) {
                sails.log.debug(err);
                sails.log.error('Available options are ' + Object.keys(methods).join(', '));
                done();
                return 1;
            }
            done();
        });
    });
};

function getMethod(args, methods) {
    let tree = methods;
    let method = null;
    let params = [];

    for (let a of args) {
        if (_.isFunction(method))
            params.push(a);

        if (_.isFunction(tree[a]))
            method = tree[a];

        if (_.isObject(tree[a]))
            tree = tree[a];
    }

    if (_.isFunction(method))
        return {
            method,
            params
        };

    throw 'wrong parameters ' + args.join(':');
}