/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {
    this.userName = 'Rocket';
}

/**
 * wizardCtrl - Controller for wizard functions
 * used in Wizard view
 */
function wizardCtrl($scope, $rootScope) {
    // All data will be store in this object
    $scope.formData = {};

    // After process wizard
    $scope.processForm = function() {
    	alert('Wizard completed');
    };

}

function subscriptionCtrl($scope, subscriptionService) {
    subscriptionService.subList()
        .success(function (data) {
            $scope.subInfo = data;
            for (var i = 0; i < data.subscriptions.length; i++) {
                if (data.subscriptions[i].id === data.active)
                    $scope.activeSubName = data.subscriptions[i].name;
            }
        })
        .error(function (err) {
            console.log(err);
        });

    $scope.changeLanguage = function (langKey) {
        var targetSub = $scope.subInfo.subscriptions[langKey].id;
        subscriptionService.switchSub(targetSub)
            .success(function (data) {
                window.location.reload();
            });
    };
}

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('wizardCtrl', wizardCtrl)
    .controller('subscriptionCtrl', subscriptionCtrl);