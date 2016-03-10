(function () {
    angular
            .module('users')
            .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        '$location',
        'UsersService',
        'AuthService',
        '$uibModal'
    ];

    function UserBrowsingController($location, UsersService, AuthService, $uibModal) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;

        activate();

        function activate() {
            return getUsers().then(function () {

            });
        }

        function getUsers() {
            return UsersService.getList({
                populate: ['memberships', 'references']
            }).then(function (data) {
                vm.users = data;
                return vm.users;
            });
        }

        function createNew() {
            openUserForm();
        }

        function viewUser(user) {
            $location.path('/users/' + user.id);
        }

        function editUser(user) {
            openUserForm(user);
        }

        function deleteUser(user) {
            user.remove()
                    .then(function () {
                        _.remove(vm.users, user);
                    });
        }

        // private
        function openUserForm(user) {

            $uibModal.open({
                animation: true,
                templateUrl: 'partials/user-form.html',
                controller: 'UserFormController',
                controllerAs: "vm",
                resolve: {
                    user: function () {
                        return !user ? UsersService.getNewUser() : user.clone();
                    }
                }
            })
                    .result
                    .then(function () {
                        getUsers();
                    });
        }

    }
})();