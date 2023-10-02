import { lookup, mdiHelp } from ".";

export function getIcon(id: string) : string | undefined {
    const icon = lookup.find(i => i.id === id);

    return icon?.icon ?? mdiHelp;
}