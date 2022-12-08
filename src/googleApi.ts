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
  ultimateQuebecVersion: string;
  ultimateQuebecId: string;
}

export interface Event {
  id: string;
  summary: string;
  extendedProperties: EventExtendedProperties;
  location?: string;
  start: Start;
  end: End;
}

export interface EventList {
  items: Event[];
}

const GOOGLE_API_URL = "https://www.googleapis.com/";

export let accessToken: string;

async function call<T, B = undefined>(
  method: string,
  url: string,
  queryString: Record<string, string> = {},
  body?: B
) {
  const token = await authenticate();
  queryString["access_token"] = token;
  const params = new URLSearchParams(queryString);
  const response = await fetch(`${GOOGLE_API_URL}${url}?${params.toString()}`, {
    method,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw response.text();
  }
  return response.json() as Promise<T>;
}

export async function getCalendars() {
  const { items } = await call<{ items: Calendar[] }>(
    "GET",
    "calendar/v3/users/me/calendarList",
    {
      fields: "items(id,summary)",
    }
  );
  return items;
}

export function createCalendar(calendarSummary: string) {
  return call<Calendar, { summary: string }>(
    "POST",
    "calendar/v3/calendars",
    {},
    {
      summary: calendarSummary,
    }
  );
}

export async function getEvents(calendarId: string) {
  const { items } = await call<EventList>(
    "GET",
    "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events",
    {
      maxResults: "2500",
      fields:
        "items(id, summary, extendedProperties/shared, location, start, end)",
      sharedExtendedProperty: "UQCalendar=3",
    }
  );
  return items;
}

export function createEvent(calendarId: string, event: Omit<Event, "id">) {
  return call<Event, Omit<Event, "id">>(
    "POST",
    "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events",
    {
      fields: "id, summary, extendedProperties/shared, location, start, end",
    },
    event
  );
}

export async function deleteEvent(calendarId: string, eventId: string) {
  await call(
    "DELETE",
    "calendar/v3/calendars/" +
      encodeURIComponent(calendarId) +
      "/events/" +
      encodeURIComponent(eventId)
  );
}

export function authenticate(prompt = false) {
  return new Promise<string>((resolve, reject) => {
    try {
      chrome.identity.getAuthToken({ interactive: prompt }, (token) => {
        if (token == null) {
          reject(chrome.runtime.lastError?.message);
        } else {
          resolve(token);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}
