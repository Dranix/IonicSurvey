angular.module('app.services', [])
.service('UserService', function() {
  var setUser = function(user_data) {
    window.localStorage.starter_google_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_google_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})

.service('Survey', ['$q', '$http', function($q, $http) {
    var api_url = 'https://sheetsu.com/apis/v1.0/9fb72270cdd1';

    var ret = {
        all: function() {
            return $http.get(api_url).then(function(resp) {
                return resp;
            });

        },
        add: function(data) {
            return $http.post(api_url, data).then(function(resp) {
                return resp.data;
            });
        },
        getFeedbacksByEventId: function(params) {
            var actual_params = [];
            for (var k in params) {
                if (params[k]) {
                    actual_params.push(k + '=' + params[k]);
                }
            }
            actual_params = '?' + actual_params.join('&');
            return $http.get(api_url + '/search/' + actual_params).then(function(resp) {
                return resp.data;
            }, function(resp) {
                return {};
            });
        }
    };

    return ret;

}])

.service('GoogleCalendarAPI', ['$q', '$http', 'UserService', function($q, $http, UserService, EventsModel){
    var CLIENT_ID = "54415984672-mk6u0pf61td2rfhi9hovvdmje7gl3ono.apps.googleusercontent.com";
    var CLIENT_SECRET = "Sl6o64jRLc8q1p6HGviJ7Hat";
    var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar"];
    var API_URL = "https://www.googleapis.com/calendar/v3/calendars/" + UserService.getUser().email+ "/events";
    var REFESH_TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";
            
    var ret = {
        getEventsWithSurveyTag: function(){
            var currentTime = Math.floor(Date.now() / 1000);
            
            //Refresh token if necessary
            if(currentTime > UserService.getUser().expiredIn){
                var tokenRequestConfig = {
                    params:{
                        'refresh_token': UserService.getUser().refreshToken,
                        'client_id': CLIENT_ID,	
                        'client_secret': CLIENT_SECRET,	
                        'grant_type': "Bearer"
                    }
                };
                
                $http.post(REFESH_TOKEN_URL, tokenRequestConfig).then(function(resp){
                    UserService.setUser({
                        accessToken: resp.access_token,
                        expiredIn: Math.floor(Date.now() / 1000) + resp.expires_in
                    });
                    
                    return getEvents();
                });
            }
            
            return getEvents();
        }
    };

    return ret;
    
    function getEvents(){
        var oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        var oneWeekAhead = new Date();
        oneWeekAhead.setDate(oneWeekAhead.getDate() + 7);
            
        var config = {
            headers:  {
                'Authorization': 'Bearer ' + UserService.getUser().accessToken
            },
            params: {
                'calendarId': 'primary',
                'maxResults': 30,
                'orderBy': 'startTime',
                'singleEvents': true,
                'showDeleted': false,
                'timeMin': oneWeekAgo.toISOString(),
                'timeMax': oneWeekAhead.toISOString()
            }
        };
    
        return $http.get(API_URL, config).then(function(resp){
            return processEvents(resp);
        });
    }
    
    function processEvents(resp){
        var events = [];
        
        if(resp.data && resp.data.items){
            resp.data.items.forEach(function(item){
                var event = {};
                if(item.description && !item.description.includes("@Survey")){
                    return;
                }else if(item.description){
                    event.description = item.description.replace(/@Survey/g,'');
                }
                
                event.event_id = item.id;
                event.title = item.summary;

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
                events.push(event);
            });
            
            events.reverse();
        }
        
        return events;
    }
}])
