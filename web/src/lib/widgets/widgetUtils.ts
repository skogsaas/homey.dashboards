import { v4 as uuid } from 'uuid';

export function clone(data: any) : any {
    if(data === undefined) return undefined;

    if(Array.isArray(data)) {
        return (data as any[]).map(a => clone(a));
    } else if(typeof data === 'object') {
        const cData = { ...data };

        if(isWidget(cData)) {
            // Replace the ID of all sub widgets, as multiple instances of the sub widgets might collide if 
            // they have the same IDs.
            cData.id = uuid();

            if(cData.type === 'template') {
                // Stop recursion if a template widget is detected. Instead only populate/replace template 
                // arguments with arguments from this template.

                return cData;
            }
        }

        Object.keys(cData).forEach(key => cData[key] = clone(cData[key]));

        return cData;
    } else {
        return data;
    }
}

function isWidget(element: any) : boolean {
    return Object.hasOwn(element, 'id') &&
        Object.hasOwn(element, 'type') &&
        Object.hasOwn(element, 'version');
}