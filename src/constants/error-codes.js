export const ERROR_CODE = {
  market_closed: "MarketIsClosed",
  rate_limit: "RateLimit",
  invalid_app_id: "InvalidAppID",
  invalid_token: "InvalidToken",
};

export const ERROR_MESSAGE = {
  // TODO: to be updated when all the error codes and message list is available
  // [ERROR_CODE.invalid_app_id]: "Your AppId is invalid. Please click on Set AppId button to redirect to endpoint"
  endpoint_redirect:
    "Your AppId is invalid. Please click on Set AppId button to redirect to endpoint",
  general_error: "Something is not right",
  login_error: "Please login to place a trade",
  invalid_token: "The token is not valid. You are being logged out...",
  rate_limit:
    "You have reached the rate limit. Please click on Reload button to continue",
};
