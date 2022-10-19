import { useForm } from 'Utils/validation.js';
import { createStore } from 'solid-js/store';

const ErrorMessage = props => <div class='error-message'>{props.error}</div>;

const Endpoint = () => {
    const [fields, setFields] = createStore();
    const { errors, formSubmit, validate } = useForm({
        errorClass: 'error-input',
    });

    const onFormSubmit = () => {
        localStorage.setItem('config.app_id', fields.app_id);
        localStorage.setItem('config.server_url', fields.server);
        location.reload();
    };

    const onFormReset = () => {
        // TODO: change to prod app_id
        localStorage.setItem('config.app_id', '1022');
        localStorage.setItem('config.server_url', 'qa10.deriv.dev');
        location.reload();
    };

    return (
        <div className='endpoint'>
            <label>Change API endpoint</label>
            <form use:formSubmit={onFormSubmit}>
                <div>
                    <input
                        type='text'
                        name='server'
                        onInput={e => {
                            setFields('server', e.target.value);
                        }}
                        placeholder='Server'
                        value={localStorage.getItem('config.server_url')}
                        required
                        use:validate
                    />
                    <ErrorMessage error={errors.server} />
                </div>
                <div>
                    <input
                        type='text'
                        name='app_id'
                        onInput={e => {
                            setFields('app_id', e.target.value);
                        }}
                        placeholder='App ID'
                        value={localStorage.getItem('config.app_id')}
                        required
                        use:validate
                    />
                    <ErrorMessage error={errors.app_id} />
                </div>
                <div>
                    <button type='submit'>Submit</button>
                    <button type='button' onClick={onFormReset}>
                        Reset
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Endpoint;
