import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic";

const getSocketUrl = () => {
  const server_url =
    localStorage.getItem("config.server_url") ?? "green.binaryws.com";

  return server_url;
};

const getAppId = () => {
  // TODO: change production app id
  const app_id = localStorage.getItem("config.app_id") ?? "";

  return app_id;
};

const createConnection = () =>
  new WebSocket(
    `wss://${getSocketUrl()}/websockets/v3?l=EN&app_id=${getAppId()}`
  );

let connection = createConnection();
let derivApi = new DerivAPIBasic({ connection });

const authorize = (authorizeToken) => derivApi.authorize(authorizeToken);

const subscribe = (request, cb) =>
  derivApi.subscribe(request).subscribe(cb, cb);

const sendRequest = (request) => derivApi.send(request);

let ping_timer = null;

function pingWebsocket() {
  clearTimeout(ping_timer);
  ping_timer = setInterval(() => {
    derivApi.send({
      ping: 1,
    });
  }, 30000);
}

let reconnect_timeout = null;

function reconnectAfter({ timeout }) {
  clearTimeout(reconnect_timeout);
  reconnect_timeout = setTimeout(() => {
    reconnect_timeout = null;
    if ("onLine" in navigator && [2, 3].includes(connection.readyState)) {
      connection.close();
      connection = createConnection();
      derivApi = new DerivAPIBasic({ connection });
      pingWebsocket();
    } else {
      derivApi.send({ ping: 1 }); // get stable status sooner
    }
  }, timeout);
}

export { authorize, sendRequest, subscribe, reconnectAfter, pingWebsocket };
