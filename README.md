<p align="center">
<img src="https://raw.githubusercontent.com/apare/UltimateQuebecCalendar/master/assets/AJJUQ.jpg" />
# Ultimate Québec Calendar
**The easiest way to manage your ultimate frisbee games**

This is the code of the [Ultimate Quebec Calendar Chrome Extension](https://chrome.google.com/webstore/detail/ultimate-quebec-calendar/aeolcjgccondkdodekaofgbkipkepame) that provide an easy way to add your ultimate frisbee game form the site [ultimatequebec.ca](http://ultimatequebec.ca).

## How to install
If you want to install right form the [Chrome Web Store](https://chrome.google.com/webstore/detail/ultimate-quebec-calendar/aeolcjgccondkdodekaofgbkipkepame)

## How to build your custom extension
You will require [Node](https://nodejs.org/en/) and [Typescript](http://www.typescriptlang.org/) to be installed if you want to build your custom extension.

### Build
This `tsconfig.json` file allowed you to buid the project by using
```
$ tsc --project
```

### Setup
In the file `manifest.json` you will see this line :
```
"client_id" : "INSERT_CLIENT_ID",
```
The `client_id` is a Google Api Client id.

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
    * To create an `OAuth client ID`, you must first set a product name on the `OAuth consent screen`
2. `Credentials > Add credentials > OAuth 2.0 client ID`
3. Select `Chrome App`
4. Write any `Name` you want
5. Write you `Application ID`
    * You can found this id in the [Extensions panel](chrome://extensions/) when you add your extension
6. Copy the client_id and paste it in the `manifest.json` to replace `INSERT_CLIENT_ID`
