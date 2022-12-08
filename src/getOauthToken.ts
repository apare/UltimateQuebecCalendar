let oauthToken: Promise<string> | undefined;

export function getOauthToken() {
  if (!oauthToken) {
    oauthToken = new Promise<string>((resolve, reject) => {
      try {
        chrome.identity.getAuthToken({}, resolve);
      } catch (e) {
        console.log("getAuthToken without interactive mode failed", e);
        try {
          chrome.identity.getAuthToken({ interactive: true }, resolve);
        } catch (e) {
          console.log("getAuthToken with interactive mode failed", e);
          reject(e);
        }
      }
    });
  }
  return oauthToken;
}
