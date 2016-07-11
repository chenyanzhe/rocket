/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider) {
    $urlRouterProvider.otherwise("/dashboards/overview");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider

        .state('dashboards', {
            abstract: true,
            url: "/dashboards",
            templateUrl: "views/common/content.html",
        })
        .state('dashboards.overview', {
            url: "/overview",
            templateUrl: "views/dashboards/overview.html",
            data: { pageTitle: 'Dashboards | Overview' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            serie: true,
                            name: 'angular-flot',
                            files: ['lib/js/plugins/flot/jquery.flot.js', 'lib/js/plugins/flot/jquery.flot.time.js', 'lib/js/plugins/flot/jquery.flot.tooltip.min.js', 'lib/js/plugins/flot/jquery.flot.spline.js', 'lib/js/plugins/flot/jquery.flot.resize.js', 'lib/js/plugins/flot/jquery.flot.pie.js', 'lib/js/plugins/flot/curvedLines.js', 'lib/js/plugins/flot/angular-flot.js', ]
                        },
                        {
                            name: 'angular-peity',
                            files: ['lib/js/plugins/peity/jquery.peity.min.js', 'lib/js/plugins/peity/angular-peity.js']
                        }
                    ]);
                }
            }
        })
        .state('virtualmachines', {
            abstract: true,
            url: "/virtualmachines",
            templateUrl: "views/common/content.html",
        })
        .state('virtualmachines.overview', {
            url: "/overview",
            templateUrl: "views/minor.html",
            data: { pageTitle: 'Example view' }
        })
}
angular
    .module('inspinia')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
