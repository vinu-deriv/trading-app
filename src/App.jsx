import styles from './App.module.scss';
import { Routes, Route } from 'solid-app-router';
import { createEffect } from 'solid-js';
import { loginUrl } from 'Constants/deriv-urls';
import Endpoint from 'Routes/endpoint';
import { ws } from 'Utils/socket';

function App() {
    createEffect(() => {
        if (!localStorage.getItem('config.server_url')) localStorage.setItem('config.server_url', 'green.binaryws.com');
        if (!localStorage.getItem('config.app_id')) localStorage.setItem('config.app_id', '16303');
    });

    return (
        <div class={styles.App}>
            <header class={styles.header}>
                {/* {localStorage.getItem('active_loginid') ? ( */}
                <div className={styles.login} onClick={() => (window.location.href = loginUrl({ language: 'en' }))}>
                    Log In
                </div>
                /* ) : (
                <div
                    className={styles.logout}
                    onClick={() => {
                        ws.send(JSON.stringify({ logout: 1 }));
                        localStorage.setItem('active_loginid', '');
                        localStorage.setItem('account_list', '');
                    }}
                >
                    Sign Out
                </div>
                )} */
            </header>
            <Routes>
                <Route element={<Endpoint />} path='/endpoint' />
            </Routes>
            <footer>
                The server <a href='/endpoint'>endpoint</a> is: <span>{localStorage.getItem('config.server_url')}</span>
            </footer>
        </div>
    );
}

export default App;
