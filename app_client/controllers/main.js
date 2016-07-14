/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {

    this.userName = 'Example user';
    this.helloText = 'Welcome in SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';


    this.PieChart = {
        data: [1, 5],
        options: {
            fill: ["#1ab394", "#d7d7d7"]
        }
    };

    

};

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

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('wizardCtrl', wizardCtrl)