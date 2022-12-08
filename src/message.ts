import { Event } from "./googleApi";

export interface GetEventsMessageResponse {
  events: Event[];
}

export interface CreateEventResponse {
  eventId: string;
}

export interface ErrorMessage {
  type: "error";
  payload: {
    error: unknown;
  };
}

export type BackgroundMessage =
  | CreateEventMessage
  | DeleteEventMessage
  | GetEventsMessage;

export type CreateEventMessage = {
  type: "createEvent";
  payload: {
    id: string;
    location: string;
    summary: string;
    start: string;
    end: string;
  };
};

export type DeleteEventMessage = {
  type: "deleteEvent";
  payload: {
    eventId: string;
  };
};

export interface GetEventsMessage {
  type: "getEvents";
}
