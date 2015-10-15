/// <reference path="./q.d.ts"/>
/// <reference path="./chrome.d.ts"/>
/// <reference path="./GoogleApi.ts"/>
/// <reference path="./LocalStorage.ts"/>

module Background {
  export function setupHandler() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => { onMessage(request, sender.tab.id, sendResponse); });
  }

  function onMessage(request: { action: string, calandarId: string, event?: GoogleApi.Event }, tabId: number, sendResponse: Function) {
    if (request.action == 'createEvent' || request.action == 'deleteEvent') {
      GoogleApi[request.action == 'createEvent' ? 'createEvent' : 'deleteEvent'](request.calandarId, request.event)
        .then((event: GoogleApi.Event) => {
          chrome.tabs.executeScript(tabId, {
            code: 'UltimateQuebecCalendar.updateEvent(' + JSON.stringify(event) + ')'
          });
        })
        .catch(errorHandler(tabId));
    }
    if (request.action == 'init') {
      chrome.pageAction.show(tabId);

      GoogleApi.authenticate(true)
        .then(() => {
          return LocalStorage.getCalendar()
        })
        .then((calendar) => {
          setPageAction(tabId, 'calendar_ready.png');
          return GoogleApi.getEvents(calendar).then((events) => {
            chrome.tabs.executeScript(tabId, {
              code: 'UltimateQuebecCalendar.init(' + JSON.stringify(calendar) + ',' + JSON.stringify(events) + ')'
            });
          });
        })
        .catch(errorHandler(tabId));
    }
  }

  function errorHandler(tabId: number) {
    return (error) => {
      setPageAction(tabId, 'calendar_error.png', error.toString());
      if (error == "Invalid Credentials") {
        GoogleApi.authenticate().then((token) => {
          chrome.identity.removeCachedAuthToken({ token: token }, () => {
            GoogleApi.authenticate(true)
              .then((token) => {
                chrome.tabs.reload(tabId);
              }, errorHandler(tabId))
          })
        })
      }
    }
  }

  function setPageAction(tabId: number, icon: string, title?: string) {
    chrome.pageAction.setIcon({
      tabId: tabId,
      path: "assets/" + icon
    });
    chrome.pageAction.setTitle({
      tabId: tabId,
      title: "Ultimate Quebec Calendar" + (title != null ? ' - ' + title : '')
    });
  }
}

Background.setupHandler();
