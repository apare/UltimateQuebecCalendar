declare module GoogleApi {

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

  export interface Event {
    id: string;
    summary: string;
    extendedProperties?: ExtendedProperties;
    location?: string;
    start: Start;
    end: End;
  }

  export interface EventList {
    items: Event[];
  }
}
