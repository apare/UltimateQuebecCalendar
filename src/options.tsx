import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Options } from "./getOptions";
import waitGif from "./assets/wait.gif";
import { Calendar, getCalendars } from "./googleApi";
import ReactDOM from "react-dom";

const Options = () => {
  const [options, setOptions] = useState<Options>();
  const [authToken, setAuthToken] = useState<string>();
  const [authError, setAuthError] = useState<unknown>();
  const [calendars, setCalendars] = useState<Calendar[]>();

  const login = useCallback(() => {
    try {
      chrome.identity.getAuthToken({ interactive: true }, setAuthToken);
    } catch (e) {
      console.log("getAuthToken failed", e);
      setAuthError(e);
    }
  }, []);

  useEffect(() => {
    try {
      chrome.identity.getAuthToken({}, setAuthToken);
    } catch (e) {
      console.log("getAuthToken failed", e);
      setAuthError(e);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      void getCalendars().then((calendars) => {
        setCalendars(calendars);
      });
    } else {
      setCalendars([]);
    }
  }, [authToken]);

  useEffect(() => {
    chrome.storage.sync.get(["options"], ({ options }) => {
      setOptions(options as Options);
    });
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "sync") {
        const optionsChange = changes["options"];
        if (optionsChange) {
          setOptions(optionsChange.newValue as Options);
        }
      }
    });
  }, []);

  const onChangeCalendar = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      void chrome.storage.sync.set({
        options: { ...options, calendarId: e.target.value } as Options,
      });
    },
    [options]
  );

  if (authError) {
    return <button onClick={login}>Retry</button>;
  }

  if (!authToken) {
    return <img src={waitGif} />;
  }

  return (
    <div>
      <div>
        <label>Select the calendar</label>
        <select value={options?.calendarId} onChange={onChangeCalendar}>
          {calendars?.map(({ id, summary }) => (
            <option selected={id === options?.calendarId} value={id} key={id}>
              {summary}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById("root")
);
