angular.module('app.routes', [])
    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('feedback', {
                url: '/feedback',
                templateUrl: 'templates/feedback.html',
                controller: 'feedbackCtrl',
                params:{
                    "event_id": ''
                }
            })

            .state('result', {
                url: '/result',
                templateUrl: 'templates/result.html',
                controller: 'resultCtrl',
                params:{
                    "event_id": '',
                    "removeBackView": false,
                    "Q1": '',
                    "Q2": '',
                    "Q3": '',
                    "Q4": '',
                    "Q5": '',
                    "Q6a": '',
                    "Q6b": '',
                    "Q6c": '',
                    "Q7a": '',
                    "Q7b": '',
                    "Q7c": '',
                    "Q7d": '',
                    "Q7e": ''
                }
            })
            
            .state('login', {
                url: '/login',
                templateUrl: 'templates/login.html',
                controller: 'loginCtrl'
            })
            
            .state('meetings', {
                url: '/meetings',
                templateUrl: 'templates/meetings.html',
                controller: 'meetingsCtrl'
            })
            
            .state('tabsController', {
                url: '/page1',
                templateUrl: 'templates/tabsController.html',
                abstract:true
            })
        $urlRouterProvider.otherwise('/login')
    }
);