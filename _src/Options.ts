/// <reference path="./GoogleApi.ts"/>
/// <reference path="./LocalStorage.ts"/>

namespace UltimateQuebecCalendar {
  var main = <HTMLElement>document.querySelector(".main");

  function authenticated() {
    main.innerHTML = '';
    document.body.classList.add('Loading');
    LocalStorage.getCalendar()
      .then((selectedCalendar) => {
        return GoogleApi.getCalendars()
          .then<HTMLOptionElement[]>((calandars) => {
            return calandars.map((calendar) => {
              const option = document.createElement('option');
              option.defaultSelected = calendar.id == selectedCalendar;
              option.value = calendar.id;
              option.text = calendar.summary;
              return option;
            })
          })
      })
      .then((options) => {
        document.body.classList.remove('Loading');
        const title = document.createElement('h1');
        title.innerHTML = 'Select the calendar';
        main.appendChild(title);
        const calendar = document.createElement('select');
        options.forEach((option) => {
          calendar.appendChild(option);
        });
        main.appendChild(calendar);

        calendar.onchange = () => {
          document.body.classList.add('Loading');
          LocalStorage.setCalendar(calendar.value);
          chrome.tabs.query({ currentWindow: true, active: true, url: "http://www.ultimatequebec.ca/*" }, (tabs) => {
            if (tabs.length > 0) {
              GoogleApi.getEvents(calendar.value).then((events) => {
                document.body.classList.remove('Loading');
                chrome.tabs.executeScript(tabs[0].id, {
                  code: 'UltimateQuebecCalendar.init(' + JSON.stringify(calendar.value) + ',' + JSON.stringify(events) + ')'
                });
              })
              .catch((error)=>{
                  onError();
              })
            } else {
              document.body.classList.remove('Loading');
            }
          })
        };

        "http://www.ultimatequebec.ca/members/users/6y9k"
      })
      .catch((error)=>{
        onError();
      })
  }

  function onError(){
      GoogleApi.authenticate().then((token) => {
        chrome.identity.removeCachedAuthToken({ token: token });
      });
      notAuthenticated();
  }

  function notAuthenticated() {
    main.innerHTML = '';
    const error = document.createElement('h1');
    error.innerHTML = 'You are not authenticated';
    error.className = "Error";
    main.appendChild(error);
    const button = document.createElement('button');
    button.innerHTML = 'Login with Google';
    button.onclick = () => {
      document.body.classList.add('Loading');
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        document.body.classList.remove('Loading');
        if (token == null) {
          console.log(chrome.runtime.lastError);
        } else {
          authenticated();
        }
      });
    }
    main.appendChild(button);
  }

  chrome.identity.getAuthToken({ interactive: false }, (token) => {
    if (token == null) {
      notAuthenticated();
    } else {
      authenticated();
    }
  });
}
