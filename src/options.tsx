import { google } from "googleapis";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Options } from "./getOptions";
import waitGif from "./assets/wait.gif";

type Calendar = { id: string; summary: string };

const calendar = google.calendar({ version: "v3" });

const Options = () => {
  const [options, setOptions] = useState<Options>();
  const [authToken, setAuthToken] = useState<string>();
  const [authError, setAuthError] = useState<unknown>();
  const [calendars, setCalendars] = useState<Calendar[]>();

  useEffect(() => {
    try {
      chrome.identity.getAuthToken({}, setAuthToken);
    } catch (e) {
      console.log("getAuthToken without interactive mode failed", e);
      try {
        chrome.identity.getAuthToken({ interactive: true }, setAuthToken);
      } catch (e) {
        console.log("getAuthToken with interactive mode failed", e);
        setAuthError(e);
      }
    }
  });

  useEffect(() => {
    if (authToken) {
      calendar.calendarList.list({ oauth_token: authToken }, (e, calendars) => {
        setCalendars(
          calendars?.data.items?.map(
            ({ id, summary }) => ({ id, summary } as Calendar)
          )
        );
      });
    }
  }, []);

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

  const retryLogin = useCallback(() => {
    setAuthError(undefined);
    try {
      chrome.identity.getAuthToken({ interactive: true }, setAuthToken);
    } catch (e) {
      console.log("getAuthToken with interactive mode failed", e);
      setAuthError(e);
    }
  }, []);

  if (authError) {
    return <button onClick={retryLogin}>Retry</button>;
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
