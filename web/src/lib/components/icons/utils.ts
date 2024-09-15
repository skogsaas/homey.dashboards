import { lookup } from ".";

export function getIcon(id: string | undefined) : string | undefined {
    const icon = lookup.find(i => i.id === id);

    return icon?.icon;
}