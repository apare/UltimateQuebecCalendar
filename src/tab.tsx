import { Event } from "./googleApi";
import "./tab.scss";

const oneHour = 1000 * 60 * 60;

const gameInfoSelector = ".user-next-game, .next-games tbody tr";

let calendarId: string;
let eventsMap: { [uid: string]: Event };

function querySelector(query: string, parent: ParentNode = document) {
  return parent.querySelector(query) as HTMLElement;
}

function querySelectorAll(query: string, parent: ParentNode = document) {
  return parent.querySelectorAll<HTMLElement>(query);
}

export function init(calendar: string, events: Event[]) {
  calendarId = calendar;
  eventsMap = {};

  const buttons = querySelectorAll(".UQCalendar");
  const cells = querySelectorAll(".UQCalendarTd");

  // Remove all buttons
  buttons.forEach(button => {
    button.parentNode && button.parentNode.removeChild(button);
  });

  // Remove all cells
  cells.forEach(cell => {
    cell.parentNode && cell.parentNode.removeChild(cell);
  });

  // Map event by uid
  events.forEach(event => {
    eventsMap[event.extendedProperties.shared.Uid] = event;
  });

  // find all games info
  const games = querySelectorAll(gameInfoSelector);
  games.forEach(game => {
    // add button to them
    parseGame(game);
  });
}

/**
 * generate an unique id from date, location and field
 * @param start Game Start date
 * @param location Location of the game
 * @param field Field information
 */
function eventUid(start: Date, location: string, field: string): string {
  return [start.toJSON(), location, field].join("|");
}

/**
 * Update button after updating an event
 * @param event
 */
export function updateEvent(event: Event) {
  const uid = event.extendedProperties.shared.Uid;
  const buttons = querySelectorAll(
    ".UQCalendar[uid=" + JSON.stringify(uid) + "]"
  );
  eventsMap[uid] = event;
  // if the the event id is set, this mean the event exist
  // if the event exist, use the delete button, otherwise use the add button
  buttons.forEach(event.id === undefined ? setupAddButton : setupDeleteButton);
}

function setupAddButton(button: HTMLElement) {
  const uid = button.getAttribute("uid") as string;
  button.className = "UQCalendar btn btn-primary";
  button.innerHTML = '<div class="inner">Add to calendar</div>';
  button.onclick = function() {
    chrome.runtime.sendMessage({
      action: "createEvent",
      calendarId,
      eventsMap: eventsMap[uid]
    });
  };
}

function setupDeleteButton(button: HTMLElement) {
  const uid = button.getAttribute("uid") as string;
  button.className = "UQCalendar btn btn-error";
  button.innerHTML = '<div class="inner">Remove from calendar</div>';
  button.onclick = function() {
    chrome.runtime.sendMessage({
      action: "deleteEvent",
      calendarId,
      eventsMap: eventsMap[uid]
    });
  };
}

function parseGame(dom: HTMLElement) {
  let team1: string;
  let team2: string;
  let location: string;
  let field: string;

  const button = document.createElement("div");
  button.className = "btn btn-primary";

  if (dom.tagName == "TR") {
    /**
     *  <tr>
     *    <th><span class="team">Team A</span><span> vs </span> <span class="team"><a href="/members/teams/team-b">Team B</a></span></th>
     *    <td><time datetime="2018-10-14T17:30:00-04:00">14 octobre 2018, 17:30</time></td>
     *    <td>Location, Field</td>
     *  </tr>
     */

    const teams = querySelectorAll(".team", dom);

    const [team1Dom, team2Dom] = teams;

    team1 = team1Dom.innerText;
    team2 = team2Dom.innerText;

    const fieldAndSide = querySelector("td:last-child", dom).innerText;
    [location, field] = fieldAndSide.split(", ");

    const td = document.createElement("td");
    td.className = "UQCalendarTd";
    td.appendChild(button);
    dom.appendChild(td);
  } else {
    /**
     * <div class="user-next-game"><time datetime="2018-10-14 17:30:00 -0400"><span>14</span><span>oct.</span></time>
        <div class="next-game-infos">
          <span>
            <span class="my-team"><a href="/members/teams/team-a">Team A</a></span>
            vs
            <span class="against-team"><a href="/members/teams/team-b">Team B</a></span>
          </span>
          <span class="game-time">17:30</span>
          <span class="game-place">Location</span>
          <span class="game-field">Field</span>
        </div>
      </div>
     */
    team1 = querySelector(".my-team a", dom).innerHTML;
    team2 = querySelector(".against-team a", dom).innerHTML;
    location = querySelector(".game-place", dom).innerText;
    field = querySelector(".game-field", dom).innerText;
    dom.appendChild(button);
  }

  const timeDom = querySelector("time", dom);
  const date = new Date(timeDom.getAttribute("datetime") as string);
  const summary = team1 + " VS " + team2 + "\n" + location + ", " + field;
  const uid = eventUid(date, location, field);

  button.setAttribute("uid", uid);

  if (eventsMap[uid] == null) {
    eventsMap[uid] = {
      start: { dateTime: date.toJSON() },
      end: { dateTime: new Date(date.getTime() + oneHour).toJSON() },
      extendedProperties: {
        shared: {
          UQCalendar: "3",
          Uid: uid
        }
      },
      summary,
      location
    };
  }

  if (eventsMap[uid].id == null) {
    setupAddButton(button);
  } else {
    setupDeleteButton(button);
  }
}

chrome.runtime.sendMessage({
  action: "init"
});
