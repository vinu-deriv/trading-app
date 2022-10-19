const isBrowser = () => typeof window !== "undefined";

const deriv_com_url = "deriv.com";
const deriv_me_url = "deriv.me";
const deriv_be_url = "deriv.be";

const supported_domains = [deriv_com_url, deriv_me_url, deriv_be_url];
const domain_url_initial =
  isBrowser() && window.location.hostname.split("app.")[1];
const domain_url = supported_domains.includes(domain_url_initial)
  ? domain_url_initial
  : deriv_com_url;

export const deriv_urls = Object.freeze({
  DERIV_HOST_NAME: domain_url,
  DERIV_APP_PRODUCTION: "https://trading-app-sigma.vercel.app",
});

export const loginUrl = ({ language }) => {
  const config_server_url = localStorage.getItem("config.server_url");
  const config_app_id = localStorage.getItem("config.app_id") || 1022;

  if (config_server_url && /qa/.test(config_server_url)) {
    return `https://${config_server_url}/oauth2/authorize?app_id=${config_app_id}&l=${language}`;
  }

  return `https://oauth.${deriv_urls.DERIV_HOST_NAME}/oauth2/authorize?app_id=${config_app_id}&l=${language}`;
};
