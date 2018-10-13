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
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/background.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/background.ts":
/*!***************************!*\
  !*** ./src/background.ts ***!
  \***************************/
/*! exports provided: setupHandler */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setupHandler", function() { return setupHandler; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _localStorage__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./localStorage */ "./src/localStorage.ts");
/* harmony import */ var _googleApi__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./googleApi */ "./src/googleApi.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");




function setupHandler() {
    Object(_googleApi__WEBPACK_IMPORTED_MODULE_2__["authenticate"])(true);
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (sender.tab && sender.tab.id) {
            onMessage(request, sender.tab.id, sendResponse);
        }
    });
}
function onMessage(request, tabId, _sendResponse) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
        try {
            const calendarId = yield Object(_localStorage__WEBPACK_IMPORTED_MODULE_1__["getCalendar"])();
            if (calendarId) {
                if (request.action === "createEvent") {
                    const event = yield Object(_googleApi__WEBPACK_IMPORTED_MODULE_2__["createEvent"])(calendarId, request.event);
                    chrome.tabs.executeScript(tabId, {
                        code: `UltimateQuebecCalendar.updateEvent(${Object(_utils__WEBPACK_IMPORTED_MODULE_3__["encodeParams"])(event)})`
                    });
                }
                else if (request.action === "deleteEvent") {
                    const event = yield Object(_googleApi__WEBPACK_IMPORTED_MODULE_2__["deleteEvent"])(calendarId, request.event);
                    chrome.tabs.executeScript(tabId, {
                        code: `UltimateQuebecCalendar.updateEvent(${Object(_utils__WEBPACK_IMPORTED_MODULE_3__["encodeParams"])(event)})`
                    });
                }
                else if (request.action === "init") {
                    chrome.pageAction.show(tabId);
                    setPageAction(tabId, "calendar_ready.png");
                    const events = yield Object(_googleApi__WEBPACK_IMPORTED_MODULE_2__["getEvents"])(calendarId);
                    chrome.tabs.executeScript(tabId, {
                        code: `UltimateQuebecCalendar.init(${Object(_utils__WEBPACK_IMPORTED_MODULE_3__["encodeParams"])(calendarId, events)})`
                    });
                }
            }
            else {
                showError(tabId, "No calendar selected");
            }
        }
        catch (error) {
            showError(tabId, error);
        }
    });
}
function showError(tabId, error) {
    setPageAction(tabId, "calendar_error.png", error.toString());
    if (error == "Invalid Credentials") {
        Object(_googleApi__WEBPACK_IMPORTED_MODULE_2__["authenticate"])().then(token => {
            chrome.identity.removeCachedAuthToken({ token });
        });
    }
}
function setPageAction(tabId, icon, title) {
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


/***/ }),

/***/ "./src/googleApi.ts":
/*!**************************!*\
  !*** ./src/googleApi.ts ***!
  \**************************/
/*! exports provided: accessToken, getCalendars, createCalendar, getEvents, createEvent, deleteEvent, authenticate */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "accessToken", function() { return accessToken; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCalendars", function() { return getCalendars; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createCalendar", function() { return createCalendar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getEvents", function() { return getEvents; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createEvent", function() { return createEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "deleteEvent", function() { return deleteEvent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "authenticate", function() { return authenticate; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! axios */ "axios");
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_1__);


var accessToken;
function call(method, url, params, data) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
        const token = yield authenticate();
        if (params == null) {
            params = {};
        }
        params["access_token"] = token;
        const response = yield axios__WEBPACK_IMPORTED_MODULE_1___default()({ method, url, params, data });
        if (response.status >= 200 && response.status < 300) {
            return response.data;
        }
        else {
            throw response.data;
        }
    });
}
function getCalendars() {
    return call("GET", "calendar/v3/users/me/calendarList", {
        fields: "items(id,summary)"
    }).then(({ items }) => items);
}
function createCalendar(calendarSummary) {
    return call("POST", "calendar/v3/calendars", undefined, {
        summary: calendarSummary
    });
}
function getEvents(calendarId) {
    return call("GET", "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events", {
        maxResults: 2500,
        fields: "items(id, summary, extendedProperties/shared, location, start, end)",
        sharedExtendedProperty: "UQCalendar=3"
    }).then(({ items }) => items);
}
function createEvent(calendarId, event) {
    return call("POST", "calendar/v3/calendars/" + encodeURIComponent(calendarId) + "/events", {
        fields: "id, summary, extendedProperties/shared, location, start, end"
    }, event);
}
function deleteEvent(calendarId, event) {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
        if (event.id) {
            yield call("DELETE", "calendar/v3/calendars/" +
                encodeURIComponent(calendarId) +
                "/events/" +
                encodeURIComponent(event.id));
            event.id = undefined;
        }
        return event;
    });
}
function authenticate(prompt = false) {
    return new Promise((resolve, reject) => {
        try {
            chrome.identity.getAuthToken({ interactive: prompt }, token => {
                if (token == null) {
                    if (chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError.message);
                    }
                    reject("Something went wrong");
                }
                else {
                    resolve(token);
                }
            });
        }
        catch (e) {
            reject(e);
        }
    });
}


/***/ }),

/***/ "./src/localStorage.ts":
/*!*****************************!*\
  !*** ./src/localStorage.ts ***!
  \*****************************/
/*! exports provided: getCalendar, setCalendar */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getCalendar", function() { return getCalendar; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCalendar", function() { return setCalendar; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "tslib");
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(tslib__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _googleApi__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./googleApi */ "./src/googleApi.ts");


function getCalendar() {
    return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function* () {
        var calendar = localStorage.getItem("Calendar");
        if (calendar) {
            return calendar;
        }
        const calendars = yield Object(_googleApi__WEBPACK_IMPORTED_MODULE_1__["getCalendars"])();
        if (calendars.length > 0) {
            setCalendar(calendars[0].id);
            return calendars[0].id;
        }
        return null;
    });
}
function setCalendar(id) {
    localStorage.setItem("Calendar", id);
}


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/*! exports provided: encodeParams */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "encodeParams", function() { return encodeParams; });
function encodeParams(...params) {
    return params.map(value => JSON.stringify(value)).join(",");
}


/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "tslib":
/*!************************!*\
  !*** external "tslib" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("tslib");

/***/ })

/******/ });
//# sourceMappingURL=background.js.map