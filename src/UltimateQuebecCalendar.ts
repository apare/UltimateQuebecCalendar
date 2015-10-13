/// <reference path="./q.d.ts"/>
/// <reference path="./chrome.d.ts"/>
/// <reference path="./GoogleCalendarApi.d.ts"/>

module UltimateQuebecCalendar {
  var Id = 'UQCalendar';
  var calendarSummary = 'Ultimate Québec Calendar';

  function encodeQueryString(data) {
    var ret = [];
    for (var d in data)
      ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
    return ret.join("&");
  }

  function setupHandler() {
    chrome.runtime.onMessage.addListener((request: { action: string, event: GoogleApi.Event }, sender: chrome.runtime.MessageSender, sendResponse) => {
      var actionPromise: Q.Promise<GoogleApi.Event>;
      if (request.action == Id + '_Add') {
        actionPromise = createEvent(request.event);
      } else if (request.action == Id + '_Remove') {
        actionPromise = deleteEvent(request.event);
      }
      if (actionPromise != null) {
        setPageAction(sender.tab.id, 'calendar_loading.png', 'Loading');
        actionPromise.then((event) => {
          setPageAction(sender.tab.id, 'calendar_ready.png', 'Ready');
          chrome.tabs.executeScript(sender.tab.id, {
            code: 'UltimateQuebecCalendar.updateEvent(' + JSON.stringify(event) + ');'
          });
        }, (error) => {
          if (error == "Invalid Credentials") {
            getAuthToken().then((token) => {
              chrome.identity.removeCachedAuthToken({ token: token }, () => {
                authToken = null;
              })
            })
          }
          setPageAction(sender.tab.id, 'calendar_error.png', error.toString());
          chrome.tabs.executeScript(sender.tab.id, {
            code: 'UltimateQuebecCalendar.load([])'
          });
        })
      }
    });

    chrome.webNavigation.onCompleted.addListener((details) => {
      if (details.url.indexOf('http://www.ultimatequebec.ca/') == 0) {
        console.profile();
        tabCompleted(details.tabId);
      }
    });
    chrome.pageAction.onClicked.addListener(function(tab) {
      if (tabs.indexOf(tab.id) == -1) {
        initTab(tab.id);
      }
    });
  }

  var tabs: number[] = [];
  function tabCompleted(tabId: number) {
    chrome.pageAction.show(tabId);
    chrome.tabs.insertCSS(tabId, {
      file: 'style.css'
    })
    chrome.tabs.executeScript(tabId, {
      file: 'bin/browser.js'
    }, () => {
      initTab(tabId);
    })
  }

  function initTab(tabId: number) {
    if (tabs.indexOf(tabId) == -1) {
      tabs.push(tabId);
      setPageAction(tabId, 'calendar_loading.png', 'Loading');
      getEvents()
        .then((events) => {
          setPageAction(tabId, 'calendar_ready.png', 'Ready');
          chrome.tabs.executeScript(tabId, {
            code: 'UltimateQuebecCalendar.load(' + JSON.stringify(events) + ')'
          });
          tabs.splice(tabs.indexOf(tabId), 1);
        }, (error) => {
          if (error == "Invalid Credentials") {
            getAuthToken().then((token) => {
              chrome.identity.removeCachedAuthToken({ token: token }, () => {
                authToken = null;
              })
            })
          }
          setPageAction(tabId, 'calendar_error.png', error);
          chrome.tabs.executeScript(tabId, {
            code: 'UltimateQuebecCalendar.load([])'
          });
          tabs.splice(tabs.indexOf(tabId), 1);
        });
    }
  }

  function setPageAction(tabId: number, icon: string, title: string) {
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: "assets/" + icon
    });
    chrome.pageAction.setTitle({
      tabId: tabId,
      title: "Ultimate Quebec Calendar - " + title
    });
  }

  var authToken: Q.Promise<string>;
  function getAuthToken() {
    console.log('getAuthToken');
    if (authToken == null) {
      var deferred = Q.defer<string>();
      authToken = deferred.promise;
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (token == null) {
          authToken = null;
          console.log(chrome.runtime.lastError.message);
          deferred.reject('Authentification Failed');
        } else {
          deferred.resolve(token);
        }
      });
    }
    return authToken;
  }

  function googleApis<T>(methode: string, url: string, queryParams?: { [key: string]: any }, data?: { [key: string]: any }) {
    var deferred = Q.defer<T>();
    getAuthToken().then((accessToken) => {
      var request = new XMLHttpRequest();
      var queryString = {
        access_token: accessToken
      }
      if (queryParams != null) {
        var keys = Object.keys(queryParams);
        keys.forEach(key => {
          queryString[key] = queryParams[key];
        });
      }
      request.open(methode, 'https://www.googleapis.com/' + url + '?' + encodeQueryString(queryString));

      request.onload = function() {
        var response: any;
        try {
          response = JSON.parse(request.response);
        } catch (e) {
          response = request.response;
        }
        if (request.status < 200 || request.status >= 300) {
          deferred.reject(response.error.message);
        } else {
          deferred.resolve(response);
        }
      };
      if (data == null) {
        request.send();
      } else {
        request.setRequestHeader('Content-Type', 'application/json')
        request.send(JSON.stringify(data));
      }
    }, (error) => {
      deferred.reject(error)
    });
    return deferred.promise;
  }

  function getCalendar() {
    console.log('getCalendar');
    var deferred = Q.defer<GoogleApi.Calendar>();
    googleApis('GET', 'calendar/v3/users/me/calendarList', {
      fields: "items(id,summary)"
    }).then((calendarList: GoogleApi.CalendarList) => {
      var calendar: GoogleApi.Calendar;
      for (var i = 0; i < calendarList.items.length; i++) {
        var item = calendarList.items[i];
        if (item.summary == calendarSummary) {
          calendar = item;
          break;
        }
      }
      if (calendar == null) {
        createCalendar().then(deferred.resolve)
      } else {
        deferred.resolve(calendar);
      }
    }, (error) => {
      deferred.reject(error)
    });
    return deferred.promise;
  }

  function createCalendar() {
    console.log('createCalendar');
    return googleApis<GoogleApi.Calendar>('POST', 'calendar/v3/calendars', {
      "summary": calendarSummary
    });
  }

  function getEvents() {
    console.log('getEvents');
    return getCalendar()
      .then((calandar) => {
        return googleApis<GoogleApi.EventList>('GET', 'calendar/v3/calendars/' + encodeURIComponent(calandar.id) + '/events', {
          maxResults: 2500,
          fields: "items(id, summary, extendedProperties/shared, location, start, end)"
        }).get<GoogleApi.Event[]>('items')
      })
  }

  function createEvent(event: GoogleApi.Event) {
    console.log('createEvent');
    return getCalendar()
      .then((calandar) => {
        return googleApis<GoogleApi.Event>('POST', 'calendar/v3/calendars/' + encodeURIComponent(calandar.id) + '/events', {
          fields: "id, summary, extendedProperties/shared, location, start, end"
        }, event);
      });
  }

  function deleteEvent(event: GoogleApi.Event) {
    console.log('deleteEvent');
    return getCalendar()
      .then((calandar) => {
        return googleApis('DELETE', 'calendar/v3/calendars/' + encodeURIComponent(calandar.id) + '/events/' + encodeURIComponent(event.id), null)
      }).then(() => {
        event.id = null;
        return event;
      })
  }

  setupHandler();
}
