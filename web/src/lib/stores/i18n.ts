import { derived, writable } from 'svelte/store';

import enGB from 'date-fns/locale/en-GB'
import enUS from 'date-fns/locale/en-US'
import noNB from 'date-fns/locale/nb'

export const locale = writable(navigator.language);
export const dateFnsLocale = derived(
    locale, 
    (l: string) => {
        switch(l) {
            case 'en-US': return enUS;
            case 'nb': return noNB;

            case 'en-GB': 
            default:
                return enGB;
        }
    }, 
    enGB);