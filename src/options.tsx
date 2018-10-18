import * as React from "react";
import { render } from "react-dom";
import {
  getCalendars,
  getEvents,
  Calendar,
  Event,
  authenticate,
  deleteEvent
} from "./googleApi";
import { getCalendar, setCalendar } from "./localStorage";
import { encodeParams } from "./utils";
import i18n from "./i18n";
import { formatRelative, isAfter } from "date-fns";

import Edit from "./svg/edit.svg";
import Map from "./svg/map.svg";
import Trash from "./svg/trash.svg";
import SpinnerThird from "./svg/spinner-third.svg";
import Coffee from "./svg/coffee.svg";

import "./options.scss";

interface State {
  authenticating: boolean;
  authenticated: boolean;
  selectedCalendar?: string;
  calendars?: Calendar[];
  events?: Event[];
  error?: string;
}

class DeleteButton extends React.PureComponent<
  { onClick: () => void },
  { deleting: boolean }
> {
  state = { deleting: false };

  render() {
    return (
      <a onClick={() => this.setState({ deleting: true }, this.props.onClick)}>
        {this.state.deleting ? <SpinnerThird /> : <Trash />}
      </a>
    );
  }
}

class PageAction extends React.PureComponent<{}, State> {
  state: State = {
    authenticating: true,
    authenticated: false
  };

  componentDidMount() {
    this.authenticate(false);
  }

  authenticate = (interactive: boolean) => {
    this.setState({ authenticating: true }, () => {
      authenticate(interactive)
        .then(async () => {
          const selectedCalendar = await getCalendar();
          const calendars = await getCalendars();
          const events = await getEvents(selectedCalendar);

          this.setState({
            authenticating: false,
            authenticated: true,
            selectedCalendar,
            calendars,
            events,
            error: undefined
          });
        })
        .catch(error => {
          this.setState({
            authenticating: false,
            authenticated: false,
            error
          });
        });
    });
  };

  onChangeCalendar = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const calendar = event.target.value;
    setCalendar(calendar);
    this.setState({ selectedCalendar: calendar });
    this.refreshEvents();
  };

  refreshEvents = () => {
    if (this.state.selectedCalendar) {
      getEvents(this.state.selectedCalendar).then(events => {
        this.setState({
          events
        });
        chrome.tabs.query(
          {
            currentWindow: true,
            active: true,
            url: "https://www.ultimatequebec.ca/*"
          },
          tabs => {
            tabs.forEach(tab => {
              if (tab.id) {
                chrome.tabs.executeScript(tab.id, {
                  code: `UltimateQuebecCalendar.init(${encodeParams(
                    this.state.selectedCalendar,
                    events
                  )})`
                });
              }
            });
          }
        );
      });
    }
  };

  buildError() {
    if (this.state.error) {
      return <p className="notification is-error">{this.state.error}</p>;
    }
    return null;
  }

  buildEvent = (event: Event) => {
    const [title, ...summaryLines] = event.summary.split(/\n/g);
    return (
      <div className="event" key={event.id}>
        <div className="title">{title}</div>
        <div className="summary">
          {summaryLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
        <time dateTime={event.start.dateTime}>
          {formatRelative(event.start.dateTime, new Date(), {
            locale: i18n.dateLocale
          })}
        </time>
        <div className="actions">
          <a
            href={`https://maps.google.com/?q=${event.location}`}
            target="_blank"
          >
            <Map />
          </a>
          <a href={event.htmlLink} target="_blank">
            <Edit />
          </a>
          <DeleteButton
            onClick={() => {
              deleteEvent(this.state.selectedCalendar as string, event).then(
                () => this.refreshEvents()
              );
            }}
          />
        </div>
      </div>
    );
  };

  render() {
    if (this.state.authenticating) {
      return <SpinnerThird />;
    }
    if (!this.state.authenticated || !this.state.calendars) {
      return (
        <div className="unauthenticated">
          <h3>{i18n.unauthenticated}</h3>
          <button onClick={() => this.authenticate(true)}>
            {i18n.authenticate}
          </button>
          {this.buildError()}
        </div>
      );
    }
    const events = this.state.events
      ? this.state.events.filter(({ start: { dateTime } }) =>
          isAfter(dateTime, new Date())
        )
      : [];
    return (
      <div className="content">
        <h3>{i18n.selectedCalendar}</h3>
        <select
          onChange={this.onChangeCalendar}
          value={this.state.selectedCalendar}
        >
          {this.state.calendars &&
            this.state.calendars.map(calendar => {
              return (
                <option key={calendar.id} value={calendar.id}>
                  {calendar.summary}
                </option>
              );
            })}
        </select>
        <h3>{i18n.upcomingEvents}</h3>
        <div className="events">
          {events.length > 0 ? (
            events.map(this.buildEvent)
          ) : (
            <div className="empty">{i18n.noUpcomingEvents}</div>
          )}
        </div>
        <div className="buyMeACoffee">
          <a href="https://www.buymeacoffee.com/apare" target="_blank">
            <Coffee />
            <span>{i18n.buyMeACoffee}</span>
          </a>
        </div>
      </div>
    );
  }
}

render(<PageAction />, document.getElementById("main"));
