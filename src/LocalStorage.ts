/// <reference path="./GoogleApi.ts"/>

module LocalStorage {
  export function getCalendar() {
    var calandar: string = localStorage.getItem('Calendar');
    if (calandar != null) {
      return Q.when(calandar);
    }
    return GoogleApi.createCalendar('Ultimate Québec Calendar')
      .then((calandar) => {
        setCalendar(calandar.id);
        return calandar.id;
      })
  }

  export function setCalendar(id: string) {
    localStorage.setItem('Calendar', id);
  }
}
