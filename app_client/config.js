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
                            serie: true,
                            files: ['lib/js/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js', 'lib/js/plugins/jvectormap/jquery-jvectormap-2.0.2.css']
                        },
                        {
                            serie: true,
                            files: ['lib/js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js']
                        },
                        {
                            name: 'angles',
                            files: ['lib/js/plugins/chartJs/angles.js', 'lib/js/plugins/chartJs/Chart.min.js']
                        }
                    ]);
                }
            }
        })
        .state('dashboards.costs', {
            url: "/costs",
            templateUrl: "views/dashboards/costs.html",
            data: { pageTitle: 'Dashboards | Costs' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['lib/js/plugins/moment/moment.min.js']
                        },
                        {
                            files: ['lib/js/plugins/footable/footable.all.min.js', 'lib/css/plugins/footable/footable.core.css']
                        },
                        {
                            name: 'ui.footable',
                            files: ['lib/js/plugins/footable/angular-footable.js']
                        },
                        {
                            serie: true,
                            files: ['lib/js/plugins/daterangepicker/daterangepicker.js', 'lib/css/plugins/daterangepicker/daterangepicker-bs3.css']
                        },
                        {
                            name: 'daterangepicker',
                            files: ['lib/js/plugins/daterangepicker/angular-daterangepicker.js']
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
        .state('virtualmachines.deploy', {
            url: "/deploy",
            templateUrl: "views/virtualmachines/deploy.html",
            controller: wizardCtrl,
            data: { pageTitle: 'Virtual Machines | Deploy' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            files: ['lib/css/plugins/steps/jquery.steps.css']
                        },
                        {
                            serie: true,
                            name: 'angular-ladda',
                            files: ['lib/js/plugins/ladda/spin.min.js', 'lib/js/plugins/ladda/ladda.min.js', 'lib/css/plugins/ladda/ladda-themeless.min.css','lib/js/plugins/ladda/angular-ladda.min.js']
                        },
                        {
                            insertBefore: '#loadBefore',
                            name: 'localytics.directives',
                            files: ['lib/css/plugins/chosen/chosen.css','lib/js/plugins/chosen/chosen.jquery.js','lib/js/plugins/chosen/chosen.js']
                        }
                    ]);
                }
            }
        })
        .state('virtualmachines.deploy.step_one', {
            url: '/step_one',
            templateUrl: 'views/virtualmachines/deploy/step_one.html',
            data: { pageTitle: 'Virtual Machines | Deploy | Step One' }
        })
        .state('virtualmachines.deploy.step_two', {
            url: '/step_two',
            templateUrl: 'views/virtualmachines/deploy/step_two.html',
            data: { pageTitle: 'Virtual Machines | Deploy | Step Two' }
        })
        .state('virtualmachines.deploy.step_three', {
            url: '/step_three',
            templateUrl: 'views/virtualmachines/deploy/step_three.html',
            data: { pageTitle: 'Virtual Machines | Deploy | Step Three' }
        })
        .state('virtualmachines.deploy.step_four', {
            url: '/step_four',
            templateUrl: 'views/virtualmachines/deploy/step_four.html',
            data: { pageTitle: 'Virtual Machines | Deploy | Step Four' }
        })
}
angular
    .module('inspinia')
    .config(config)
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
    });
