import { createStore } from "solid-js/store";
import { endpoint, setEndpoint } from "Stores/base-store";

const Endpoint = () => {
  const [form_fields, setFormFields] = createStore();

  const onFormSubmit = (e) => {
    e.preventDefault();

    setEndpoint({
      app_id: form_fields.app_id,
      server_url: form_fields.server,
    });

    localStorage.setItem("config.app_id", endpoint.app_id);
    localStorage.setItem("config.server_url", endpoint.server_url);
    window.location.href = "/";
  };

  const onFormReset = () => {
    // TODO: change to prod app_id
    setEndpoint({ app_id: "", server_url: "" });

    localStorage.setItem("config.app_id", endpoint.app_id);
    localStorage.setItem("config.server_url", endpoint.server_url);
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
            placeholder="App ID"
            required
          />
        </div>
        <div>
          <button type="submit">Submit</button>
          <button type="button" onClick={onFormReset}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default Endpoint;
