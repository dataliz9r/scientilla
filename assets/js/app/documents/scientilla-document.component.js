(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDocument', {
            templateUrl: 'partials/scientillaDocument.html',
            controller: scientillaDocument,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                showPrivateTags: "<?",
                checkDuplicates: '<?'
            }
        });

    scientillaDocument.$inject = [
        'ModalService',
        'config',
        'DocumentLabels',
        'context',
        'documentOrigins'
    ];

    function scientillaDocument(ModalService, config, DocumentLabels, context, documentOrigins) {
        const vm = this;
        vm.openDetails = openDetails;
        vm.hasMainGroupAffiliation = hasMainGroupAffiliation;
        vm.editTags = editTags;
        vm.isSynchronized = isSynchronized;
        vm.showScopusMetrics = showScopusMetrics;
        vm.showWOSMetrics = showWOSMetrics;
        vm.getMetricValue = getMetricValue;
        vm.hasMetric = hasMetric;

        const researchEntity = context.getResearchEntity();
        if (_.isNil(vm.checkDuplicates))
            vm.checkDuplicates = true;

        vm.metrics = {
            CITATIONS: 'citations',
            SJR: 'SJR',
            SNIP: 'SNIP',
            IF: 'IF',
            IF5: '5IF',
            AIS: 'AIS'
        };

        vm.$onInit = function () {
            vm.showPrivateTags = vm.showPrivateTags || false;
            vm.verifiedCount = getVerifiedCount();
            if (vm.checkDuplicates)
                checkDuplicate();

            addLabels();
        };

        function checkDuplicate() {
            function isSuggested(doc) {
                const f = researchEntity.getType() === 'user' ? 'authors' : 'groups';
                return !doc[f].some(re => re.id === researchEntity.id);
            }

            if (!vm.document.duplicates || !vm.document.duplicates.length)
                return;
            let documentLabel;
            //verified and duplicated
            if (vm.document.kind === 'v' && !isSuggested(vm.document) && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.DUPLICATE;
            //verified and duplicates in drafts (no real duplicates)
            else if (vm.document.kind === 'v' && !isSuggested(vm.document) && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                ;
            //draft and duplicated
            else if (vm.document.kind === 'd' && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.DUPLICATE;
            //draft and already verified
            else if (vm.document.kind === 'd' && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //external and already verified
            else if (vm.document.kind === 'e' && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //external and already in drafts
            else if (vm.document.kind === 'e' && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.ALREADY_IN_DRAFTS;
            //suggested and already verified
            else if (vm.document.kind === 'v' && isSuggested(vm.document) && vm.document.duplicates.some(d => d.duplicateKind === 'v'))
                documentLabel = DocumentLabels.ALREADY_VERIFIED;
            //suggested and already in drafts
            else if (vm.document.kind === 'v' && isSuggested(vm.document) && vm.document.duplicates.every(d => d.duplicateKind === 'd'))
                documentLabel = DocumentLabels.ALREADY_IN_DRAFTS;
            if (documentLabel)
                vm.document.addLabel(documentLabel);
        }

        function addLabels() {
            if (vm.document.kind === 'd' && (new Date(vm.document.createdAt)).toDateString() === (new Date()).toDateString())
                vm.document.addLabel(DocumentLabels.NEW);
        }

        function openDetails() {
            ModalService
                .openScientillaDocumentDetails(vm.document);
        }

        function hasMainGroupAffiliation() {
            return _.some(vm.document.affiliations, function (a) {
                return a.institute === config.mainInstitute.id;
            });
        }

        function editTags() {
            ModalService.openScientillaTagForm(vm.document);
        }

        function showScopusMetrics() {
            return hasMetric(vm.metrics.CITATIONS) || hasMetric(vm.metrics.SNIP) || hasMetric(vm.metrics.SJR);
        }

        function showWOSMetrics() {
            return hasMetric(vm.metrics.IF);
        }

        function hasMetric(metric) {
            switch (metric) {
                case vm.metrics.CITATIONS:
                    return !!vm.document.citations.find(cit => cit.origin === documentOrigins.SCOPUS);
                case vm.metrics.SNIP:
                case vm.metrics.SJR:
                case vm.metrics.IF:
                    return !!getMetric(metric);
            }
            return false;
        }

        function getMetricValue(metric) {
            return getMetric(metric).value;
        }

        function getMetric(metric) {
            if (metric === vm.metrics.CITATIONS)
                return {
                    value: vm.document.citations.reduce((tot, val) => val.citations + tot, 0)
                };

            return vm.document.sourceMetrics.find(m => m.name === metric);
        }

        function getVerifiedCount() {
            return vm.document.authorships.filter(a => a.researchEntity)
                .concat(vm.document.groupAuthorships).length;
        }

        function isSynchronized() {
            return vm.document.synchronized && vm.document.origin === 'scopus';
        }
    }


})();