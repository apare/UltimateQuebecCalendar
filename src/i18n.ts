import * as dateLocales from "date-fns/locale";

const browserLanguage = navigator.language;

const en = {
  deleteFromCalendar: "Delete from calendar",
  addToCalendar: "Add to calendar",
  unauthenticated: "You are not authenticated",
  authenticate: "Login with Google",
  selectedCalendar: "Selected calendar:",
  upcomingEvents: "Upcoming events",
  noUpcomingEvents: "No upcoming events",
  buyMeACoffee: "Buy Me A Coffee",
  dateLocale: dateLocales.enCA
};
const fr: typeof en = {
  deleteFromCalendar: "Supprimer du calendrier",
  addToCalendar: "Ajouter au calendrier",
  unauthenticated: "Vous n'êtes pas authentifié",
  authenticate: "Se connecter avec Google",
  selectedCalendar: "calendrier sélectionné:",
  upcomingEvents: "Évènements à venir",
  noUpcomingEvents: "Aucun événement à venir",
  buyMeACoffee: "Achetez-moi un café",
  dateLocale: dateLocales.fr
};

const isFr = browserLanguage.match(/^fr/);

const i18n = isFr ? fr : en;

export default i18n;
