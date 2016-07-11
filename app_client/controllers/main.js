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

angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)