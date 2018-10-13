import axios from "axios";

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

export var accessToken: string;

async function call<T>(
  method: string,
  url: string,
  params?: { [key: string]: any },
  data?: { [key: string]: any }
) {
  const token = await authenticate();

  if (params == null) {
    params = {};
  }
  params["access_token"] = token;
  const response = await axios({ method, url, params, data });
  if (response.status >= 200 && response.status < 300) {
    return response.data as T;
  } else {
    throw response.data;
  }
}

export function getCalendars() {
  return call<CalendarList>("GET", "calendar/v3/users/me/calendarList", {
    fields: "items(id,summary)"
  }).then(({ items }) => items);
}

export function createCalendar(calendarSummary: string) {
  return call<Calendar>("POST", "calendar/v3/calendars", undefined, {
    summary: calendarSummary
  });
}

export function getEvents(calendarId: string) {
  return call<EventList>(
    "GET",
    "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events",
    {
      maxResults: 2500,
      fields:
        "items(id, summary, extendedProperties/shared, location, start, end)",
      sharedExtendedProperty: "UQCalendar=3"
    }
  ).then(({ items }) => items);
}

export function createEvent(calendarId: string, event: Event) {
  return call<Event>(
    "POST",
    "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events",
    {
      fields: "id, summary, extendedProperties/shared, location, start, end"
    },
    event
  );
}

export async function deleteEvent(calendarId: string, event: Event) {
  if (event.id) {
    await call(
      "DELETE",
      "calendar/v3/calendars/" +
        encodeURIComponent(calendarId) +
        "/events/" +
        encodeURIComponent(event.id)
    );
    event.id = undefined;
  }
  return event;
}

export function authenticate(prompt = false) {
  return new Promise<string>((resolve, reject) => {
    try {
      chrome.identity.getAuthToken({ interactive: prompt }, token => {
        if (token == null) {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message);
          }
          reject("Something went wrong");
        } else {
          resolve(token);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
