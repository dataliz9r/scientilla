(function () {
    angular
        .module('summary')
        .controller('SummaryInterfaceController', controller);

    controller.$inject = ['ChartService'];

    /* jshint ignore:start */
    function controller(ChartService) {
        const vm = this;
        vm.changeTab = changeTab;
        vm.registerTab = registerTab;
        vm.unregisterTab = unregisterTab;
        vm.getChartsData = getChartsData;
        vm.reloadTabs = reloadTabs;
        const tabs = [];


        function changeTab(tabName, chartsData) {
            if (tabs.find(t => t.name === tabName))
                tabs.find(t => t.name === tabName).reload(chartsData);
        }

        function reloadTabs(chartsData) {
            tabs.forEach(t => t.reload(chartsData));
        }

        function registerTab(tab) {
            tabs.push(tab);
        }

        function unregisterTab(tab) {
            _.remove(tabs, tab);
        }

        async function getChartsData(researchEntity, refresh = (researchEntity.type !== 'Institute')) {
            const res = await ChartService.getData(researchEntity, [
                'journalsByYear',
                'conferencesByYear',
                'booksByYear',
                'bookSeriesByYear',
                'disseminationTalksByYear',
                'scientificTalksByYear',
                'documentsByType',
                'filteredAffiliatedJournalsByYear',
                'filteredAffiliatedConferencesByYear',
                'filteredAffiliatedBooksByYear',
                'filteredAffiliatedBookSeriesByYear',
                'filteredNotAffiliatedJournalsByYear',
                'filteredNotAffiliatedConferencesByYear',
                'filteredNotAffiliatedBooksByYear',
                'filteredNotAffiliatedBookSeriesByYear',
                'hindexPerYear',
                'citationsPerYear',
                'citationsPerDocumentYear',
                'totalIfPerYear',
                'totalSjrPerYear',
                'totalSnipPerYear',
                'chartDataDate'
            ], refresh);
            return res[0];
        }
    }

    /* jshint ignore:end */
})();
