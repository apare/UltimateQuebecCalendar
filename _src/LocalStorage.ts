/// <reference path="./GoogleApi.ts"/>

namespace LocalStorage {
  export function getCalendar() {
    const calandar: string = localStorage.getItem('Calendar');
    if (calandar != null) {
      return Q.when(calandar);
    }
    return GoogleApi.getCalendars()
      .then((calandars) => {
        setCalendar(calandars[0].id);
        return calandars[0].id;
      })
  }

  export function setCalendar(id: string) {
    localStorage.setItem('Calendar', id);
  }
}
