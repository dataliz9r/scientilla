(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryMetrics', {
            templateUrl: 'partials/summary-metrics.html',
            controller: SummaryMetricsComponent,
            controllerAs: 'vm',
            bindings: {
                chartsData: '<'
            },
            require: {
                profileSummary: '^profileSummary'
            }
        });

    SummaryMetricsComponent.$inject = [
        'ChartService',
        'ModalService'
    ];

    function SummaryMetricsComponent(ChartService, ModalService) {
        const vm = this;

        vm.name = 'metrics';
        vm.charts = {};

        vm.showInfo = showInfo;

        vm.$onInit = () => {
            vm.profileSummary.registerTab(vm);
            vm.reload(vm.chartsData);
        };

        vm.reload = (chartsData) => {
            vm.charts = {};
            vm.charts.hindexPerYear = ChartService.getHindexPerYear(chartsData);
            vm.charts.citationsPerDocumentYear = ChartService.getCitationsPerDocumentYear(chartsData);
            vm.charts.citationsPerYear = ChartService.getCitationsPerYear(chartsData);
            vm.charts.journalMetricsPerYearLineChart = ChartService.getJournalMetricsPerYearLineChart(chartsData);
            vm.charts.getJournalMetricsPerYearBarChart = ChartService.getJournalMetricsPerYearBarChart(chartsData);
            vm.charts.filteredDocumentsByYear = ChartService.getFilteredDocumentsByYear(chartsData);
            vm.charts.filteredDocumentsSourceTypeByYear = ChartService.getFilteredDocumentsSourceTypeByYear(chartsData);

            vm.documentsChartToShow = vm.charts.filteredDocumentsSourceTypeByYear;
            vm.citationsChartToShow = vm.charts.citationsPerYear;

            vm.documentsCharts = [
                {
                    icon: 'fa-pie-chart',
                    chartSettings: vm.charts.filteredDocumentsSourceTypeByYear,
                    default: true,
                    title: vm.charts.filteredDocumentsSourceTypeByYear.title
                },
                {
                    icon: 'fa-university',
                    chartSettings: vm.charts.filteredDocumentsByYear,
                    title: vm.charts.filteredDocumentsSourceTypeByYear.title
                }
            ];

            vm.citationsCharts = [
                {
                    icon: 'fa-quote-right',
                    chartSettings: vm.charts.citationsPerYear,
                    default: true,
                    title: vm.charts.citationsPerYear.title
                },
                {
                    icon: 'fa-quote-left',
                    chartSettings: vm.charts.citationsPerDocumentYear,
                    title: vm.charts.citationsPerDocumentYear.title
                }
            ];

            vm.metricsCharts = [
                {
                    icon: 'fa-line-chart',
                    chartSettings: vm.charts.journalMetricsPerYearLineChart,
                    id: 'scientilla-chart-journalMetricsPerYear',
                    default: true,
                    title: 'Line chart'
                },
                {
                    icon: 'fa-bar-chart',
                    chartSettings: vm.charts.getJournalMetricsPerYearBarChart,
                    title: 'Bar chart'
                }

            ];

            const totalDocuments = getTotal(chartsData, [
                'filteredAffiliatedJournalsByYear',
                'filteredAffiliatedConferencesByYear',
                'filteredAffiliatedBooksByYear',
                'filteredAffiliatedBookChaptersByYear',
                'filteredNotAffiliatedJournalsByYear',
                'filteredNotAffiliatedConferencesByYear',
                'filteredNotAffiliatedBooksByYear',
                'filteredNotAffiliatedBookChaptersByYear',
            ]);
            const hIndex = chartsData.hindexPerYear.length ? chartsData.hindexPerYear[chartsData.hindexPerYear.length - 1].value : 0;
            const totalCitations = getTotal(chartsData, ['citationsPerYear']);
            const totalImpactFactor = getTotal(chartsData, ['totalIfPerYear']);

            vm.indexes = [];
            vm.indexes.push({
                label: 'Documents',
                value: totalDocuments,
                icon: '<span class="fa fa-file-text-o scientilla-icon-color-document"></span>',
                format: 0
            });
            vm.indexes.push({
                label: 'h-index',
                value: hIndex,
                icon: '<span class="fa fa-line-chart scientilla-icon-color-hindex"></span>',
                format: 0
            });
            vm.indexes.push({
                label: 'Citations',
                value: totalCitations,
                icon: '<span class="fa fa-quote-right scientilla-icon-color-citations"></span>',
                format: 0
            });
            vm.indexes.push({
                label: 'Citations per document',
                value: totalCitations / totalDocuments | 0,
                icon: '<span class="fa fa-quote-right scientilla-icon-color-citations"></span>',
                format: 2
            });
            vm.indexes.push({
                label: 'IF per document',
                value: totalImpactFactor / totalDocuments | 0,
                icon: '<b class="scientilla-icon-color-if">IF</b>',
                format: 2
            });

            vm.documentTotals = [
                {
                    title: 'Journals',
                    value: getTotal(chartsData, ['filteredAffiliatedJournalsByYear', 'filteredNotAffiliatedJournalsByYear'])
                },
                {
                    title: 'Conferences',
                    value: getTotal(chartsData, ['filteredAffiliatedConferencesByYear', 'filteredNotAffiliatedConferencesByYear'])
                },
                {
                    title: 'Books',
                    value: getTotal(chartsData, ['filteredAffiliatedBooksByYear', 'filteredNotAffiliatedBooksByYear'])
                },
                {
                    title: 'Book Series',
                    value: getTotal(chartsData, ['filteredAffiliatedBookChaptersByYear', 'filteredNotAffiliatedBookChaptersByYear'])
                },
            ];

        };

        function showInfo() {
            ModalService.openWizard(['summary-metrics'], {style: 'light', isClosable: true});
        }

        function getTotal(chartsData, dataNames) {
            let total = 0;
            dataNames.forEach(dn => {
                total = chartsData[dn].reduce((total, d) => total + parseInt(d.value, 10), total);
            });
            return total;
        }

    }
})();