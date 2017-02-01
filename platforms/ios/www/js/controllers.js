angular.module('app.controllers', [])
  
.controller('feedbackCtrl', ['$scope', '$stateParams', 'Survey', '$ionicPopup', '$analytics', '$window', 'UserService', '$state', '$ionicLoading', function ($scope, $stateParams, Survey, $ionicPopup, $analytics, $window, UserService, $state, $ionicLoading) {
    //Set default answer
    $scope.data = {
        user_email: UserService.getUser().email,
        event_id: $stateParams.event_id,
        useful_meeting: true,
        clear_agenda: true,
        desired_outcome:true,
        take_note: true,
        num_people: '3 - 4',
        participant_contribute: true,
        atmosphere: 'Neutral'
    };

    //Question 6 in carousel
    $scope.optionsForQuestion6 = [
        {
            img:"http://i.imgur.com/swJTwwu.png",
            text:"2"
        },
        {
            img:"http://i.imgur.com/8wrJmpf.png",
            text:"3 - 4"
        },
        {
            img:"http://i.imgur.com/GNaIFjU.png",
            text:"More than 5"
        }
    ];
    
    $scope.onReadySwiperQuestion6 = function (swiper) {
        swiper.slides[1].firstElementChild.className = "card selected"; //Set default value
        swiper.on('slideChangeEnd', function () {
            for (var i = 0; i < swiper.slides.length; i++) {
                if(i == swiper.activeIndex){
                    swiper.slides[i].firstElementChild.className = "card selected";
                }else{
                    swiper.slides[i].firstElementChild.className = "card";
                }
            }
            $scope.data.num_people = $scope.optionsForQuestion6[swiper.activeIndex].text;
        });
    };
    
    //Question 7 in carousel
    $scope.optionsForQuestion7 = [
        {
            img:"http://i.imgur.com/wJb3kSW.png",
            text:"Toxic"
        },
        {
            img:"http://i.imgur.com/iw7R96C.png",
            text:"Could be better"
        },
        {
            img:"http://i.imgur.com/5eLTPmL.png",
            text:"Neutral"
        },
        {
            img:"http://i.imgur.com/GXuD6ci.png",
            text:"Pretty good"
        },
                {
            img:"http://i.imgur.com/6eSylrD.png",
            text:"We had fun!"
        }
    ];

    $scope.onReadySwiperQuestion7 = function (swiper) {
        swiper.slides[2].firstElementChild.className = "card selected"; //Set default value
        swiper.on('slideChangeEnd', function () {
            for (var i = 0; i < swiper.slides.length; i++) {
                if(i == swiper.activeIndex){
                    swiper.slides[i].firstElementChild.className = "card selected";
                }else{
                    swiper.slides[i].firstElementChild.className = "card";
                }
            }
            $scope.data.atmosphere = $scope.optionsForQuestion7[swiper.activeIndex].text;
        });
    };
    
    //Submit
    $scope.submitting = false;
    
    $scope.test = function(){
        //$analytics.eventTrack('tabsController.login', { category: 'auth', label: 'success' }); //Work now
        if($window._paq){
            _paq.push(["trackPageView", "This is a very custom title"]);
            console.log('Tracking page view...');
        }
    }
    
    $scope.submit = function(){
        $scope.submitting = true;
        $ionicLoading.show();
        Survey.add($scope.data).then(function(){
            $scope.data = {
                user_email: UserService.getUser().email,
                event_id: $stateParams.event_id,
                useful_meeting: true,
                clear_agenda: true,
                desired_outcome:true,
                take_note: true,
                num_people: '3 - 4',
                participant_contribute: true,
                atmosphere: 'Neutral'
            }
        
            $scope.submitting = false;
            $ionicLoading.hide();
            var alertPopup = $ionicPopup.alert({
                title: 'Thank you!',
                template: 'Your response has been recorded.'
            });
            
            alertPopup.then(function(res) {
                $ionicLoading.show();
                var params = {
                    event_id: $stateParams.event_id
                };
        
                Survey.getEventsByEventId(params).then(function(resp){
                    params = calculateResponse(resp);
                    params.removeBackView = true;
                    $ionicLoading.hide();
                    $state.go('result', params);
                }); 
            });
        });
    }
}])
   
.controller('resultCtrl', ['$scope', '$stateParams', 'Survey', '$ionicPopup', '$document', '$ionicHistory', function ($scope, $stateParams, Survey, $ionicPopup, $document, $ionicHistory) {
    if($stateParams.removeBackView){
        $ionicHistory.removeBackView();
    }
    
    Chart.pluginService.register({
        beforeRender: function(chart) {
            if (chart.config.options.showAllTooltips) {
                // create an array of tooltips
                // we can't use the chart tooltip because there is only one tooltip per chart
                chart.pluginTooltips = [];
                chart.config.data.datasets.forEach(function(dataset, i) {
                    chart.getDatasetMeta(i).data.forEach(function(sector, j) {
                        chart.pluginTooltips.push(new Chart.Tooltip({
                            _chart: chart.chart,
                            _chartInstance: chart,
                            _data: chart.data,
                            _options: chart.options.tooltips,
                            _active: [sector]
                        }, chart));
                    });
                });
    
                // turn off normal tooltips
                chart.options.tooltips.enabled = false;
            }
        },
        afterDraw: function(chart, easing) {
            if (chart.config.options.showAllTooltips) {
                // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                if (!chart.allTooltipsOnce) {
                    if (easing !== 1)
                        return;
                    chart.allTooltipsOnce = true;
                }
    
                // turn on tooltips
                chart.options.tooltips.enabled = true;
                Chart.helpers.each(chart.pluginTooltips, function(tooltip) {
                    tooltip.initialize();
                    tooltip.update();
                    // we don't actually need this since we are not animating tooltips
                    tooltip.pivot();
                    tooltip.transition(easing).draw();
                });
                chart.options.tooltips.enabled = false;
            }
        }
    });
    
    $scope.options = {
        tooltips: {enabled: false}
    };
	
    $scope.showTooltipOptions = {
        events: false,
        showAllTooltips: true,
        tooltips: {
            mode:"label",
            callbacks: {
                label: function(tooltipItem, data) {
                    return data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + "%";
                }
            },
            custom: function(){
                console.log("a");
            }
        }
    };
    
    $scope.Q1 = {
        "data": [$stateParams.Q1, (100 - $stateParams.Q1).toFixed(2)],
        "labels": ["Useful", ""],
        "colors": [$stateParams.Q1 < 70 ? '#ff6a14' : '#90BCCF', '#DCDCDC']
    };
    
    $scope.Q2 = {
        "data": [$stateParams.Q2, (100 - $stateParams.Q2).toFixed(2)],
        "labels": ["Agenda", ""],
        "colors": [$stateParams.Q2 < 70 ? '#ff6a14' : '#90BCCF', '#DCDCDC']
    };

    
    $scope.Q3 = {
        "data": [$stateParams.Q3, (100 - $stateParams.Q3).toFixed(2)],
        "labels": ["Outcome"],
        "colors": [$stateParams.Q3 < 70 ? '#ff6a14' : '#90BCCF', '#DCDCDC']
    };
    
    $scope.Q4 = {
        "data": [$stateParams.Q4, (100 - $stateParams.Q4).toFixed(2)],
        "labels": ["Note"],
        "colors": [$stateParams.Q4 < 70 ? '#ff6a14' : '#90BCCF', '#DCDCDC']
    };
    
    $scope.Q5 = {
        "data": [$stateParams.Q5, (100 - $stateParams.Q5).toFixed(2)],
        "labels": ["Contribution"],
        "colors": [$stateParams.Q5 < 70 ? '#ff6a14' : '#90BCCF', '#DCDCDC']
    };
    
    $scope.Q6 = {
        "data": [$stateParams.Q6a, $stateParams.Q6b, $stateParams.Q6c],
        "labels": ["2", "3 - 4", "More than 5"],
        "colours": ['#1f77b4', '#ff7f0e', '#2ca02c']
    };
    
    $scope.Q7 = {
        "data": [$stateParams.Q7a, $stateParams.Q7b, $stateParams.Q7c, $stateParams.Q7d, $stateParams.Q7e],
        "labels": ["Toxic", "Could be better", "Neutral", "Pretty good", "We had fun!"],
        "colours": ['#1f77b4','#ff7f0e','#2ca02c','#1f77b4','#1f77b4']
    };
}])
      
.controller('loginCtrl', ['$scope', '$state', 'UserService', '$ionicLoading', '$ionicHistory', '$analytics', function ($scope, $state, UserService, $ionicLoading, $ionicHistory, $analytics) {
    document.addEventListener('deviceready', deviceReady, false);

    function deviceReady() {
        window.plugins.googleplus.trySilentLogin(
            {
              'scopes': 'profile email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar',
              'webClientId': '54415984672-5r7nn4rddo9j2sg6o9e8ddq0ec4j7ji8.apps.googleusercontent.com',
              'offline': true, 
            },
            function (user_data) {
                $scope.success(user_data);
            },
            function (msg) {
                //if(msg.includes("(com.google.GIDSignIn error -4.)")){
                //    $scope.login(); 
                //}
            }
        )
    }

    $scope.success = function(user_data){
        UserService.setUser({
            userID: user_data.userId,
            name: user_data.displayName,
            email: user_data.email,
            serverAuthCode: user_data.serverAuthCode,
            refreshToken: user_data.refreshToken,
            picture: user_data.imageUrl,
            accessToken: user_data.accessToken,
            idToken: user_data.idToken,
            expiredIn: Math.floor(Date.now() / 1000) + 3600,
            tokenType: "Bearer"
        });
        
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
    
        $state.go('meetings');
    }
    
    $scope.login = function() {
        window.plugins.googleplus.login(
            {
              'scopes': 'profile email https://www.googleapis.com/auth/calendar.readonly',
              'webClientId': '54415984672-5r7nn4rddo9j2sg6o9e8ddq0ec4j7ji8.apps.googleusercontent.com', 
              'offline': true, 
            },
            function (user_data) {
                $analytics.eventTrack('/login', { category: 'log', label: user_data.email + 'has logged in successfully' });
                $scope.success(user_data);
            },
            function (msg) {
              alert('error: ' + msg);
            }
        );
    };
}])
   
.controller('meetingsCtrl', ['$scope', '$stateParams', '$ionicHistory', 'UserService', '$state', 'GoogleCalendarAPI', 'Survey', '$ionicLoading', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams, $ionicHistory, UserService, $state, GoogleCalendarAPI, Survey, $ionicLoading) {
    $scope.loadData = function(){
        GoogleCalendarAPI.all().then(function(result){
            if(result.data && result.data.items){
                $scope.events = [];
                
                result.data.items.forEach(function(item){
                    var event = {};
                    event.event_id = item.id;
                    event.title = item.summary;
                    if(event.description){
                        event.description = item.description.replace(/@Survey/g,'');
                    } 
                    var startTime = new Date(item.start.dateTime);
                    var endTime = new Date(item.end.dateTime);
                    event.duration = Math.floor((endTime - startTime)/60000);
                    event.start = startTime.tohhmm();
                    var attendees = 0;
                    if(item.attendees){
                        item.attendees.forEach(function(attende){
                            if (attende.responseStatus.includes("tentative") ||  attende.responseStatus.includes("accepted")){
                                attendees++;
                            }
                        });
                        
                        event.attendees = attendees + "/" + item.attendees.length;
                    }else{
                        event.attendees = "1";
                    }

                    event.day = new Date(item.start.dateTime).getDay();
                    $scope.events.push(event);
                });
                
                $scope.events.reverse();
                $scope.$broadcast('scroll.refreshComplete');
            }
        }); 
    };
    
    $scope.loadEvent = function($index){
        $ionicLoading.show();
        var params = {
            event_id: $scope.events[$index].event_id
        };
        
        Survey.getEventsByEventId(params).then(function(resp){
            $ionicLoading.hide();
            if(resp.length && hasUserVoted(resp, UserService.getUser().email)){
                params = calculateResponse(resp);
                $state.go('result', params);
            }else{
                $state.go('feedback', params);  
            }
        });            
    };

    $scope.logout = function(){
        window.plugins.googleplus.logout(
            function (msg) {
                UserService.setUser({});
                
                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                
                $state.go('login');
            }
        );
    }
    
    function hasUserVoted(resp, email){
        if(resp && resp.length){
            for (var i = 0, len = resp.length; i < len; i++) {
                if(resp[i] && resp[i].user_email == email){
                    return true;
                }
            }
        }
        
        return false;
    }
    
    $ionicLoading.show();
    $scope.loadData();
    $ionicLoading.hide();
}])
 