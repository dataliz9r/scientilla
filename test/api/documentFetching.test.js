'use strict';
const test = require('./../helper.js');

describe('Document fetching', () => {
    before(test.cleanDb);
    after(test.cleanDb);

    const userData = test.getAllUserData()[0];
    const institutesData = test.getAllInstituteData();
    const groupsData = test.getAllGroupData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let user;
    let iitInstitute;
    let iitGroup;

    it('it should be possible to ask for non-existent relations. They should be ignored.', async () => {
        iitGroup = await test.createGroup(iitGroupData);
        user = await test.registerUser(userData);
        const body = await test.getUserDocuments(user, 'non-existent-relation');
        body.should.be.eql(test.EMPTY_RES);
    });

});