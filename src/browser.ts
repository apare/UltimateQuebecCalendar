/// <reference path="./GoogleCalendarApi.d.ts"/>

module UltimateQuebecCalendar {

  var oneHour = 1000 * 60 * 60;
  var nextGameSelector = ".user-next-game, .next-games tbody tr";

  function eventUid(start: Date, location: string, field: string): string {
    return [start.toJSON(), location, field].join('|');
  }

  var eventsMap: { [uid: string]: GoogleApi.Event };
  export function load(events: GoogleApi.Event[]) {
    eventsMap = {};
    events.forEach((event) => {
      eventsMap[event.extendedProperties.shared['UQCalendar']] = event;
    })
    var buttons = document.querySelectorAll('.UQCalendar');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons.item(i);
      button.parentNode.removeChild(button);
    }
    var nextGames = document.querySelectorAll(nextGameSelector);
    for (var i = 0; i < nextGames.length; i++) {
      parseNextGame(nextGames.item(i), events);
    }
  }

  export function updateEvent(event: GoogleApi.Event, action: string) {
    var uid = event.extendedProperties.shared['UQCalendar'];
    var buttons = document.querySelectorAll('.UQCalendar[uid=' + JSON.stringify(uid) + ']');
    eventsMap[uid] = event;
    if (event.id == null) {
      for (var i = 0; i < buttons.length; i++) {
        initAddButton(buttons.item(i));
      }
    } else {
      for (var i = 0; i < buttons.length; i++) {
        initDeleteButton(buttons.item(i));
      }
    }
  }

  function initAddButton(button) {
    button.className = "UQCalendar btn btn-primary";
    button.innerHTML = '<div class="inner">Add to calendar</div>';
    button.onclick = function() {
      chrome.runtime.sendMessage({
        action: 'UQCalendar_Add',
        event: eventsMap[button.getAttribute('uid')]
      });
    }
  }

  function initDeleteButton(button) {
    button.className = "UQCalendar btn btn-error";
    button.innerHTML = '<div class="inner">Remove from calendar</div>';
    button.onclick = function() {
      chrome.runtime.sendMessage({
        action: 'UQCalendar_Remove',
        event: eventsMap[button.getAttribute('uid')]
      });
    }
  }

  function parseNextGame(dom, events) {
    var team1: string, team2: string, location: string, field: string;

    var button = document.createElement('div');
    button.className = "btn btn-primary";

    if (dom.tagName == "TR") {
      var teams = dom.querySelectorAll('.team');
      team1 = teams.item(0).innerText;
      team2 = teams.item(1).innerText;
      var fieldAndSide = dom.querySelector('td:last-child').innerText.split(', ');
      location = fieldAndSide[0];
      field = fieldAndSide[1];
      var td = document.createElement('td');
      td.appendChild(button);
      dom.appendChild(td);
    } else {
      team1 = dom.querySelector('.my-team a').innerHTML;
      team2 = dom.querySelector('.against-team a').innerHTML;
      var place = dom.querySelector('.game-place');
      location = place.innerHTML;
      field = place.nextElementSibling.innerHTML;
      dom.appendChild(button);
    }

    var date = new Date(dom.querySelector('time').getAttribute('datetime'));
    var summary = team1 + ' VS ' + team2 + "\n" + location + ', ' + field;
    var uid = eventUid(date, location, field);

    button.setAttribute('uid', uid);

    if (eventsMap[uid] == null) {
      eventsMap[uid] = <GoogleApi.Event>{
        id: null,
        start: { dateTime: date.toJSON() },
        end: { dateTime: new Date(date.getTime() + oneHour).toJSON() },
        extendedProperties: {
          shared: {
            UQCalendar: uid
          }
        },
        summary: summary,
        location: location
      }
      initAddButton(button);
    } else {
      initDeleteButton(button);
    }
  }
}
