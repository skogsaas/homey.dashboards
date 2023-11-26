import type { GridItem_v1 } from "./Grid";

export default interface Dashboard {
    id: string;
    source: 'homey'|'localstorage';
    title: string;
    items: GridItem_v1[];
    backgroundImage: string | undefined;
}

export type DashboardMap = { [key: string]: Dashboard; }