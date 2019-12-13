(function () {
    "use strict";
    angular.module("services")
        .factory("ProfileService", ProfileService);

    ProfileService.$inject = [
        'Restangular'
    ];

    function ProfileService(Restangular) {
        return {
            exportProfile: exportProfile,
            addItem: addItem,
            removeItem: removeItem,
            getPrivacyTooltipText: getPrivacyTooltipText,
            getFavoriteTooltipText: getFavoriteTooltipText,
            getDatepickerOptions: getDatepickerOptions
        };

        function addItem (options = {}) {
            if (!options.item) {
                options.item = {
                    public: false
                };
            }

            if (options.property) {
                options.property.push(options.item);
            }
        }

        function removeItem (options = {}) {
            if (typeof(options.property) !== 'undefined' && typeof(options.index) !== 'undefined') {
                options.property.splice(options.index, 1);

                // todo remove errors
            }
        }

        function getPrivacyTooltipText(options = {}) {
            if (typeof(options.disableInvisible) !== 'undefined' || options.disableInvisible === true) {
                return 'Set the privacy of this field to public, only for Scientilla users';
            }

            return 'Set the privacy of this field to public, only for Scientilla users or hidden';
        }

        function getFavoriteTooltipText() {
            return 'Favorite this item to show it on your profile overview.';
        }

        function getDatepickerOptions() {
            return {
                showWeeks: false,
            };
        }

        /* jshint ignore:start */
        async function exportProfile(user, type) {
            const data = {
                type: type
            };
            return Restangular.one('researchentities', user.researchEntity).one('profile').customPOST(data, 'export');
        }
        /* jshint ignore:end */
    }
})();