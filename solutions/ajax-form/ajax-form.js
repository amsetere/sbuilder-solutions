document.addEventListener('DOMContentLoaded', () => {
    const action = '/ajax/';
    const forms = document.querySelectorAll(`[action="${action}"]`);
    const isDebug = document.location.search.indexOf('debug_ajax') !== -1;

    const getFormId = (form) => {
        let formId = form.dataset.ajax !== undefined ? form.dataset.ajax : '';
        if (form.getAttribute('id')) {
            formId = form.getAttribute('id');
        }

        if (formId) {
            formId = `_${formId}`;
        }

        return formId;
    }

    if (isDebug) {
        console.info(`Load script for ajax forms. Forms finded: ${forms.length}`);
    }

    
    forms.forEach(form => {
        let formId = getFormId(form);

        const eventName = `ajax${formId}`;
        const eventNameFailed = `${eventName}_failed`;

        if (isDebug) {
            console.info(form, `Success event name ajax form: ${eventName}. Failed event name ajax form: ${eventNameFailed}`);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                cache: 'no-cache',
            })
                .then(r => {
                    if(r.url.indexOf('?pl') === -1) {
                        throw Error('Форма не была отправлена! Проверьте наличие pl_plugin_ident поля в форме отправки или обязательные поля в технической форме.');
                    }

                    return r.text();
                })
                .then(() => document.dispatchEvent(new CustomEvent(eventName, {detail:form})))
                .catch(e => {
                    console.error(e);
                    document.dispatchEvent(new CustomEvent(eventNameFailed, {detail:form}));
                });
        });
    });
});
