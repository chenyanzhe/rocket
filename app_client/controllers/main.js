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
    $scope.changeLanguage = function (langKey) {
        if (langKey === 'en') {
            subscriptionService.switchSub('c4528d9e-c99a-48bb-b12d-fde2176a43b8')
                .success(function (data) {
                    console.log("SUB1:", data);
                    window.location.reload();
                });
        } else {
            subscriptionService.switchSub('4be8920b-2978-43d7-ab14-04d8549c1d05')
                .success(function (data) {
                    console.log("SUB2:", data);
                    window.location.reload();
                });
        }
        console.log(langKey);
    };
}

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('wizardCtrl', wizardCtrl)
    .controller('subscriptionCtrl', subscriptionCtrl);