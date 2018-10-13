const browserLanguage = navigator.language;

const en = {
  unauthenticated: "You are not authenticated",
  authenticate: "Login with Google"
};
const fr: typeof en = {
  unauthenticated: "Vous n'êtes pas authentifié",
  authenticate: "Se connecter avec Google"
};

const i18n = browserLanguage.match(/^fr/) ? fr : en;
export default i18n;
