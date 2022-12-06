import React from "react";
import ReactDOM from "react-dom";

const Options = () => {
  /*
  const [options, setOptions] = useState<unknown>();
  const [status, setStatus] = useState<string>();

  useEffect(() => {
    // Restores select box and checkbox state using the preferences
    // stored in chrome.storage.
    chrome.storage.sync.get("options", (options) => {
      setOptions(options);
    });
  }, []);

  const saveOptions = useCallback(() => {
    // Saves options to chrome.storage.sync.
    chrome.storage.sync.set(
      {
        options,
      },
      () => {
        // Update status to let user know options were saved.
        setStatus("Options saved.");
        setTimeout(() => {
          setStatus("");
        }, 1000);
      }
    );
  }, [options]);
  */

  return <div>options</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <Options />
  </React.StrictMode>,
  document.getElementById("root")
);
