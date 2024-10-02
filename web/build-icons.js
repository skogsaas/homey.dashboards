import * as util from "@mdi/util";

const fileName = "./src/lib/components/icons/index.ts";
const version = util.getVersion();
const meta = util.getMeta(true); // true = withPaths

function camelize(str) {
    return str
        .replaceAll('-', ' ')
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

const body = meta
    .filter(icon => !icon.deprecated)
    .map(icon => `export const ${camelize('mdi ' + icon.name)}: string = '<path d="${icon.path}" />';\n`)
    .join('');

const lookup = meta
    .filter(icon => !icon.deprecated)
    .map(icon => `{ "id": "${icon.name}", "icon": ${camelize('mdi ' + icon.name)} }`)
    .join(',\n');

const result = body + 
    "export interface IconMetadata { id: string; icon: string; }\n" +
    "export const lookup: IconMetadata[] = [\n" +
    lookup + 
    "];";

util.write(fileName, result);
console.log(`\u2714 Build ${version}`);