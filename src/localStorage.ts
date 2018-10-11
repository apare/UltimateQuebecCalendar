import { getCalendars } from "./googleApi";

export async function getCalendar() {
  var calandar: string = localStorage.getItem("Calendar");
  if (calandar != null) {
    return calandar;
  }
  const calandars = await getCalendars();
  if (calandars.length > 0) {
    setCalendar(calandars[0].id);
    return calandars[0].id;
  }
  return null;
}

export function setCalendar(id: string) {
  localStorage.setItem("Calendar", id);
}
