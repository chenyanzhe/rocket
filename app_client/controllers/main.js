/**
 * INSPINIA - Responsive Admin Theme
 *
 */

/**
 * MainCtrl - controller
 */
function MainCtrl() {

    this.userName = 'Rocket';

     /**
     * states - Data used in Advanced Form view for Chosen plugin
     */
    this.states = [
        'Alabama',
        'Alaska',
        'Arizona',
        'Arkansas',
        'California',
        'Colorado',
        'Connecticut',
        'Delaware',
        'Florida',
        'Georgia',
        'Hawaii',
        'Idaho',
        'Illinois',
        'Indiana',
        'Iowa',
        'Kansas',
        'Kentucky',
        'Louisiana',
        'Maine',
        'Maryland',
        'Massachusetts',
        'Michigan',
        'Minnesota',
        'Mississippi',
        'Missouri',
        'Montana',
        'Nebraska',
        'Nevada',
        'New Hampshire',
        'New Jersey',
        'New Mexico',
        'New York',
        'North Carolina',
        'North Dakota',
        'Ohio',
        'Oklahoma',
        'Oregon',
        'Pennsylvania',
        'Rhode Island',
        'South Carolina',
        'South Dakota',
        'Tennessee',
        'Texas',
        'Utah',
        'Vermont',
        'Virginia',
        'Washington',
        'West Virginia',
        'Wisconsin',
        'Wyoming'
    ];
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

function subscriptionCtrl($scope, switchSubscriptionService) {
    $scope.changeLanguage = function (langKey) {
        if (langKey === 'en') {
            switchSubscriptionService.switchSub('c4528d9e-c99a-48bb-b12d-fde2176a43b8')
                .success(function (data) {
                    console.log("SUB1:", data);
                    window.location.reload();
                });
        } else {
            switchSubscriptionService.switchSub('4be8920b-2978-43d7-ab14-04d8549c1d05')
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