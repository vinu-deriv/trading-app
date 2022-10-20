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

const connection = new WebSocket(
  `wss://${getSocketUrl()}/websockets/v3?l=EN&app_id=${getAppId()}`
);

const derivApi = new DerivAPIBasic({ connection });

const authorize = (authorizeToken) => derivApi.authorize(authorizeToken);

const subscribe = (request, cb) =>
  derivApi.subscribe(request).subscribe(cb, cb);

const sendRequest = (request) => derivApi.send(request);

export { authorize, sendRequest, subscribe };
