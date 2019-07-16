/**
 * BackupController
 *
 * @description :: Server-side logic for managing Backups
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const fs = require('fs');
const path = require('path');

module.exports = {
    getDumps: function (req, res) {
        const dumps = Backup.getDumps();
        const dumpsList = {
            items: dumps,
            count: dumps.length
        };
        res.halt(Promise.resolve(dumpsList));
    },
    make: async function (req, res) {
        const filename = await Backup.makeTimestampedBackup();
        res.halt(Promise.resolve({filename: filename}));
    },
    restore: async function (req, res) {
        const filename = req.body.filename;
        Status.disable();
        await Backup.restoreBackup(filename);
        Status.enable();
        res.halt(Promise.resolve({}));
    },
    upload: async function (req, res) {
        const result = await Backup.upload(req);
        res.halt(Promise.resolve(result));
    },
    remove: async function (req, res) {
        const filename = req.body.filename;
        const result = await Backup.remove(filename);
        res.halt(Promise.resolve(result));
    },
    download: async function (req, res) {
        const filename = req.body.filename;
        try {
            const download = await Backup.download(filename);
            download.pipe(res, {end: true});
        } catch (err) {
            res.halt(Promise.reject(err));
        }
    }
};

