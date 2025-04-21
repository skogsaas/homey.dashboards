import { v4 as uuid } from 'uuid';
import type { TemplateSettings_v1 } from "./TemplateSettings";

export function transform(template: any, data: any, slug: string) : any {
    if(template === undefined) return undefined;

    if(Array.isArray(template)) {
        return (template as any[]).map(a => transform(a, data, slug));
    } else if(typeof template === 'object') {
        const copy = { ...template };

        if(isWidget(copy)) {
            // Replace the ID of all sub widgets, as multiple instances of the sub widgets might collide if 
            // they have the same IDs.
            copy.id = uuid();

            if(copy.type === 'template') {
                // Stop recursion if a template widget is detected. Instead only populate/replace template 
                // arguments with arguments from this template.

                (copy as TemplateSettings_v1).arguments = ((copy as TemplateSettings_v1).arguments ?? []).map(a => ({
                    argId: a.argId,
                    value: transform(a.value, data, slug)
                }));

                return copy;
            }
        }

        Object.keys(copy).forEach(key => copy[key] = transform(copy[key], data, slug));

        return copy;
    } else if(typeof template === 'string') {
        let copy = template as string;

        // Replace any template arguments being used.
        const variableRegex = /\$\{([^}]+)\.([^}]+)\}/g;
        const matches: string[][] = [...copy.matchAll(variableRegex)];

        for(const match of matches) {
            const fullMatch = match[0];
            const matchSlug = match[1];
            const itemKey = match[2];

            // Require the variable to be in the form ${slug.property}
            if(matchSlug !== slug) continue;

            if(Object.hasOwn(data, itemKey)) {
                const itemValue = data[itemKey];
                
                if(copy === fullMatch) {
                    copy = itemValue;
                } else {
                    copy = copy.replaceAll(fullMatch, itemValue);
                }
            }
        }

        return copy;
    } else {
        return template;
    }
}

function isWidget(element: any) : boolean {
    return Object.hasOwn(element, 'id') &&
        Object.hasOwn(element, 'type') &&
        Object.hasOwn(element, 'version');
}