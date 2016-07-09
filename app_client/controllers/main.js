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

};

function flotChartCtrl() {

    /**
     * Pie Chart Data
     */
    var pieData = [
        {
            label: "Sales 1",
            data: 21,
            color: "#d3d3d3"
        },
        {
            label: "Sales 2",
            data: 3,
            color: "#bababa"
        },
        {
            label: "Sales 3",
            data: 15,
            color: "#79d2c0"
        },
        {
            label: "Sales 4",
            data: 52,
            color: "#1ab394"
        }
    ];

    /**
     * Pie Chart Options
     */
    var pieOptions = {
        series: {
            pie: {
                show: true
            }
        },
        grid: {
            hoverable: true
        },
        tooltip: true,
        tooltipOpts: {
            content: "%p.0%, %s", // show percentages, rounding to 2 decimal places
            shifts: {
                x: 20,
                y: 0
            },
            defaultTheme: false
        }
    };

    /**
     * Definition of variables
     * Flot chart
     */
    this.flotPieData = pieData;
    this.flotPieOptions = pieOptions;
}


angular
    .module('inspinia')
    .controller('MainCtrl', MainCtrl)
    .controller('flotChartCtrl', flotChartCtrl)