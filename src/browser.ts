import {
  CreateEventMessage,
  CreateEventResponse,
  DeleteEventMessage,
  GetEventsMessageResponse,
} from "./message";

const gameLength = 1000 * 60 * 75;
const gameSelector = ".user-next-game, .next-games tbody tr";

let eventsMap: { [uid: string]: string };

function eventUid(start: Date, location: string, field: string): string {
  return [start.toJSON(), location, field].join("|");
}

function setupAddButton(
  button: HTMLElement,
  payload: CreateEventMessage["payload"]
) {
  button.className = "UQCalendar btn btn-primary";
  button.innerHTML = '<div class="inner">Add to calendar</div>';
  button.onclick = async function () {
    const { eventId }: CreateEventResponse = await chrome.runtime.sendMessage({
      type: "createEvent",
      payload,
    } as CreateEventMessage);
    eventsMap[payload.id] = eventId;
    setupDeleteButton(button, eventId, payload);
  };
}

function setupDeleteButton(
  button: HTMLElement,
  eventId: string,
  payload: CreateEventMessage["payload"]
) {
  button.className = "UQCalendar btn btn-error";
  button.innerHTML = '<div class="inner">Remove from calendar</div>';
  button.onclick = async function () {
    await chrome.runtime.sendMessage({
      type: "deleteEvent",
      payload: { eventId },
    } as DeleteEventMessage);
    setupAddButton(button, payload);
  };
}

function parseGame(dom: HTMLElement) {
  let team1: string, team2: string, location: string, field: string;

  const button = document.createElement("div");
  button.className = "btn btn-primary";

  const strDate = assert(
    dom.querySelector<HTMLElement>("time")?.getAttribute("datetime")
  );

  if (dom.tagName == "TR") {
    const teams = dom.querySelectorAll<HTMLElement>(".team");
    team1 = teams.item(0).innerText;
    team2 = teams.item(1).innerText;
    const fieldAndSide = assert(
      dom.querySelector<HTMLElement>("td:last-child")?.innerText
    ).split(", ");
    location = fieldAndSide[0];
    field = fieldAndSide[1];
    const td = document.createElement("td");
    td.className = "UQCalendarTd";
    td.appendChild(button);
    dom.appendChild(td);
  } else {
    team1 = assert(dom.querySelector<HTMLElement>(".my-team a")).innerHTML;
    team2 = assert(dom.querySelector<HTMLElement>(".against-team a")).innerHTML;
    const place = assert(dom.querySelector<HTMLElement>(".game-place"));
    location = place.innerHTML;
    field = assert(place.nextElementSibling).innerHTML;
    dom.appendChild(button);
  }

  const date = new Date(strDate);
  const summary = team1 + " VS " + team2;
  const description = team1 + " VS " + team2 + "\n" + location + ", " + field;

  const uid = eventUid(date, location, field);

  button.setAttribute("uid", uid);

  const payload = {
    start: date.toJSON(),
    end: new Date(date.getTime() + gameLength).toJSON(),
    id: uid,
    description,
    summary,
    location,
  };

  if (!eventsMap[uid]) {
    setupAddButton(button, payload);
  } else {
    setupDeleteButton(button, eventsMap[uid], payload);
  }
}

async function updateEvents() {
  const { events }: GetEventsMessageResponse = await chrome.runtime.sendMessage(
    {
      type: "getEvents",
    }
  );
  const buttons = document.querySelectorAll<HTMLElement>(
    ".UQCalendar,.UQCalendarTd"
  );
  for (const button of buttons) {
    button.parentNode?.removeChild(button);
  }
  events.forEach((event) => {
    eventsMap[event.ultimateQuebecId] = event.id;
  });
  const games = document.querySelectorAll<HTMLElement>(gameSelector);
  for (let i = 0; i < games.length; i++) {
    parseGame(games.item(i));
  }
}

function assert<T>(value: T | undefined | null): T {
  if (value === undefined || value === null)
    throw `value should not be undefined`;
  return value;
}

void updateEvents();
