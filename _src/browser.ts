/// <reference path="./GoogleApi.ts"/>
/// <reference path="./LocalStorage.ts"/>

namespace UltimateQuebecCalendar {
  interface EventDef {
    id: string;
    calendar: string;
  }

  var oneHour = 1000 * 60 * 60;
  var nextGameSelector = ".user-next-game, .next-games tbody tr";

  var calandarId: string;
  var eventsMap: { [uid: string]: GoogleApi.Event };

  export function init(calandar: string, events: GoogleApi.Event[]) {
    calandarId = calandar;
    eventsMap = {};
    const buttons = document.querySelectorAll(".UQCalendar,.UQCalendarTd");
    for (var i = 0; i < buttons.length; i++) {
      const button = buttons.item(i);
      button.parentNode.removeChild(button);
    }
    events.forEach(event => {
      eventsMap[event.extendedProperties.shared.Uid] = event;
    });
    const games = document.querySelectorAll(nextGameSelector);
    for (var i = 0; i < games.length; i++) {
      parseGame(games.item(i));
    }
  }

  function eventUid(start: Date, location: string, field: string): string {
    return [start.toJSON(), location, field].join("|");
  }

  export function updateEvent(event: GoogleApi.Event) {
    const uid = event.extendedProperties.shared.Uid;
    const buttons = document.querySelectorAll(
      ".UQCalendar[uid=" + JSON.stringify(uid) + "]"
    );
    eventsMap[uid] = event;
    if (event.id == null) {
      for (var i = 0; i < buttons.length; i++) {
        setupAddButton(buttons.item(i));
      }
    } else {
      for (var i = 0; i < buttons.length; i++) {
        setupDeleteButton(buttons.item(i));
      }
    }
  }

  function setupAddButton(button) {
    button.className = "UQCalendar btn btn-primary";
    button.innerHTML = '<div class="inner">Add to calendar</div>';
    button.onclick = function() {
      chrome.runtime.sendMessage({
        action: "createEvent",
        calandarId: calandarId,
        event: eventsMap[button.getAttribute("uid")]
      });
    };
  }

  function setupDeleteButton(button) {
    button.className = "UQCalendar btn btn-error";
    button.innerHTML = '<div class="inner">Remove from calendar</div>';
    button.onclick = function() {
      chrome.runtime.sendMessage({
        action: "deleteEvent",
        calandarId: calandarId,
        event: eventsMap[button.getAttribute("uid")]
      });
    };
  }

  function parseGame(dom) {
    let team1: string, team2: string, location: string, field: string;

    const button = document.createElement("div");
    button.className = "btn btn-primary";

    if (dom.tagName == "TR") {
      const teams = dom.querySelectorAll(".team");
      team1 = teams.item(0).innerText;
      team2 = teams.item(1).innerText;
      const fieldAndSide = dom
        .querySelector("td:last-child")
        .innerText.split(", ");
      location = fieldAndSide[0];
      field = fieldAndSide[1];
      const td = document.createElement("td");
      td.className = "UQCalendarTd";
      td.appendChild(button);
      dom.appendChild(td);
    } else {
      team1 = dom.querySelector(".my-team a").innerHTML;
      team2 = dom.querySelector(".against-team a").innerHTML;
      const place = dom.querySelector(".game-place");
      location = place.innerHTML;
      field = place.nextElementSibling.innerHTML;
      dom.appendChild(button);
    }

    const date = new Date(dom.querySelector("time").getAttribute("datetime"));
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
        summary: summary,
        location: location
      };
    }
    if (eventsMap[uid].id == null) {
      setupAddButton(button);
    } else {
      setupDeleteButton(button);
    }
  }
}

chrome.runtime.sendMessage({
  action: "init"
});
