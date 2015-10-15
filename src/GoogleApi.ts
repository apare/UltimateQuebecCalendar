/// <reference path="./Ajax.ts"/>

module GoogleApi {

  export interface Calendar {
    id: string;
    summary: string;
  }

  export interface CalendarList {
    items: Calendar[];
  }

  export interface Start {
    dateTime: string;
  }

  export interface End {
    dateTime: string;
  }

  export interface Properties {
    [key: string]: string;
  }

  export interface ExtendedProperties {
    private?: Properties;
    shared?: Properties;
  }

  export interface EventExtendedProperties {
    shared: EventExtendedPropertiesShared;
  }

  export interface EventExtendedPropertiesShared {
    UQCalendar: string;
    Uid: string;
  }

  export interface Event {
    id?: string;
    summary: string;
    extendedProperties: EventExtendedProperties;
    location?: string;
    start: Start;
    end: End;
  }

  export interface EventList {
    items: Event[];
  }

  var rest: Rest = new Rest('https://www.googleapis.com/');
  export var accessToken: string;

  function call<T>(methode: string, url: string, queryString?: { [key: string]: any }, data?: { [key: string]: any }) {
    return authenticate()
      .then((token) => {
        if (queryString == null) {
          queryString = {};
        }
        queryString['access_token'] = token;
        return rest.call<T>(methode, url, queryString, data)
      })
  }

  export function getCalendars() {
    return call('GET', 'calendar/v3/users/me/calendarList', {
      fields: "items(id,summary)"
    }).get<Calendar[]>('items')
  }

  export function createCalendar(calendarSummary: string) {
    return call<Calendar>('POST', 'calendar/v3/calendars', null, {
      "summary": calendarSummary,
    });
  }

  export function getEvents(calandarId: string) {
    return call<EventList>('GET', 'calendar/v3/calendars/' + encodeURIComponent(calandarId) + '/events', {
      maxResults: 2500,
      fields: "items(id, summary, extendedProperties/shared, location, start, end)",
      sharedExtendedProperty: "UQCalendar=3"
    }).get<Event[]>('items')
  }

  export function createEvent(calandarId: string, event: GoogleApi.Event) {
    return call<GoogleApi.Event>('POST', 'calendar/v3/calendars/' + encodeURIComponent(calandarId) + '/events', {
      fields: "id, summary, extendedProperties/shared, location, start, end"
    }, <any>event);
  }

  export function deleteEvent(calandarId: string, event: Event) {
    return call('DELETE', 'calendar/v3/calendars/' + encodeURIComponent(calandarId) + '/events/' + encodeURIComponent(event.id)).then(() => {
      event.id = null;
      return event;
    })
  }

  export function authenticate(prompt = false) {
    var deferred = Q.defer<string>();
    chrome.identity.getAuthToken({ interactive: prompt }, (token) => {
      if (token == null) {
        deferred.reject(chrome.runtime.lastError.message);
      } else {
        deferred.resolve(token);
      }
    });
    return deferred.promise;
  }
}
