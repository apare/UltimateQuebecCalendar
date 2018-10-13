<p style="text-align:center;" >
    <a href="https://www.ultimatequebec.ca/">
        <img src="./assets/logo.png" />
    </a>
</p>

# Ultimate Québec Calendar

**The easiest way to manage your ultimate frisbee games**

This is the code of the [Ultimate Quebec Calendar Chrome Extension](https://chrome.google.com/webstore/detail/ultimate-quebec-calendar/aeolcjgccondkdodekaofgbkipkepame) that provide an easy way to add your ultimate frisbee game from the site [ultimatequebec.ca](http://ultimatequebec.ca).

## How to install

If you want to install right from the [Chrome Web Store](https://chrome.google.com/webstore/detail/ultimate-quebec-calendar/aeolcjgccondkdodekaofgbkipkepame)

## How to build your custom extension

You will require [Node](https://nodejs.org/en/), [Typescript](http://www.typescriptlang.org/), [Webpack](https://webpack.js.org/), [yarn](https://yarnpkg.com/) to be installed if you want to build your custom extension.

### Build

```bash
yarn build
```

### Setup

Start by installing all dependency

```bash
yarn
```

Copy the file `manifest.template.json` to `manifest.json` and insert your Google Api Client id.

#### Create a project

If you do not have any google Developers project, you can create one at [Google Developers Console](https://console.developers.google.com)

#### Enabled Calendar API

In the [Google Developers Console](https://console.developers.google.com) go to :

1. `APIs & auth > APIs`
2. `Google Apps APIs > Calendar API`
3. `Enabled Api`

#### Get Client Id

In the [Google Developers Console](https://console.developers.google.com) go to :

1. `APIs & auth > Credentials`
   - To create an `OAuth client ID`, you must first set a product name on the `OAuth consent screen`
2. `Credentials > Add credentials > OAuth 2.0 client ID`
3. Select `Chrome App`
4. Write any `Name` you want
5. Write you `Application ID`
   - You can found this id in the [Extensions panel](chrome://extensions/) when you add your extension
6. Copy the client_id and paste it in the `manifest.json` to replace `INSERT_CLIENT_ID`
