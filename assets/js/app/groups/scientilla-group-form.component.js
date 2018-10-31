(function () {

    angular
        .module('groups')
        .component('scientillaGroupForm', {
            templateUrl: 'partials/scientilla-group-form.html',
            controller: GroupFormController,
            controllerAs: 'vm',
            bindings: {
                group: "<",
                onFailure: "&",
                onSubmit: "&"
            }
        });

    GroupFormController.$inject = [
        'GroupsService',
        'Notification',
        'AuthService',
        '$scope',
        'groupTypes',
        'groupTypeLabels',
        'ModalService'
    ];

    function GroupFormController(GroupsService, Notification, AuthService, $scope, groupTypes, groupTypeLabels, ModalService) {
        const vm = this;
        vm.getUsersQuery = getUsersQuery;
        vm.cancel = cancel;

        vm.submit = submit;

        vm.errors = [];
        vm.errorText = '';

        let formValues = {};
        let originalGroup = {};
        let forcedClose = false;

        vm.formStructure = {
            name: {
                inputType: 'text',
                label: 'Title',
                defaultValue: vm.group.name,
                ngIf: isAdmin,
                required: true,
                type: 'field'
            },
            slug: {
                inputType: 'text',
                label: 'Slug',
                defaultValue: vm.group.slug,
                ngIf: isAdmin,
                type: 'field'
            },
            shortname: {
                inputType: 'text',
                label: 'Short Name',
                defaultValue: vm.group.shortname,
                type: 'field'
            },
            description: {
                inputType: 'text',
                label: 'Description',
                defaultValue: vm.group.description,
                type: 'field'
            },
            scopusId: {
                inputType: 'text',
                label: 'Scopus ID',
                defaultValue: vm.group.scopusId,
                type: 'field'
            },
            type: {
                inputType: 'select',
                label: 'Group Type',
                defaultValue: vm.group.type || groupTypes.RESEARCH_LINE,
                values: Object.keys(groupTypes).map(k => ({label: groupTypeLabels[k], value: groupTypes[k]})),
                ngIf: isAdmin,
                type: 'field'
            },
            code: {
                inputType: 'text',
                label: 'CDR/CODE',
                defaultValue: vm.group.code,
                type: 'field'
            },
            active: {
                inputType: 'select',
                label: 'Active',
                defaultValue: vm.group.active === undefined ? true : vm.group.active,
                values: [
                    {label: 'Yes', value: true},
                    {label: 'No', value: false}
                ],
                ngIf: isAdmin,
                type: 'field'
            },
            onChange: function(values) {
                formValues = values;
            }
        };

        vm.$onInit = function () {
            delete vm.group.members;
            delete vm.group.memberships;
            $scope.$watch('vm.group.name', nameChanged);

            $scope.$on('modal.closing', function(event, reason) {
                cancel(event);
            });

            originalGroup = angular.copy(vm.group);
            if (!originalGroup.slug) {
                originalGroup.slug = calculateSlug(originalGroup);
            }
            if (originalGroup.type === undefined) {
                originalGroup.type = groupTypes.RESEARCH_LINE;
            }
            if (originalGroup.active === undefined) {
                originalGroup.active = true;
            }
        };

        function nameChanged() {
            if (!vm.group)
                return;
            if (!vm.group.id) {
                vm.group.slug = calculateSlug(vm.group);
            }
        }

        function calculateSlug(group) {
            const name = group.name ? group.name : "";
            return name.toLowerCase().replace(/\s+/gi, '-');
        }

        function submit(group) {
            if (!group) return;

            for (const key of Object.keys(vm.formStructure))
                vm.group[key] = group[key];

            if (!vm.group.slug)
                vm.group.slug = calculateSlug(group);

            GroupsService.doSave(vm.group)
                .then(function () {
                    vm.errorText = '';
                    Notification.success("Group data saved");
                    originalGroup = angular.copy(vm.group);
                    if (_.isFunction(vm.onSubmit()))
                        vm.onSubmit()(1);
                }, function (res) {
                    var errors = res.data.invalidAttributes;
                    vm.errors = {};

                    angular.forEach(errors, function(fields, fieldIndex) {
                        angular.forEach(fields, function(error, errorIndex) {
                            if (error.rule === 'required'){
                                error.message = 'This field is required.';
                                errors[fieldIndex][errorIndex] = error;
                            }
                        });

                        vm.errors[fieldIndex] = errors[fieldIndex];
                    });

                    vm.errorText = 'Please correct the errors on this form!';
                });
        }

        function getUsersQuery(searchText) {
            const qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            const model = 'users';
            return {model: model, qs: qs};
        }

        function cancel(event = false) {
            if (!forcedClose) {
                for (const key of Object.keys(vm.formStructure)) {
                    vm.group[key] = formValues[key];
                }

                if (!vm.group.slug) {
                    vm.group.slug = calculateSlug(formValues);
                }

                if (angular.toJson(originalGroup) !== angular.toJson(vm.group)) {
                    if (event) {
                        event.preventDefault();
                    }

                    // Show the unsaved data modal
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
                                    forcedClose = true;
                                    executeOnSubmit(0);
                                    break;
                                default:
                                    break;
                            }
                        });
                } else {
                    forcedClose = true;
                    executeOnSubmit(0);
                }
            }
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }

        function executeOnFailure() {
            if (_.isFunction(vm.onFailure()))
                vm.onFailure()();
        }

        function isAdmin() {
            return AuthService.user.isAdmin();
        }
    }
})();
