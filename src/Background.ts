import {
  BackgroundMessage,
  CreateEventResponse,
  ErrorMessage,
  GetEventsMessageResponse,
} from "./message";
import { getCalendarId } from "./getOptions";
import { getOauthToken } from "./getOauthToken";
import { google } from "googleapis";

const calendar = google.calendar({ version: "v3" });

async function processMessage(request: BackgroundMessage) {
  switch (request.type) {
    case "createEvent": {
      const { id, location, summary, description, start, end } =
        request.payload;
      const {
        data: { id: eventId },
      } = await calendar.events.insert({
        oauth_token: await getOauthToken(),
        calendarId: getCalendarId(),
        requestBody: {
          location,
          summary,
          description,
          extendedProperties: {
            shared: {
              ultimateQuebecCalendar: "0.1",
              ultimateQuebecId: id,
            },
          },
          start: { dateTime: start },
          end: { dateTime: end },
        },
      });
      return {
        eventId,
      } as CreateEventResponse;
    }
    case "deleteEvent": {
      const { eventId } = request.payload;
      await calendar.events.delete({
        oauth_token: await getOauthToken(),
        calendarId: getCalendarId(),
        eventId,
      });
      break;
    }
    case "getEvents": {
      const events = await calendar.events.list({
        oauth_token: await getOauthToken(),
        calendarId: getCalendarId(),
      });
      return {
        events:
          events.data.items
            ?.map(({ id, extendedProperties }) => ({
              ultimateQuebecId: extendedProperties?.shared?.ultimateQuebecId,
              id,
            }))
            .filter(
              (event): event is { id: string; ultimateQuebecId: string } =>
                !!event.id && !!event.ultimateQuebecId
            ) || [],
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
