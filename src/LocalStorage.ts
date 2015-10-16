/// <reference path="./GoogleApi.ts"/>

module LocalStorage {
  export function getCalendar() {
    var calandar: string = localStorage.getItem('Calendar');
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
