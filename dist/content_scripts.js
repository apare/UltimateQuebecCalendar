/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/content_scripts.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/content_scripts.scss":
/*!**********************************!*\
  !*** ./src/content_scripts.scss ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

throw new Error("Module parse failed: Unexpected token (1:0)\nYou may need an appropriate loader to handle this file type.\n> .btn.UQCalendar {\n|   display: block;\n|   white-space: normal;");

/***/ }),

/***/ "./src/content_scripts.tsx":
/*!*********************************!*\
  !*** ./src/content_scripts.tsx ***!
  \*********************************/
/*! exports provided: init, updateEvent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "updateEvent", function() { return updateEvent; });
/* harmony import */ var _content_scripts_scss__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./content_scripts.scss */ "./src/content_scripts.scss");
/* harmony import */ var _content_scripts_scss__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_content_scripts_scss__WEBPACK_IMPORTED_MODULE_0__);

const oneHour = 1000 * 60 * 60;
const gameInfoSelector = ".user-next-game, .next-games tbody tr";
let calendarId;
let eventsMap;
function querySelector(query, parent = document) {
    return parent.querySelector(query);
}
function querySelectorAll(query, parent = document) {
    return parent.querySelectorAll(query);
}
function init(calendar, events) {
    calendarId = calendar;
    eventsMap = {};
    const buttons = querySelectorAll(".UQCalendar,.UQCalendarTd");
    // Remove all buttons
    buttons.forEach(button => {
        button.parentNode && button.parentNode.removeChild(button);
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
function eventUid(start, location, field) {
    return [start.toJSON(), location, field].join("|");
}
/**
 * Update button after updating an event
 * @param event
 */
function updateEvent(event) {
    const uid = event.extendedProperties.shared.Uid;
    const buttons = querySelectorAll(".UQCalendar[uid=" + JSON.stringify(uid) + "]");
    eventsMap[uid] = event;
    // if the the event id is set, this mean the event exist
    // if the event exist, use the delete button, otherwise use the add button
    buttons.forEach(event.id === undefined ? setupAddButton : setupDeleteButton);
}
function setupAddButton(button) {
    const uid = button.getAttribute("uid");
    button.className = "UQCalendar btn btn-primary";
    button.innerHTML = '<div class="inner">Add to calendar</div>';
    button.onclick = function () {
        chrome.runtime.sendMessage({
            action: "createEvent",
            calendarId,
            eventsMap: eventsMap[uid]
        });
    };
}
function setupDeleteButton(button) {
    const uid = button.getAttribute("uid");
    button.className = "UQCalendar btn btn-error";
    button.innerHTML = '<div class="inner">Remove from calendar</div>';
    button.onclick = function () {
        chrome.runtime.sendMessage({
            action: "deleteEvent",
            calendarId,
            eventsMap: eventsMap[uid]
        });
    };
}
function parseGame(dom) {
    let team1;
    let team2;
    let location;
    let field;
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
    }
    else {
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
    const date = new Date(timeDom.getAttribute("datetime"));
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
    }
    else {
        setupDeleteButton(button);
    }
}
chrome.runtime.sendMessage({
    action: "init"
});


/***/ })

/******/ });
//# sourceMappingURL=content_scripts.js.map