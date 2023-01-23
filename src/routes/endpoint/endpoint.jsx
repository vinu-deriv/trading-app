import { configureEndpoint, getAppId, getSocketUrl } from "../../utils/config";
import { endpoint, setEndpoint } from "Stores/base-store";

import { createStore } from "solid-js/store";
import { onMount } from "solid-js";
import { Button } from "../../components/button";

const Endpoint = () => {
  const [form_fields, setFormFields] = createStore();

  onMount(() => {
    setFormFields({ app_id: getAppId(), server: getSocketUrl() });
    configureEndpoint(getAppId(), getSocketUrl());
  });

  const onFormSubmit = (e) => {
    e.preventDefault();

    setEndpoint({
      app_id: form_fields.app_id,
      server_url: form_fields.server,
    });

    localStorage.setItem("config.app_id", endpoint.app_id);
    localStorage.setItem("config.server_url", endpoint.server_url);
    configureEndpoint(form_fields.app_id, form_fields.server);
    window.location.href = "/";
  };

  const onFormReset = () => {
    // TODO: change to prod app_id
    localStorage.removeItem("config.app_id");
    localStorage.removeItem("config.server_url");
    configureEndpoint(getAppId(), getSocketUrl());
    window.location.href = "/";
  };

  return (
    <div class="endpoint">
      <label>Change API endpoint</label>
      <form onSubmit={onFormSubmit}>
        <div>
          <input
            type="text"
            name="server"
            onInput={(e) => {
              setFormFields({ server: e.target.value });
            }}
            value={form_fields.server}
            placeholder="Server"
            required
          />
        </div>
        <div>
          <input
            type="text"
            name="app_id"
            onInput={(e) => {
              setFormFields({ app_id: e.target.value });
            }}
            value={form_fields.app_id}
            placeholder="App ID"
            required
          />
        </div>
        <div>
          <Button
            type="flat"
            onClick={() => {
              onFormSubmit;
            }}
          >
            Submit
          </Button>
          <Button type="tertiary" onClick={onFormReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Endpoint;
