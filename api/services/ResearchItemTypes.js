/* global require, ResearchItemType */
"use strict";

const researchItemTypesData = require('../dataInit/researchItemType.json').values;
const researchItemTypes = {};

module.exports = {
    ARTICLE: 'article',
    ARTICLE_IN_PRESS: 'article_in_press',
    ABSTRACT_REPORT: 'abstract_report',
    BOOK: 'book',
    BOOK_CHAPTER: 'book_chapter',
    CONFERENCE_PAPER: 'conference_paper',
    CONFERENCE_REVIEW: 'conference_review',
    EDITORIAL: 'editorial',
    ERRATUM: 'erratum',
    INVITED_TALK: 'invited_talk',
    LETTER: 'letter',
    NOTE: 'note',
    REPORT: 'report',
    REVIEW: 'review',
    SHORT_SURVEY: 'short_survey',
    PHD_THESIS: 'phd_thesis',
    POSTER: 'poster',
    init: async () => {
        let researchItemTypesArray = await ResearchItemType.find();
        if (!researchItemTypesArray.length)
            researchItemTypesArray = await ResearchItemType.create(researchItemTypesData);
        researchItemTypesArray.forEach(dt => {
            researchItemTypes[dt.id] = dt;
            researchItemTypes[dt.key] = dt;
        });
    },
    get: () => researchItemTypes,
    getType: (id) => researchItemTypes[id]
};