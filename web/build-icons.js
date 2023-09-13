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

const body = meta.map(icon => `export const ${camelize('mdi ' + icon.name)}: string = '<svg viewBox="0 0 24 24"><path d="${icon.path}" /></svg>';\n`).join('');

util.write(fileName, body);
console.log(`\u2714 Build ${version}`);