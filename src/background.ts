import { getCalendar } from "./localStorage";
import {
  authenticate,
  createEvent,
  Event,
  deleteEvent,
  getEvents
} from "./googleApi";
import { encodeParams } from "./utils";

export type Action = "createEvent" | "deleteEvent" | "init";

export function setupHandler() {
  authenticate(true);
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (sender.tab && sender.tab.id) {
      onMessage(request, sender.tab.id, sendResponse);
    }
  });
}

async function onMessage(
  request:
    | { action: "init" }
    | { action: "createEvent" | "deleteEvent"; event: Event },
  tabId: number,
  _sendResponse?: Function
) {
  try {
    const calendarId = await getCalendar();
    if (calendarId) {
      if (request.action === "createEvent") {
        const event = await createEvent(calendarId, request.event);
        chrome.tabs.executeScript(tabId, {
          code: `UltimateQuebecCalendar.updateEvent(${encodeParams(event)})`
        });
      } else if (request.action === "deleteEvent") {
        const event = await deleteEvent(calendarId, request.event);
        chrome.tabs.executeScript(tabId, {
          code: `UltimateQuebecCalendar.updateEvent(${encodeParams(event)})`
        });
      } else if (request.action === "init") {
        chrome.pageAction.show(tabId);
        setPageAction(tabId, "calendar_ready.png");
        const events = await getEvents(calendarId);
        chrome.tabs.executeScript(tabId, {
          code: `UltimateQuebecCalendar.init(${encodeParams(
            calendarId,
            events
          )})`
        });
      }
    } else {
      showError(tabId, "No calendar selected");
    }
  } catch (error) {
    showError(tabId, error);
  }
}

function showError(tabId: number, error: any) {
  setPageAction(tabId, "calendar_error.png", error.toString());
  if (error == "Invalid Credentials") {
    authenticate().then(token => {
      chrome.identity.removeCachedAuthToken({ token });
    });
  }
}

function setPageAction(tabId: number, icon: string, title?: string) {
  chrome.pageAction.setIcon({
    tabId,
    path: `assets/${icon}`
  });
  chrome.pageAction.setTitle({
    tabId,
    title: `Ultimate Quebec Calendar${title != null ? " - " + title : ""}`
  });
}

setupHandler();
