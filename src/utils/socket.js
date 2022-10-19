export const ws = new WebSocket('wss://qa10.deriv.dev/websockets/v3?l=EN&app_id=1022&brand=deriv');

ws.onopen = function (evt) {
    let obj_params = {};
    const search = window.location.search;

    if (search) {
        let search_params = new URLSearchParams(window.location.search);

        search_params.forEach((value, key) => {
            const account_keys = ['acct', 'token', 'cur'];
            const is_account_param = account_keys.some(
                account_key => key?.includes(account_key) && key !== 'affiliate_token'
            );

            if (is_account_param) {
                obj_params[key] = value;
            }
        });
    }

    ws.send(JSON.stringify({ authorize: obj_params.token1 }));
    ws.onmessage = function (msg) {
        var data = JSON.parse(msg.data);

        if (data.authorize) {
            const { account_list, loginid } = data.authorize;

            localStorage.setItem('active_loginid', loginid);
            localStorage.setItem('accounts', JSON.stringify(account_list));
        }
    };
};
