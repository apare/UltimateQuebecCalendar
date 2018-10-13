import { getCalendars } from "./googleApi";

export async function getCalendar() {
  var calendar = localStorage.getItem("Calendar");
  if (calendar) {
    return calendar;
  }

  const [calendars] = await getCalendars();
  return calendars.id;
}

export function setCalendar(id: string) {
  localStorage.setItem("Calendar", id);
}
