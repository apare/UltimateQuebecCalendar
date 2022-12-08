export type Event = {
  id: string;
};

export interface GetEventsMessageResponse {
  events: { id: string; ultimateQuebecId: string }[];
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
    description: string;
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
