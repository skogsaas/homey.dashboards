import type { GridItem } from "./Grid";

export default interface Dashboard {
    id: string;
    source: 'homey'|'localstorage';
    title: string;
    items: GridItem[];
    backgroundImage: string | undefined;
}

export type DashboardMap = { [key: string]: Dashboard; }