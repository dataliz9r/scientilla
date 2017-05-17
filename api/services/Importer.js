// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');
const loadJsonFile = require('load-json-file');

const startingYear = sails.config.scientilla.mainInstituteImport.startingYear;

module.exports = {
    mainInstituteDocumentsImport: function () {

        //TODO if env == development then skip
        let institute;

        return Group.findOneByName(sails.config.scientilla.institute.name)
            .then(i => {
                institute = i;
                return Importer.importScopusDocuments(institute)
            })
            .then(unused => true);
    },
    importScopusDocuments: function (institute) {

        return scopusYearLoop(startingYear);

        function scopusYearLoop(year) {

            const query = {
                limit: 200,
                skip: 0,
                where: {
                    connector: 'Scopus',
                    field: 'scopusId',
                    additionalFields: [
                        {
                            field: 'year',
                            value: year
                        }
                    ]
                }
            };

            sails.log.info('Importing documents from ' + year);

            return scopusLoop(Group, institute.id, query)
                .then(items => next(year))
                .catch(err => {
                    sails.log.debug(err);
                    return next(year);
                });
        }

        function next(year) {
            if (year >= (new Date()).getFullYear() + 1)
                return;

            return scopusYearLoop(year + 1);
        }


        function scopusLoop(researchEntityModel, instituteId, query) {

            return Connector.getDocuments(researchEntityModel, instituteId, query, true)
                .then(result => {
                    const documents = result.items;

                    const toImport = documents.filter(
                        d => !_.isEmpty(d) && d.authorships.filter(
                            a => a.affiliations.includes(instituteId)
                        ).length
                    );

                    Promise.all(toImport.map(draftData => fastCreateDraft(draftData)))
                        .then(drafts => drafts.forEach(draft => fastVerifyDraft(draft, instituteId)));

                    if (result.count <= (query.limit + query.skip))
                        return;

                    const newQuery = _.cloneDeep(query);
                    newQuery.skip += query.limit;

                    return scopusLoop(researchEntityModel, instituteId, newQuery);
                })
        }

        function fastCreateDraft(draftData) {
            const selectedDraftData = Document.selectDraftData(draftData);
            selectedDraftData.draftGroupCreator = institute.id;
            return Document.create(selectedDraftData)
                .then(draft =>
                    Promise.all([
                        draft,
                        Authorship.createDraftAuthorships(draft.id, draftData)
                    ]))
                .spread(draft => draft);
        }

        function fastVerifyDraft(draft, instituteId) {
            if (draft.isValid()) {
                draft.draftToDocument();
                Group.doVerifyDocument(draft, instituteId)
            }

        }

    },

    readSourcesFromExcel: function () {

        function readWorksheet(worksheet, mappingsTable, mapFn = _.identity, filterFn = _.stubTrue) {
            function readSourceRow(r) {
                const sourceData = {};
                _.forEach(mappingsTable, (col, field) => {
                    const cell = col + r;
                    if (!_.isUndefined(worksheet[cell]))
                        sourceData[field] = worksheet[cell]['v'];
                });
                return sourceData;
            }

            const sources = [];
            for (let r = 2; ; r++) {
                const sourceData = readSourceRow(r);
                if (_.isEmpty(sourceData))
                    break;
                const mappedSourceData = mapFn(sourceData);
                if (filterFn(mappedSourceData))
                    sources.push(mappedSourceData);
            }
            return sources;
        }

        const scopusSourcesFileName = 'config/init/scopus_sources.xlsx';
        let journalsAndBookSeries = [], newConferences = [], oldConferences = [];
        if (fs.existsSync(scopusSourcesFileName)) {
            const workbook = xlsx.readFile(scopusSourcesFileName);
            const sheetNameList = workbook.SheetNames;

            const journalWorksheet = workbook.Sheets[sheetNameList[0]];
            const journalMappingsTable = {
                "title": 'B',
                "scopusId": 'A',
                "issn": 'C',
                "eissn": 'D',
                "type": 'T',
                "publisher": 'Z'
            };

            const mapJournal = (s) => {
                const sourceMappingTable = {
                    'Book Series': SourceTypes.BOOKSERIES,
                    'Journal': SourceTypes.JOURNAL
                };
                s.type = sourceMappingTable[s.type];
                return s;
            };

            const filterJournals = (s) => s.type;

            journalsAndBookSeries = readWorksheet(journalWorksheet, journalMappingsTable, mapJournal, filterJournals);

            const newConferencesWorksheet = workbook.Sheets[sheetNameList[1]];
            const newConferencesMappingsTable = {
                "title": 'B',
                "scopusId": 'A',
                "issn": 'D'
            };
            const mapConference = s => {
                s.type = SourceTypes.CONFERENCE;
                return s;
            };
            newConferences = readWorksheet(newConferencesWorksheet, newConferencesMappingsTable, mapConference);

            const oldConferencesWorksheet = workbook.Sheets[sheetNameList[2]];
            const oldConferencesMappingsTable = newConferencesMappingsTable;
            oldConferences = readWorksheet(oldConferencesWorksheet, oldConferencesMappingsTable, mapConference);
        }


        let books = [];
        const scopusSourcesFileName2 = 'config/init/scopus_book_sources.xlsx';
        if (fs.existsSync(scopusSourcesFileName2)) {
            const workbook2 = xlsx.readFile(scopusSourcesFileName2);
            const sheetNameList2 = workbook2.SheetNames;

            const bookWorksheet = workbook2.Sheets[sheetNameList2[0]];
            const bookMappingsTable = {
                "title": 'A',
                "isbn": 'C',
                "publisher": 'D',
                "year": 'E'
            };

            const mapBook = (s) => {
                s.type = 'book';
                return s;
            };

            books = readWorksheet(bookWorksheet, bookMappingsTable, mapBook);
        }

        const allSourceData = _.union(journalsAndBookSeries, newConferences, oldConferences, books);

        return allSourceData;
    },
    importPeople: async () => {
        try {
            sails.log.info('Import started');
            const url = sails.config.scientilla.mainInstituteImport.userImportUrl;
            const reqOptions = {
                uri: url,
                json: true
            };

            const people = await request(reqOptions);
            sails.log.info(people.length + ' entries found');
            for (let [i,p] of people.entries()) {
                const groupSearchCriteria = {or: p.groups.map(g => ({name: g}))};
                let groups = await Group.find(groupSearchCriteria).populate('members').populate('administrators');
                if (groups.length != p.groups.length) {
                    const missingGroupNames = p.groups.filter(g => !groups.some(g2 => g == g2.name));
                    const groupObjs = missingGroupNames.map(g => ({name:g}));
                    sails.log.info('inserting groups: ' + missingGroupNames.join(', '));
                    await Group.create(groupObjs);
                    groups = await Group.find(groupSearchCriteria).populate('members').populate('administrators');
                    console.assert(groups.length == p.groups.length);
                }
                const criteria = {username: p.username};
                let user = await User.findOne(criteria);
                if (user) {
                    await User.update(criteria, p);
                }
                else {
                    user = await User.createCompleteUser(p);
                }

                for (let g of groups) {
                    g.members.add(user.id);
                    if (p.pi)
                        g.administrators.add(user.id);
                    await g.savePromise();
                }
            }
            sails.log.info('Import finished');
        } catch (err) {
            sails.log.error(err);
        }
    },
    importGroups: async () => {
        sails.log.info('Import started');
        const groupsPath = 'data/groups.json';
        const groupNames = await loadJsonFile(groupsPath);
        sails.log.info(groupNames.length + ' entries found');
        for (let groupName of groupNames) {
            const group = await Group.findOneByName(groupName);
            if (group)
                continue;
            await Group.create({name: groupName});
        }
        sails.log.info('Import finished');
    }
};