(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaComponentForm', {
            templateUrl: 'partials/scientilla-component-form.html',
            controller: scientillaComponentForm,
            controllerAs: 'vm',
            bindings: {
                structure: '<',
                cssClass: '@',
                onSubmit: '&'
            },
            transclude: true,
        });

    scientillaComponentForm.$inject = [
        '$scope'
    ];

    function scientillaComponentForm($scope) {
        const vm = this;

        vm.submit = submit;
        vm.reset = reset;

        vm.values = {};
        let onChangeWatchesDeregisters = [];
        let onStructureChangeDeregisterer;

        vm.fields = filterStructure('field');
        vm.actions = filterStructure('action');
        vm.connectors = filterStructure('connector');
        vm.getObjectSize = getObjectSize;

        vm.$onInit = function () {
            setDefault();
            clearNil();

            onStructureChangeDeregisterer = $scope.$watch('vm.structure', onStructureChange, true);
        };

        vm.$onDestroy = function () {
            deregisterOnChanges();
            onStructureChangeDeregisterer();
        };

        function reset() {
            setDefault();
            clearNil();
        }

        function clearNil() {
            _.forEach(vm.values, (v, k) => {
                    if (_.isNil(v))
                        delete vm.values[k];
                }
            );
        }

        function setDefault() {
            _.forEach(vm.values, (value, key) => {
                const struct = vm.structure[key];
                if (struct.inputType === 'select' && !struct.defaultValue)
                    vm.values[key] = "?";
                else {
                    if (struct.defaultValue)
                        vm.values[key] = struct.defaultValue;
                    else
                        vm.values[key] = null;
                }
            });
        }

        function submit() {
            clearNil();
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(vm.values);
        }

        function onStructureChange() {
            deregisterOnChanges();

            const oldSearchValues = _.cloneDeep(vm.values);
            vm.values = {};

            _.forEach(vm.structure, function (struct, key) {
                if (!_.isUndefined(oldSearchValues[key]))
                    vm.values[key] = oldSearchValues[key];
                else if (!_.isUndefined(struct.defaultValue)) {
                    vm.values[key] = struct.defaultValue;
                }

                if (!_.isUndefined(struct.onChange))
                    onChangeWatchesDeregisters.push($scope.$watch('vm.values.' + key, execEvent(struct.onChange)));
            });
        }

        function execEvent(fn) {
            if (_.isFunction(fn))
                return fn;
            if (fn === 'submit')
                return submit;
            if (fn === 'reset')
                return reset;
        }

        function deregisterOnChanges() {
            _.forEach(onChangeWatchesDeregisters, function (deregister) {
                deregister();
            });
            onChangeWatchesDeregisters = [];
        }

        function filterStructure(type) {
            let structs = {};

            Object.keys(vm.structure).forEach(function(name) {
                let struct = vm.structure[name];

                if (struct.type === type) {
                    structs[name] = struct;
                }
            });

            return structs;
        }

        function getObjectSize(object) {
            return Object.keys(object).length;
        }
    }

})();