import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic";

const connection = new WebSocket(
  "wss://frontend.binaryws.com/websockets/v3?l=EN&app_id=1234"
);
const derivApi = new DerivAPIBasic({ connection });

const authorize = (authorizeToken) => derivApi.authorize(authorizeToken);

const subscribe = (request, cb) =>
  derivApi.subscribe(request).subscribe(cb, cb);

const sendRequest = (request) => derivApi.send(request);

export { authorize, sendRequest, subscribe };
