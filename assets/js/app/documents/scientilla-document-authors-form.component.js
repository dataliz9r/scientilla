/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaDocumentAuthorsForm', {
            templateUrl: 'partials/scientilla-document-authors-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });


    controller.$inject = [
        '$scope',
        'ModalService'
    ];

    function controller($scope, ModalService) {
        const vm = this;
        const deregisteres = [];
        const coauthorsDeregisteres = [];

        vm.viewFirstCoauthor = viewFirstCoauthor;
        vm.viewLastCoauthor = viewLastCoauthor;
        vm.submit = submit;
        vm.cancel = cancel;

        let originalAuthorship = {};

        vm.$onInit = () => {
            deregisteres.push($scope.$watch('vm.position', userSelectedChanged));

            // Listen to modal closing event
            $scope.$on('modal.closing', function(event, reason) {
                cancel(event, reason);
            });
        };
        vm.$onDestroy = () => {
            for (const deregisterer of deregisteres)
                deregisterer();

            for (const deregisterer of coauthorsDeregisteres)
                deregisterer();
        };

        function viewFirstCoauthor() {
            if (vm.authorship && vm.document) {
                return vm.authorship.position > 0 && vm.authorship.position < vm.document.getAuthors().length - 1;
            } else {
                return false;
            }
        }

        function viewLastCoauthor() {
            if (vm.authorship && vm.document) {
                return vm.authorship.position > 0 && vm.authorship.position < vm.document.getAuthors().length - 1;
            } else {
                return false;
            }
        }

        function userSelectedChanged() {
            if (_.isUndefined(vm.position)) {
                return;
            }
            // Copy original authorship to compare it later
            originalAuthorship = angular.copy(vm.document.authorships.find(a => a.position === vm.position));

            vm.author = vm.document.getAuthors()[vm.position];
            vm.authorship = vm.document.authorships.find(a => a.position === vm.position);
            if (!vm.authorship) {
                const newAuthorship = {
                    document: vm.document.id,
                    position: vm.position,
                    affiliations: []
                };
                vm.document.authorships.push(newAuthorship);
                vm.authorship = newAuthorship;
            }
            if (coauthorsDeregisteres.length) {
                coauthorsDeregisteres.pop()();
                coauthorsDeregisteres.pop()();
            }
            coauthorsDeregisteres.push($scope.$watch('vm.authorship.first_coauthor', getCoauthorChangedCB(0)));
            coauthorsDeregisteres.push($scope.$watch('vm.authorship.last_coauthor', getCoauthorChangedCB(1)));
        }

        function getCoauthorChangedCB(field) {
            const fields = ['first_coauthor', 'last_coauthor'];
            return () => {
                const index = (field - 1 + fields.length) % fields.length;
                if (vm.authorship.first_coauthor && vm.authorship.last_coauthor)
                    vm.authorship[fields[index]] = false;
            };
        }

        function cancel(event = false) {
            // Check if a position/author is selected
            if (_.isUndefined(vm.position)) {
                executeOnSubmit(0);
            } else {
                // Compare the current state with the original state
                if (originalAuthorship.oral_presentation === vm.authorship.oral_presentation &&
                    originalAuthorship.first_coauthor === vm.authorship.first_coauthor &&
                    originalAuthorship.last_coauthor === vm.authorship.last_coauthor) {
                    // No unsaved data
                    executeOnSubmit(0);
                } else {
                    if (event) {
                        // Prevent modal from closing
                        event.preventDefault();
                    }

                    // Show new modal to show there is unsaved data
                    ModalService
                        .multipleChoiceConfirm('Unsaved data',
                            `There is unsaved data in the form. Do you want to go back and save this data?`,
                            ['Yes', 'No'],
                            false)
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 0:
                                    break;
                                case 1:
                                    // Don't go back to save, close modal instead
                                    executeOnSubmit(0);
                                    break;
                                default:
                                    break;
                            }
                        });
                }
            }
        }

        function submit() {
            return save()
                .then(() => executeOnSubmit(1))
                .catch(() => executeOnFailure());
        }

        function save() {
            return vm.document.customPUT(vm.document.authorships, 'authorships');
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

    }
})();
