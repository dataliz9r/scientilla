(function () {
    'use strict';

    angular.module('components')
        .component('scientillaButton', {
            templateUrl: 'partials/scientilla-button.html',
            controller: scientillaButtonController,
            controllerAs: 'vm',
            bindings: {
                type: '@?',
                size: '@?',
                title: '@?',
                ngDisabled: '<',
                click: '&'
            },
            transclude: true
        });

    function scientillaButtonController() {
        const vm = this;
        vm.getClasses = getClasses;

        const typeTable = {
            submit: 'submit',
            button: 'button',
            secondary: 'button',
            cancel: 'button',
            link: 'button',
        };

        vm.$onInit = function () {
            vm.type = vm.type || 'button';
            vm.buttonType = typeTable[vm.type];
            vm.size = vm.size || 'medium';
        };

        function getClasses() {
            const typeClassesTable = {
                submit: 'btn-primary',
                button: 'btn-primary',
                secondary: 'btn-outline-secondary',
                cancel: 'btn-outline-secondary',
                link: 'btn-link',
                danger: 'btn-danger'
            };
            const sizeClassesTable = {
                small: '',
                medium: ''
            };
            return typeClassesTable[vm.type] + ' ' + sizeClassesTable[vm.size];
        }
    }

})();