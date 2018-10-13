import * as React from "react";
import { render } from "react-dom";
import {
  getCalendars,
  getEvents,
  authenticate,
  Calendar,
  Event
} from "./googleApi";
import { getCalendar, setCalendar } from "./localStorage";
import { encodeParams } from "./utils";
import i18n from "./i18n";

import "./page_action.scss";

interface State {
  loading: boolean;
  authenticated: boolean;
  selectedCalendar?: string;
  calendars?: Calendar[];
  events?: Event[];
  error?: string;
}

class PageAction extends React.PureComponent<{}, State> {
  state: State = {
    loading: true,
    authenticated: false
  };

  componentDidMount() {
    this.authenticate(false);
  }

  authenticate = (interactive: boolean) => {
    this.setState({ loading: true }, () => {
      chrome.identity.getAuthToken({ interactive }, async token => {
        const authenticated = token != null;
        if (authenticate) {
          const selectedCalendar = await getCalendar();
          const calendars = await getCalendars();
          const events = await getEvents(selectedCalendar);
          this.setState({
            loading: false,
            authenticated,
            selectedCalendar,
            calendars,
            events,
            error: undefined
          });
        } else {
          this.setState({
            loading: false,
            authenticated,
            error: chrome.runtime.lastError && chrome.runtime.lastError.message
          });
        }
      });
    });
  };

  onChangeCalendar = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const calendar = event.target.value;
    this.setState(
      {
        loading: true
      },
      async () => {
        setCalendar(calendar);
        const events = await getEvents(calendar);
        this.setState({
          events,
          loading: false
        });
        chrome.tabs.query(
          {
            currentWindow: true,
            active: true,
            url: "http://www.ultimatequebec.ca/*"
          },
          tabs => {
            tabs.forEach(tab => {
              if (tab.id) {
                chrome.tabs.executeScript(tab.id, {
                  code: `UltimateQuebecCalendar.init(${encodeParams(
                    calendar,
                    events
                  )})`
                });
              }
            });
          }
        );
      }
    );
  };

  buildError() {
    if (this.state.error) {
      return <div className="notification is-danger">{this.state.error}</div>;
    }
    return null;
  }

  render() {
    if (this.state.loading) {
      return <div className="loading" />;
    }
    if (!this.state.authenticated || !this.state.calendars) {
      return (
        <div className="unauthenticated">
          <div>{i18n.unauthenticated}</div>
          <button className="button" onClick={() => this.authenticate(true)}>
            {i18n.authenticate}
          </button>
          {this.buildError()}
        </div>
      );
    }
    return (
      <div>
        <div className="select">
          <select
            onChange={this.onChangeCalendar}
            value={this.state.selectedCalendar}
          >
            {this.state.calendars.map(calendar => {
              return <option value={calendar.id}>{calendar.summary}</option>;
            })}
          </select>
        </div>
      </div>
    );
  }
}

render(<PageAction />, document.querySelector(".main"));
