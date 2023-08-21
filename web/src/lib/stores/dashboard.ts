import type { Grid, GridItem, GridResizeEvent } from '$lib/types/Grid';
import type { WidgetSettings } from '$lib/types/Widgets';
import { writable } from 'svelte/store';

import gridHelp from "svelte-grid/build/helper";

const smallBreakpoint = 640;
const mediumBreakpoint = 768;
const largeBreakpoint = 1024;
const xlargeBreakpoint = 1280;
export const breakpoints: number[] = [smallBreakpoint, mediumBreakpoint, largeBreakpoint, xlargeBreakpoint];

const smallColumns = 6;
const mediumColumns = 12;
const largeColumns = 18;
const xlargeColumns = 24;
export const columns: number[] = [smallColumns, mediumColumns, largeColumns, xlargeColumns];

export const breakpointColumns = [
  [smallBreakpoint, smallColumns], 
  [mediumBreakpoint, mediumColumns],
  [largeBreakpoint, largeColumns],
  [xlargeBreakpoint, xlargeColumns]
];

function createEditing() {
    const { subscribe, set, update } = writable(false);

    return {
        subscribe,
        set,
        toggle: () => update((existing: boolean) => !existing)
    };
}

function createItems() {
    const { subscribe, set, update } = writable([] as GridItem[]);

    return {
        subscribe,
        set,
        addItem: (item: GridItem) => { 
            update((existing: GridItem[]) => {
                const result = [...existing, item];
                
                columns.forEach(column => {
                    item[column] = gridHelp.item({ x: 0, y: 0, w: 3, h: 3, resizable: true, draggable: true });
                    
                    const findOutPosition = gridHelp.findSpace(item, result, column);

                    item[column] = {
                        ...item[column],
                        ...findOutPosition
                    };
                  })

                return result;
            });

            return item;
        },
        removeItem: (id: string) => update((existing) => {
            return existing.filter(item => item.id !== id);
        }),
        setEditing: (edit: boolean) => update((existing: GridItem[]) => { 
            const result = [...existing];

            result.forEach((item: GridItem) => { 
                columns.forEach(column => {
                    item[column].draggable = edit;
                    item[column].resizable = edit;
                });
            });

            return result;
        }),
        setFixed: (id: string, fixed: boolean) => update((existing: GridItem[]) => { 
            const result = [...existing];
            const item = result.find(i => i.id === id);

            if(item) {
                columns.forEach(column => {
                    item[column].fixed = fixed;
                    item[column].draggable = !fixed;
                    item[column].resizable = !fixed;
                });
            }
            
            return result;
        }),
        setSettings: (id: string, settings: WidgetSettings) => update((existing: GridItem[]) => {
            const result = [...existing];
            const item = result.find(i => i.id === id);

            if(item) {
                item.settings = settings;
            }
            
            return result;
        })
    };
}

function createGrid() {
    const { subscribe, set, update } = writable({
        gaps: [10, 10]
    } as Grid);

    return {
        subscribe,
        set,
        updateSize: (e: GridResizeEvent) => update((existing: Grid) => ({ ...existing, columns: e.cols, width: e.width, pxX: e.xPerPx, pxY: e.yPerPx })),
        updateGap: (g: number) => update((existing: Grid) => ({ ...existing, gaps: [g, g] }))
    };
}

export const editing = createEditing();
export const items = createItems();
export const grid = createGrid(); 