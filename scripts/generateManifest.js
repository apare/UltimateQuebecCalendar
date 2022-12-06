const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const { CLIENT_ID } = process.env;

const manifest = {
  manifest_version: 3,

  name: "Ultimate Quebec Calendar",
  version: "3.4",
  icons: {
    16: "icon16.png",
    48: "icon48.png",
    128: "icon128.png",
  },

  options_ui: {
    page: "options.html",
  },

  action: {
    default_title: "Ultimate Quebec Calendar",
    default_icon: "icon.png",
    default_popup: "popup.html",
  },

  content_scripts: [
    {
      matches: ["https://www.ultimatequebec.ca/*"],
      js: ["js/vendor.js", "js/content_script.js"],
      run_at: "document_end",
    },
  ],

  background: {
    service_worker: "js/background.js",
  },

  permissions: [
    "storage",
    "activeTab",
    "tabs",
    "identity",
    "webNavigation",
    "https://www.googleapis.com/*",
    "https://www.ultimatequebec.ca/*",
  ],
  oauth2: {
    client_id: CLIENT_ID,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  },
};

fs.writeFileSync(
  path.resolve(__dirname, "../public/", "manifest.json"),
  JSON.stringify(manifest, null, "  ")
);
