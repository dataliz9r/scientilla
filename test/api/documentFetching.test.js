'use strict';
const test = require('./../helper.js');

describe('Document fetching', () => {
    before(test.clean);

    const userData = test.getAllUserData()[0];
    const institutesData = test.getAllInstituteData();
    const groupsData = test.getAllGroupData();
    const iitInstituteData = institutesData[0];
    const iitGroupData = groupsData[0];
    let user;
    let iitInstitute;
    let iitGroup;

    it('it should be possible to ask for non-existent relations. They should be ignored.', async () => {
        user = await test.registerUser(userData);
        iitGroup = await test.createGroup(iitGroupData);
        const body = await test.getUserDocuments(user, 'non-existent-relation');
        body.should.be.eql(test.EMPTY_RES);
    });

});