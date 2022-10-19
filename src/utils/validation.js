import { createStore } from 'solid-js/store';

function checkValid({ element }, setErrors, errorClass) {
    return async () => {
        element.setCustomValidity('');
        element.checkValidity();
        let message = element.validationMessage;
        if (!message) {
            message = element.validationMessage;
        }
        if (message) {
            errorClass && element.classList.toggle(errorClass, true);
            setErrors({ [element.name]: message });
        }
    };
}

export function useForm({ errorClass }) {
    const [errors, setErrors] = createStore({}),
        fields = {};

    const validate = ref => {
        let config;
        fields[ref.name] = config = { element: ref };
        ref.onblur = checkValid(config, setErrors, errorClass);
        ref.oninput = () => {
            if (!errors[ref.name]) return;
            setErrors({ [ref.name]: undefined });
            errorClass && ref.classList.toggle(errorClass, false);
        };
    };

    const formSubmit = (ref, accessor) => {
        const callback = accessor() || (() => {});
        ref.setAttribute('novalidate', '');
        ref.onsubmit = async e => {
            e.preventDefault();
            let errored = false;

            for (const k in fields) {
                const field = fields[k];
                await checkValid(field, setErrors, errorClass)();
                if (!errored && field.element.validationMessage) {
                    field.element.focus();
                    errored = true;
                }
            }
            !errored && callback(ref);
        };
    };

    return { validate, formSubmit, errors };
}
