import {
  BackgroundMessage,
  CreateEventResponse,
  ErrorMessage,
  GetEventsMessageResponse,
} from "./message";
import { getCalendarId } from "./getOptions";
import { createEvent, deleteEvent, getEvents } from "./googleApi";

async function processMessage(request: BackgroundMessage) {
  switch (request.type) {
    case "createEvent": {
      const { id, location, summary, start, end } = request.payload;
      const { id: eventId } = await createEvent(getCalendarId(), {
        location,
        summary,
        extendedProperties: {
          shared: {
            ultimateQuebecVersion: "0.1",
            ultimateQuebecId: id,
          },
        },
        start: { dateTime: start },
        end: { dateTime: end },
      });
      return {
        eventId,
      } as CreateEventResponse;
    }
    case "deleteEvent": {
      const { eventId } = request.payload;
      await deleteEvent(getCalendarId(), eventId);
      break;
    }
    case "getEvents": {
      const events = await getEvents(getCalendarId());
      return {
        events: events.filter(
          (event) =>
            !!event.extendedProperties?.shared?.ultimateQuebecId &&
            event.extendedProperties?.shared?.ultimateQuebecVersion === "0.1"
        ),
      } as GetEventsMessageResponse;
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  processMessage(request as BackgroundMessage).then(
    sendResponse,
    (error: unknown) => {
      sendResponse({
        type: "error",
        payload: { error },
      } as ErrorMessage);
    }
  );
});
