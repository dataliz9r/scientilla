/* global d3, tinycolor */
(function () {
    "use strict";
    angular.module("services").factory("ChartService", ChartService);

    ChartService.$inject = [
        'DocumentTypesService'
    ];

    let styles = {};
    let colors = [];

    function ChartService(DocumentTypesService) {
        const service = {
            previewDefaultOptions: {
                chart: {
                    showLabels: false,
                    showLegend: false,
                    showControls: false,
                    duration: 300,
                    reduceXTicks: true,
                    xAxis: {
                        axisLabel: '',
                        ticks: false,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: d => d3.format(',.0d')(d)
                    },
                    valueFormat: d => d3.format('')(d)
                }
            },
            mainChartDefaultOptions: {
                chart: {
                    showLabels: true,
                    showLegend: true,
                    showControls: true,
                    duration: 300,
                    reduceXTicks: false,
                    xAxis: {
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickFormat: d => d3.format(',.0d')(d)
                    },
                    valueFormat: d => d3.format('')(d)
                }
            }
        };

        service.getData = (researchEntity, charts, refresh = false) =>
            researchEntity.all('charts').getList({refresh: !!refresh, charts});

        service.setStyles = (customizations) => {
            const darkenColors = [],
                lightenColors = [];
            let extendedColors = [];

            styles = customizations.styles;
            colors = [
                '#' + styles.chartColor1,
                '#' + styles.chartColor2,
                '#' + styles.chartColor3,
                '#' + styles.chartColor4,
                '#' + styles.chartColor5,
                '#' + styles.chartColor6,
                '#' + styles.chartColor7,
                '#' + styles.chartColor8,
                '#' + styles.chartColor9,
                '#' + styles.chartColor10,
                '#' + styles.chartColor11,
                '#' + styles.chartColor12
            ];

            colors.forEach(color => {
                const dark = tinycolor(color).darken(30).toString();
                const light = tinycolor(color).lighten(30).toString();

                if (dark !== '#ffffff' && dark !== '#000000' && typeof dark !== 'undefined') {
                    darkenColors.push(dark);
                }

                if (light !== '#ffffff' && light !== '#000000' && typeof light !== 'undefined') {
                    lightenColors.push(light);
                }
            });

            extendedColors.push(darkenColors[1]);
            extendedColors.push(lightenColors[2]);
            extendedColors.push(darkenColors[3]);
            extendedColors.push(lightenColors[4]);
            extendedColors.push(darkenColors[5]);
            extendedColors.push(lightenColors[6]);
            extendedColors.push(darkenColors[7]);
            extendedColors.push(lightenColors[8]);
            extendedColors.push(darkenColors[9]);
            extendedColors.push(lightenColors[10]);
            extendedColors.push(darkenColors[11]);
            extendedColors.push(lightenColors[12]);

            extendedColors.push(darkenColors[12]);
            extendedColors.push(lightenColors[11]);
            extendedColors.push(darkenColors[10]);
            extendedColors.push(lightenColors[9]);
            extendedColors.push(darkenColors[8]);
            extendedColors.push(lightenColors[7]);
            extendedColors.push(darkenColors[6]);
            extendedColors.push(lightenColors[5]);
            extendedColors.push(darkenColors[4]);
            extendedColors.push(lightenColors[3]);
            extendedColors.push(darkenColors[2]);
            extendedColors.push(lightenColors[1]);

            extendedColors = extendedColors.filter(color => color !== '#ffffff' && color !== '#000000' && typeof color !== 'undefined');

            colors = colors.concat(extendedColors);
        };

        service.getAsMainChart = chart => {
            const mainChart = _.cloneDeep(chart);
            mainChart.options = getDefaultOptions(mainChart.baseOptions, service.mainChartDefaultOptions);

            return mainChart;
        };

        service.getAsPreviewChart = c => {
            const chart = _.cloneDeep(c);
            chart.options = getDefaultOptions(chart.baseOptions, service.previewDefaultOptions);

            return chart;
        };

        service.getDocumentsByType = (chartsData) => {
            const baseOptions = {
                chart: {
                    type: 'pieChart',
                    x: d => d.type,
                    y: d => d.value,
                    color: colors,
                    labelThreshold: 0.02,
                    labelSunbeamLayout: true
                }
            };

            return {
                title: 'Documents by Type',
                data: chartsData.documentsByType.map(d => ({
                    type: DocumentTypesService.getDocumentTypeLabel(d.type),
                    value: parseInt(d.value)
                })),
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getInvitedTalksByYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const rangeX = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const data = [{
                key: 'Dissemination',
                values: getItemsByYear(chartsData.disseminationTalksByYear, yearRange)
            }, {
                key: 'Scientific Event',
                values: getItemsByYear(chartsData.scientificTalksByYear, yearRange)
            }];

            const maxY = getDatamax(data).reduce((a, b) => a + b, 0);
            const rangeY = getRangeY(maxY);

            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    color: colors,
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: rangeX,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d),
                        axisLabel: '',
                        axisLabelDistance: -10
                    }
                }
            };

            return {
                title: 'Invited talks by year',
                data: data,
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getDocumentsByYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const data = [{
                key: DocumentTypesService.getSourceTypeLabel('journal'),
                values: getItemsByYear(chartsData.journalsByYear, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('conference'),
                values: getItemsByYear(chartsData.conferencesByYear, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('book'),
                values: getItemsByYear(chartsData.booksByYear, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('bookseries'),
                values: getItemsByYear(chartsData.bookSeriesByYear, yearRange)
            }];

            const rangeX = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const maxY = getDatamax(data).reduce((a, b) => a + b, 0);
            const rangeY = getRangeY(maxY);

            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
                    color: colors,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: rangeX,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d),
                        axisLabel: '',
                        axisLabelDistance: -10
                    }
                }
            };

            return {
                title: 'Documents by year',
                data: data,
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getHindexPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const hindexPerYear = getItemsByYear(chartsData.hindexPerYear, yearRange);
            const maxY = Math.max.apply(Math, hindexPerYear.map(o => o.value));
            const rangeY = getRangeY(maxY, true);

            const maxYValue = parseInt(_.maxBy(hindexPerYear, 'value').value, 10);
            const maxXValue = parseInt(_.maxBy(hindexPerYear, 'year').year, 10);
            const minXValue = parseInt(_.minBy(hindexPerYear, 'year').year, 10);

            const rangeX = getRangeX(
                _.minBy(hindexPerYear, 'year').year,
                _.maxBy(hindexPerYear, 'year').year
            );

            return {
                title: 'h-index by year',
                data: [{
                    key: 'h-index',
                    values: hindexPerYear
                }],
                options: {
                    chart: {
                        type: 'lineChart',
                        color: () => '#' + styles.hIndexColor,
                        x: d => d.year,
                        y: d => d.value,
                        showLabels: true,
                        showLegend: false,
                        showControls: false,
                        useInteractiveGuideline: true,
                        reduceXTicks: false,
                        xAxis: {
                            rotateLabels: 50,
                            showMaxMin: false,
                            tickValues: rangeX,
                            tickFormat: d => d3.format('')(d)
                        },
                        yAxis: {
                            showMaxMin: false,
                            tickValues: rangeY,
                            tickFormat: d => d3.format(',.0d')(d)
                        },
                        yDomain: [0, maxYValue + (maxYValue * 0.05)],
                        xDomain: [minXValue, maxXValue + ((maxXValue - minXValue) * 0.05)],
                        valueFormat: d => d3.format('')(d)
                    }
                }
            };
        };

        service.getCitationsPerDocumentYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const rangeX = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const data = [{
                key: 'Citations',
                values: getItemsByYear(chartsData.citationsPerDocumentYear, yearRange)
            }];

            const maxY = getDatamax(data).reduce((a, b) => a + b, 0);
            const rangeY = getRangeY(maxY);

            return {
                title: 'Citations by document year',
                data: data,
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#' + styles.citationColor,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: rangeX,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d)
                    }
                }),
            };
        };

        service.getCitationsPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const rangeX = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const data = [{
                key: 'Citations',
                values: getItemsByYear(chartsData.citationsPerYear, yearRange)
            }];

            const maxY = getDatamax(data).reduce((a, b) => a + b, 0);
            const rangeY = getRangeY(maxY);

            return {
                title: 'Citations by year',
                data: data,
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#' + styles.citationColor,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: rangeX,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d)
                    }
                }),
            };
        };

        service.getJournalMetricsPerYearLineChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const totalIfPerYear = getItemsByYear(chartsData.totalIfPerYear, yearRange);
            const totalSjrPerYear = getItemsByYear(chartsData.totalSjrPerYear, yearRange);
            const totalSnipPerYear = getItemsByYear(chartsData.totalSnipPerYear, yearRange);

            const maxYValue = Math.max(parseFloat(_.maxBy(totalIfPerYear, 'value').value),
                parseFloat(_.maxBy(totalSjrPerYear, 'value').value),
                parseFloat(_.maxBy(totalSnipPerYear, 'value').value));
            const maxXValue = parseInt(_.maxBy(totalIfPerYear, 'year').year, 10);
            const minXValue = parseInt(_.minBy(totalIfPerYear, 'year').year, 10);

            const range = getRangeX(
                _.minBy(totalIfPerYear, 'year').year,
                _.maxBy(totalIfPerYear, 'year').year
            );

            let journalMetricsColors = [];
            journalMetricsColors.push('#' + styles.impactFactorColor);
            journalMetricsColors = journalMetricsColors.concat(colors);

            return {
                title: 'Journal metrics by year',
                data: [{
                    key: 'IF',
                    values: totalIfPerYear
                }, {
                    key: 'SJR',
                    values: totalSjrPerYear
                }, {
                    key: 'SNIP',
                    values: totalSnipPerYear
                }],
                options: {
                    chart: {
                        type: 'lineChart',
                        color: (d, i) => journalMetricsColors[i],
                        showLabels: true,
                        showLegend: true,
                        useInteractiveGuideline: true,
                        reduceXTicks: false,
                        duration: 300,
                        x: d => d.year,
                        y: d => d.value,
                        xAxis: {
                            axisLabel: '',
                            rotateLabels: 50,
                            showMaxMin: false,
                            tickValues: range,
                            tickFormat: d => d3.format('')(d)
                        },
                        yAxis: {
                            axisLabel: '',
                            axisLabelDistance: -10,
                            tickFormat: d => d3.format('.2f')(d)
                        },
                        yDomain: [0, maxYValue + (maxYValue * 0.05)],
                        xDomain: [minXValue, maxXValue + ((maxXValue - minXValue) * 0.05)],
                        valueFormat: d => d3.format('.2f')(d),
                    }
                }
            };
        };

        service.getJournalMetricsPerYearBarChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const range = getRangeX(
                yearRange.min,
                yearRange.max
            );

            let journalMetricsColors = [];
            journalMetricsColors.push('#' + styles.impactFactorColor);
            journalMetricsColors = journalMetricsColors.concat(colors);

            return {
                title: 'Journal metrics by year',
                data: [{
                    key: 'IF',
                    values: getItemsByYear(chartsData.totalIfPerYear, yearRange)
                }, {
                    key: 'SJR',
                    values: getItemsByYear(chartsData.totalSjrPerYear, yearRange)
                }, {
                    key: 'SNIP',
                    values: getItemsByYear(chartsData.totalSnipPerYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    color: (d, i) => journalMetricsColors[i],
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    },
                    valueFormat: d => d3.format('.2f')(d)
                }, {
                    tickFormat: d => d3.format('.2f')(d)
                })
            };
        };

        service.getFilteredDocumentsByYear = function (chartsData) {
            const yearRange = getYearRange(chartsData);
            const affiliatedDocuments = [];
            chartsData.filteredAffiliatedJournalsByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedConferencesByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedBooksByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedBookSeriesByYear.forEach(getDataMerger(affiliatedDocuments));
            const notAffiliatedDocuments = [];
            chartsData.filteredNotAffiliatedJournalsByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedConferencesByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedBooksByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedBookSeriesByYear.forEach(getDataMerger(notAffiliatedDocuments));

            const data = [{
                key: 'IIT',
                values: getItemsByYear(affiliatedDocuments, yearRange)
            }, {
                key: 'non-IIT',
                values: getItemsByYear(notAffiliatedDocuments, yearRange)
            }];

            const range = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const maxY = Math.max.apply(null, getDatamax(data));
            const rangeY = getRangeY(maxY);

            return {
                title: 'IIT vs non-IIT documents',
                data: data,
                options: getMultiBarChartConfig({
                    color: colors,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d)
                    }
                }),
            };
        };

        service.getFilteredDocumentsSourceTypeByYear = function (chartsData) {
            const yearRange = getYearRange(chartsData);
            const filteredJournals = [];
            chartsData.filteredAffiliatedJournalsByYear.forEach(getDataMerger(filteredJournals));
            chartsData.filteredNotAffiliatedJournalsByYear.forEach(getDataMerger(filteredJournals));
            const filteredConferences = [];
            chartsData.filteredAffiliatedConferencesByYear.forEach(getDataMerger(filteredConferences));
            chartsData.filteredNotAffiliatedConferencesByYear.forEach(getDataMerger(filteredConferences));
            const filteredBooks = [];
            chartsData.filteredAffiliatedBooksByYear.forEach(getDataMerger(filteredBooks));
            chartsData.filteredNotAffiliatedBooksByYear.forEach(getDataMerger(filteredBooks));
            const filteredBookSeries = [];
            chartsData.filteredAffiliatedBookSeriesByYear.forEach(getDataMerger(filteredBookSeries));
            chartsData.filteredNotAffiliatedBookSeriesByYear.forEach(getDataMerger(filteredBookSeries));

            const data = [{
                key: DocumentTypesService.getSourceTypeLabel('journal'),
                values: getItemsByYear(filteredJournals, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('conference'),
                values: getItemsByYear(filteredConferences, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('book'),
                values: getItemsByYear(filteredBooks, yearRange)
            }, {
                key: DocumentTypesService.getSourceTypeLabel('bookseries'),
                values: getItemsByYear(filteredBookSeries, yearRange)
            }];

            const rangeX = getRangeX(
                yearRange.min,
                yearRange.max
            );

            const maxY = getDatamax(data).reduce((a, b) => a + b, 0);
            const rangeY = getRangeY(maxY);

            return {
                title: 'Document by source type',
                data: data,
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: colors,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: rangeX,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickValues: rangeY,
                        tickFormat: d => d3.format(',.0d')(d)
                    }
                }),
            };
        };

        service.getTotalFilteredDocuments = function (chartsData) {
            return getTotal(chartsData, [
                'filteredAffiliatedJournalsByYear',
                'filteredAffiliatedConferencesByYear',
                'filteredAffiliatedBooksByYear',
                'filteredAffiliatedBookSeriesByYear',
                'filteredNotAffiliatedJournalsByYear',
                'filteredNotAffiliatedConferencesByYear',
                'filteredNotAffiliatedBooksByYear',
                'filteredNotAffiliatedBookSeriesByYear',
            ]);
        };

        service.getTotalImpactFactorDocumentsOnJournals = function (chartsData) {
            return getTotal(chartsData, [
                'filteredAffiliatedJournalsByYear',
                'filteredNotAffiliatedJournalsByYear'
            ]);
        };

        service.getTotalFilteredJournals = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedJournalsByYear', 'filteredNotAffiliatedJournalsByYear']);
        };
        service.getTotalFilteredConferences = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedConferencesByYear', 'filteredNotAffiliatedConferencesByYear']);
        };
        service.getTotalFilteredBooks = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedBooksByYear', 'filteredNotAffiliatedBooksByYear']);
        };
        service.getTotalFilteredBookSeries = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedBookSeriesByYear', 'filteredNotAffiliatedBookSeriesByYear']);
        };

        service.getHindex = function (chartsData) {
            return chartsData.hindexPerYear.length ? chartsData.hindexPerYear[chartsData.hindexPerYear.length - 1].value : 0;
        };

        service.getTotalCitations = function (chartsData) {
            return getTotal(chartsData, ['citationsPerYear']);
        };

        service.getTotalImpactFactor = function (chartsData) {
            return getTotal(chartsData, ['totalIfPerYear']);
        };

        service.getDocumentTotals = (chartsData) => {
            let documentTotals = [
                {
                    title: 'Journals',
                    value: service.getTotalFilteredJournals(chartsData)
                },
                {
                    title: 'Conferences',
                    value: service.getTotalFilteredConferences(chartsData)
                },
                {
                    title: 'Books',
                    value: service.getTotalFilteredBooks(chartsData)
                },
                {
                    title: 'Book Series',
                    value: service.getTotalFilteredBookSeries(chartsData)
                },
            ];

            const baseOptions = {
                chart: {
                    type: 'pieChart',
                    x: d => d.type,
                    y: d => d.value,
                    labelThreshold: 0.02,
                    labelSunbeamLayout: true,
                    showLabels: true,
                    legendPosition: 'right',
                    color: (d, i) => colors[i],
                    valueFormat: d => d3.format('')(d)
                }
            };

            return {
                title: 'Document Totals',
                data: documentTotals.map(d => ({
                    type: d.title,
                    value: parseInt(d.value)
                })),
                options: baseOptions
            };
        };

        return service;

        // private
        function getDefaultOptions(options, defaults) {
            const newOptions = {};
            newOptions.chart = Object.assign({}, options.chart, _.cloneDeep(defaults.chart));
            newOptions.chart.margin = Object.assign({}, options.chart.margin, _.cloneDeep(defaults.chart.margin));
            newOptions.chart.xAxis = Object.assign({}, options.chart.xAxis, _.cloneDeep(defaults.chart.xAxis));
            newOptions.chart.yAxis = Object.assign({}, options.chart.yAxis, _.cloneDeep(defaults.chart.yAxis));
            return newOptions;
        }

        function getItemsByYear(data, yearRange) {
            const newData = data.map(d => ({
                year: parseInt(d.year, 10),
                value: parseFloat(d.value)
            })).filter(d => d.year >= yearRange.min);
            _.range(yearRange.min, yearRange.max + 1).forEach(y => {
                if (!_.find(newData, {year: y}))
                    newData.push({year: y, value: 0});
            });

            newData.sort((a, b) => a.year < b.year ? -1 : a.year > b.year ? 1 : 0);

            return newData;
        }


        function getYearRange(chartsData) {
            let flattenedData = [];

            flattenedData = flattenedData.concat(chartsData.journalsByYear);
            flattenedData = flattenedData.concat(chartsData.conferencesByYear);
            flattenedData = flattenedData.concat(chartsData.booksByYear);
            flattenedData = flattenedData.concat(chartsData.bookSeriesByYear);

            const years = flattenedData.map(v => parseInt(v.year, 10));
            const currentYear = new Date().getFullYear();

            return {
                min: _.isEmpty(years) ? currentYear : _.min(years),
                max: _.isEmpty(years) ? currentYear : Math.max(currentYear, _.max(years)),
            };
        }

        function getDataMerger(dataSet) {
            return function (d) {
                const value = parseInt(d.value, 10);
                const data = dataSet.find(d2 => d2.year === d.year);
                if (data)
                    data.value += value;
                else
                    dataSet.push({
                        year: d.year,
                        value: value
                    });
            };
        }

        function getMultiBarChartConfig(chartOptions = {}, yAxisOptions = {}) {
            return {
                chart: Object.assign({}, {
                    type: 'multiBarChart',
                    showLabels: true,
                    showLegend: true,
                    showValues: true,
                    stacked: false,
                    showControls: false,
                    x: d => d.year,
                    y: d => d.value,
                    duration: 300,
                    reduceXTicks: true,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: Object.assign({
                        axisLabel: '',
                        axisLabelDistance: -10,
                        tickFormat: d => d3.format(',.0d')(d)
                    }, yAxisOptions),
                    valueFormat: d => d3.format('')(d)
                }, chartOptions)
            };
        }

        function getTotal(chartsData, dataNames) {
            let total = 0;
            dataNames.forEach(dn => total = chartsData[dn].reduce((total, d) => total + parseFloat(d.value), total));
            return total;
        }

        function getRangeX(minX, maxX) {
            let step = 1;

            const maxXValue = parseInt(maxX, 10);
            const minXValue = parseInt(minX, 10);

            switch (true) {
                case maxXValue - minXValue > 20:
                    step = 5;
                    break;
                case maxXValue - minXValue > 10:
                    step = 2;
                    break;
                default:
                    step = 1;
            }

            let range = d3.time.year.range(
                new Date(minX, 0),
                new Date(maxX, 0),
                step
            );

            return range.map(r => r.getFullYear());
        }

        function getRangeY(maxY, addMax = false) {
            let step = 1;

            switch (true) {
                case maxY > 40000:
                    step = 10000;
                    break;
                case maxY > 20000 && maxY <= 40000:
                    step = 5000;
                    break;
                case maxY > 10000 && maxY <= 20000:
                    step = 2000;
                    break;
                case maxY > 5000 && maxY <= 10000:
                    step = 1000;
                    break;
                case maxY > 2000 && maxY <= 5000:
                    step = 500;
                    break;
                case maxY > 1000 && maxY <= 2000:
                    step = 200;
                    break;
                case maxY > 500 && maxY <= 1000:
                    step = 100;
                    break;
                case maxY > 200 && maxY <= 500:
                    step = 50;
                    break;
                case maxY > 100 && maxY <= 200:
                    step = 20;
                    break;
                case maxY > 20 && maxY <= 100:
                    step = 10;
                    break;
                case maxY > 14 && maxY <= 20:
                    step = 5;
                    break;
                case maxY > 6 && maxY <= 14:
                    step = 2;
                    break;
            }

            const rangeY = d3.range(
                0,
                maxY,
                step
            );

            if (addMax) {
                rangeY.push(maxY);
            }

            return rangeY;
        }

        function getDatamax(data) {
            return data.map(d => Math.max.apply(null, d.values.map(o => o.value)));
        }
    }
}());
