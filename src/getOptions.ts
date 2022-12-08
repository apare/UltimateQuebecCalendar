export interface Options {
  calendarId?: string;
}

let options: Options = {};

chrome.storage.sync.get("options", (data) => {
  options = data.options as Options;
});

export function getCalendarId() {
  if (!options.calendarId) {
    throw "no calendar set yet";
  }
  return options.calendarId;
}
