import type { GridItemLayout_v1, GridItem_v2, GridLayout_v2 } from "$lib/types/Grid";
import { reorganize } from "./GridUtils";

export interface GridZoneActionOptions {
    layout: GridLayout_v2 | undefined;
    layoutIndex: number | undefined;
    items: GridItem_v2[] | undefined;
}

let sourceZone: HTMLElement | undefined;
let sourceOptions: GridZoneActionOptions | undefined;
let targetZone: HTMLElement | undefined;
let targetOptions: GridZoneActionOptions | undefined;

let selectedElement: HTMLElement | undefined;
let selectedLayout: GridItemLayout_v1 | undefined;
let selectedId: any | undefined;

let startX: number;
let startY: number;

let offsetX: number;
let offsetY: number;

let modifying: boolean = false;
let dragging: boolean = false;
let resizing: boolean = false;

let zones = new Map<HTMLElement, GridZoneActionOptions>();
let layouts = new Map<HTMLElement, GridItemLayout_v1>();

function zonePointerUp(e: MouseEvent) {
    if(e.eventPhase !== e.AT_TARGET || modifying || dragging || resizing) {
        return;
    }

    if(selectedElement !== undefined) {
        selectedElement.removeEventListener('pointerdown', itemPointerDownPosition);
        selectedElement.classList.remove('touch-none', 'cursor-move', 'z-10');

        for (let index = 0; index < selectedElement.children.length; index++) {
            const child = selectedElement.children[index] as HTMLElement;
            
            if(child.hasAttribute('grid-role')) {
                selectedElement.removeChild(child);
                break;
            }
        }
    }

    const zone = e.currentTarget! as HTMLElement;
    zone.dispatchEvent(new CustomEvent('selected', { detail: {} }));
    
    selectedElement = undefined;
    selectedId = undefined;

    for (let index = 0; index < zone.children.length; index++) {
        const child = zone.children[index] as HTMLElement;
        
        decorate(child);
    }
}

function zonePointerOver(e: MouseEvent) {
    e.stopPropagation();

    if(targetZone !== e.currentTarget) {
        if(targetZone !== undefined) {
            targetZone.classList.remove('outline', 'outline-success');

            const options = zones.get(targetZone!);
            const rect = targetZone!.getBoundingClientRect();

            const columnWidth = rect.width / options!.layout!.columns;
            const rowHeight = options!.layout!.rowHeight;

            for (let index = 0; index < targetZone!.children.length; index++) {
                const child = targetZone.children[index] as HTMLElement;

                decorate(child);
                
                if(child === selectedElement) {
                    continue;
                }

                // Reset the child position back to original position
                const item = layouts.get(child);
                child!.style.top = item!.y * rowHeight + 'px';
                child!.style.left = item!.x * columnWidth + 'px';
            }
        }

        targetZone = e.currentTarget as HTMLElement;
        targetOptions = zones.get(targetZone);

        if(sourceZone !== targetZone) {
            targetZone.classList.add('outline', 'outline-success');
        }

        for (let index = 0; index < targetZone!.children.length; index++) {
            const child = targetZone.children[index] as HTMLElement;

            decorate(child);

            if(child === selectedElement) {
                continue;
            }
        }
    }

    if(sourceZone !== targetZone) {
        targetZone.classList.add('outline', 'outline-success');
    }
}

function itemClick(e: MouseEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if(selectedElement !== undefined) {
        selectedElement.removeEventListener('pointerdown', itemPointerDownPosition);
        selectedElement.classList.remove('touch-none', 'z-10');

        for (let index = 0; index < selectedElement.children.length; index++) {
            const child = selectedElement.children[index] as HTMLElement;
            
            if(child.hasAttribute('grid-role')) {
                selectedElement.removeChild(child);
                break;
            }
        }
    }

    const element = e.currentTarget as HTMLElement;
    const layout = layouts.get(element);
    const id = layout!.id;
    let zone: HTMLElement | undefined;

    for (let [key, value] of zones.entries()) {
        if(value.items!.some(i => i.id === id)) {
            zone = key;
            break;
        }
    }

    sourceZone = zone;
    sourceOptions = zones.get(zone!);
    targetZone = zone;
    targetOptions = zones.get(zone!);

    selectedElement = element;
    selectedLayout = layout;
    selectedId = id;

    const item = sourceOptions!.items!.find(i => i.id === selectedId);
    
    selectedElement.classList.add('z-10');
    selectedElement.dispatchEvent(new CustomEvent('selected', { detail: { id, item, zone } }));

    for(let zoneElement of zones.keys()) {
        zoneElement.dispatchEvent(new CustomEvent('selected', { detail: { id, item, zone } }));
    }

    const wrapper = document.createElement('div');
    
    wrapper.setAttribute('grid-role', 'resize');
    wrapper.classList.add('w-full', 'h-full', 'absolute', 'inset-0');

    selectedElement.addEventListener('pointerdown', itemPointerDownPosition);

    const bottomResize = document.createElement('div');
    const rightResize = document.createElement('div');

    wrapper.appendChild(bottomResize);
    wrapper.appendChild(rightResize);

    bottomResize.classList.add('absolute', 'rounded-sm', 'outline', 'outline-2', 'outline-primary', 'bg-background', 'h-2', '-bottom-[5px]', 'cursor-row-resize');
    rightResize.classList.add('absolute', 'rounded-sm', 'outline', 'outline-2', 'outline-primary', 'bg-background', 'w-2', '-right-[5px]', 'cursor-col-resize');

    bottomResize.style.width = 'calc(100%/2)';
    bottomResize.style.left = 'calc(100%/4)';
    rightResize.style.height = 'calc(100%/2)';
    rightResize.style.top = 'calc(100%/4)';

    bottomResize.addEventListener('pointerdown', itemPointerDownHeight);
    rightResize.addEventListener('pointerdown', itemPointerDownWidth);

    selectedElement.addEventListener('contextmenu', eCtx => openContextMenu(targetZone!, eCtx as PointerEvent));
    selectedElement.appendChild(wrapper);

    for (let index = 0; index < targetZone!.children.length; index++) {
        const childElement = targetZone!.children[index] as HTMLElement;
        
        decorate(childElement);
    }
}

function itemPointerDownPosition(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if(selectedElement !== undefined) {
        const rect = selectedElement.getBoundingClientRect();

        modifying = true;

        startX = e.clientX;
        startY = e.clientY;

        offsetX = rect.left - startX;
        offsetY = rect.top - startY;

        window.addEventListener('pointermove', itemPointerMovePosition, true);
        window.addEventListener('pointerup', itemPointerUpPosition, true);

        zones.forEach((value, zoneElement) => {
            zoneElement.removeEventListener('pointerup', zonePointerUp);
            zoneElement.addEventListener('pointerover', zonePointerOver);
        });
    }
}

function itemPointerMovePosition(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if(dragging == false && (Math.abs(e.clientX - startX) > 10 || Math.abs(e.clientY - startY) > 10)) {
        dragging = true;

        // Make sure the dragged element don't capture all events that should go to it's siblings.
        // This is basically to let child zones detect pointerover events when this item is dragged.
        selectedElement!.classList.add('pointer-events-none');
        
        zones.forEach((value, zoneElement) => {
            zoneElement.dispatchEvent(new CustomEvent('moving', { detail: dragging }))
        });

        for (let index = 0; index < targetZone!.children.length; index++) {
            const child = targetZone!.children[index] as HTMLElement;
            
            decorate(child);
        }
    }

    const sourceRect = sourceZone!.getBoundingClientRect();
    const targetRect = targetZone!.getBoundingClientRect();

    const sourceX = e.clientX + offsetX - sourceRect.left;
    const sourceY = e.clientY + offsetY - sourceRect.top;
    
    const sourceWidth = sourceRect.width / sourceOptions!.layout!.columns;
    const targetWidth = targetRect.width / targetOptions!.layout!.columns;

    const columnWidth = targetRect.width / targetOptions!.layout!.columns;
    const rowHeight = targetOptions!.layout!.rowHeight;

    let x = range(Math.round(sourceX / columnWidth), 0, targetOptions!.layout!.columns) * columnWidth;
    let y = Math.max((Math.round(sourceY / rowHeight) * rowHeight), 0);
    const w = range(round(sourceWidth * selectedLayout!.w, targetWidth), 1, targetRect.width);
    const h = Math.max(round(sourceOptions!.layout!.rowHeight * selectedLayout!.h, targetOptions!.layout!.rowHeight), 1);

    if(sourceZone !== targetZone) {
        // Allow position to be negative
        x = Math.round(sourceX / columnWidth) * columnWidth;
        y = Math.round(sourceY / rowHeight) * rowHeight;
    }

    selectedElement!.style.top = y + 'px';
    selectedElement!.style.left = x + 'px';
    selectedElement!.style.width = w + 'px';
    selectedElement!.style.height = h + 'px';
}

function itemPointerUpPosition(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    modifying = false;
    dragging = false;

    // Allow this element to be interacted with again.
    selectedElement!.classList.remove('pointer-events-none');

    targetZone!.classList.remove('outline', 'outline-success');

    zones.forEach((zoneOptions, zoneElement) => {
        zoneElement.addEventListener('pointerup', zonePointerUp);
        zoneElement.removeEventListener('pointerover', zonePointerOver);
        zoneElement.dispatchEvent(new CustomEvent('moving', { detail: dragging }))
    });

    const sourceRect = sourceZone!.getBoundingClientRect();
    const targetRect = targetZone!.getBoundingClientRect();

    const targetX = e.clientX + offsetX - targetRect.left;
    const targetY = e.clientY + offsetY - targetRect.top;

    const sourceWidth = sourceRect.width / sourceOptions!.layout!.columns;
    const targetWidth = targetRect.width / targetOptions!.layout!.columns;

    const x = range(Math.round(targetX / (targetRect.width / targetOptions!.layout!.columns)), 0, targetOptions!.layout!.columns);
    const y = Math.max(Math.round(targetY / targetOptions!.layout!.rowHeight), 0);

    const w = range(Math.round((sourceWidth * selectedLayout!.w) / targetWidth), 1, targetOptions!.layout!.columns);
    const h = Math.max(Math.round((sourceOptions!.layout!.rowHeight * selectedLayout!.h / targetOptions!.layout!.rowHeight)), 1);
    
    if(selectedLayout!.x !== x || selectedLayout!.y !== y || selectedLayout!.w !== w || selectedLayout!.h !== h) {
        if(sourceZone === targetZone) {
            const sourceItems = [...sourceOptions!.items!];
            const item = sourceItems.find(item => item.id === selectedId);
            selectedLayout = { ...selectedLayout!, x, y, w, h };
            item!.layouts![sourceOptions!.layoutIndex!] = selectedLayout;

            reorganize(item!, sourceItems, sourceOptions?.layoutIndex!);

            targetZone!.dispatchEvent(new CustomEvent('items', { detail: sourceItems }));
        } else {
            const item = { ...sourceOptions!.items!.find(item => item.id === selectedId)! };
            selectedLayout = { ...selectedLayout!, x, y, w, h };
            item!.layouts![sourceOptions!.layoutIndex!] = selectedLayout;

            const sourceItems = sourceOptions!.items!.filter(i => i.id !== selectedId);
            const targetItems = [ ...targetOptions!.items!, item ];

            reorganize(item, targetItems, sourceOptions?.layoutIndex!);
    
            targetZone!.dispatchEvent(new CustomEvent('items', { detail: targetItems }));
            sourceZone!.dispatchEvent(new CustomEvent('items', { detail: sourceItems }));
    
            sourceZone = targetZone;
    
            selectedElement!.removeEventListener('pointerdown', itemPointerDownPosition);
            selectedElement = undefined;
            selectedId = undefined;
        }
    }
    
    window.removeEventListener('pointermove', itemPointerMovePosition, true);
    window.removeEventListener('pointerup', itemPointerUpPosition, true);

    for (let index = 0; index < targetZone!.children.length; index++) {
        const child = targetZone!.children[index] as HTMLElement;
        
        decorate(child);
    }
}

function itemPointerDownHeight(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if(selectedElement !== undefined) {
        modifying = true;
        resizing = true;

        const rect = selectedElement.getBoundingClientRect();

        offsetX = rect.left - e.clientX;
        offsetY = rect.top - e.clientY;

        window.addEventListener('pointermove', itemPointerMoveHeight);
        window.addEventListener('pointerup', itemPointerUpHeight);
    }
}

function itemPointerDownWidth(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    if(selectedElement !== undefined) {
        modifying = true;
        resizing = true;
        
        const rect = selectedElement.getBoundingClientRect();

        offsetX = rect.left - e.clientX;
        offsetY = rect.top - e.clientY;

        window.addEventListener('pointermove', itemPointerMoveWidth);
        window.addEventListener('pointerup', itemPointerUpWidth);
    }
}

function itemPointerMoveWidth(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    const sourceRect = sourceZone!.getBoundingClientRect();

    const sourceX = e.clientX - sourceRect.left;
    const columnWidth = sourceRect.width / sourceOptions!.layout!.columns;

    selectedLayout!.w = range(Math.round(sourceX / columnWidth) - selectedLayout!.x, 1, sourceOptions!.layout!.columns);
    selectedElement!.style.width = (selectedLayout!.w * columnWidth) + 'px';
}

function itemPointerUpWidth(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    modifying = false;
    resizing = false;

    const sourceRect = sourceZone!.getBoundingClientRect();

    const copy = sourceOptions!.items!.map(i => ({...i}));
    const item = copy.find(i => i.id === selectedId);

    const columnWidth = sourceRect.width / sourceOptions!.layout!.columns;
    const sourceX = e.clientX - sourceRect.left;
    const rowHeight = sourceOptions!.layout!.rowHeight;
    
    selectedLayout!.w = range((Math.round(sourceX / columnWidth) - selectedLayout!.x), 1, sourceOptions!.layout!.columns);

    reorganize(item!, copy, sourceOptions!.layoutIndex!);

    for (let index = 0; index < targetZone!.children.length; index++) {
        const child = targetZone!.children[index] as HTMLElement;
        
        if(child === selectedElement) {
            continue;
        }

        const childItem = layouts.get(child);
        const childLayout = copy.find(i => i.id === childItem?.id)!.layouts![sourceOptions!.layoutIndex!];
        child!.style.top = childLayout!.y * rowHeight + 'px';
    }

    targetZone!.dispatchEvent(new CustomEvent('items', { detail: copy }));
    
    window.removeEventListener('pointermove', itemPointerMoveWidth);
    window.removeEventListener('pointerup', itemPointerUpWidth);
}

function itemPointerMoveHeight(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    const sourceRect = sourceZone!.getBoundingClientRect();

    const sourceY = e.clientY - sourceRect.top;
    const rowHeight = sourceOptions!.layout!.rowHeight;

    selectedLayout!.h = Math.max(Math.round(sourceY / rowHeight) - selectedLayout!.y, 1);
    selectedElement!.style.height = (selectedLayout!.h * rowHeight) + 'px';
}

function itemPointerUpHeight(e: PointerEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    e.preventDefault();

    modifying = false;
    resizing = false;

    const sourceRect = sourceZone!.getBoundingClientRect();

    const copy = sourceOptions!.items!.map(i => ({...i}));
    const item = copy.find(i => i.id === selectedId);

    const rowHeight = sourceOptions!.layout!.rowHeight;
    const sourceY = e.clientY - sourceRect.top;
    
    selectedLayout!.h = Math.max((Math.round(sourceY / rowHeight) - selectedLayout!.y), 0);

    reorganize(item!, copy, sourceOptions!.layoutIndex!);

    for (let index = 0; index < targetZone!.children.length; index++) {
        const child = targetZone!.children[index] as HTMLElement;
        
        if(child === selectedElement) {
            continue;
        }

        const childItem = layouts.get(child);
        const childLayout = copy.find(i => i.id === childItem?.id)!.layouts![sourceOptions!.layoutIndex!];
        child!.style.top = childLayout!.y * rowHeight + 'px';
    }
    
    targetZone!.dispatchEvent(new CustomEvent('items', { detail: copy }));
    
    window.removeEventListener('pointermove', itemPointerMoveHeight);
    window.removeEventListener('pointerup', itemPointerUpHeight);
}

function openContextMenu(parent: HTMLElement, e: PointerEvent) {
    e.preventDefault();
    e.stopPropagation();

    const rect = parent.getBoundingClientRect();
    const backdrop = document.createElement('div');
    const menu = document.createElement('ul');
    
    backdrop.classList.add('fixed', 'w-full', 'h-full', 'top-0', 'left-0', 'z-40');
    backdrop.addEventListener('click', eBg => backdrop.remove(), true);

    const deleteLi = document.createElement('li');
    const deleteA = document.createElement('a');
    deleteLi.appendChild(deleteA);
    deleteA.textContent = "Delete";
    deleteA.addEventListener('click', _ => deleteItem(backdrop), true);

    const lockLi = document.createElement('li');
    const lockA = document.createElement('a');
    lockLi.appendChild(lockA);
    lockA.textContent = selectedLayout?.fixed ? "Unlock" : "Lock";
    lockA.addEventListener('click', _ => fixItem(backdrop), true);

    menu.classList.add('relative', 'z-50', 'menu', 'bg-base-200', 'w-32', 'rounded-box');
    menu.style.top = e.clientY - rect.top + 'px';
    menu.style.left = e.clientX - rect.left + 'px';

    menu.appendChild(deleteLi);
    menu.appendChild(lockLi);

    backdrop.appendChild(menu);
    
    if(parent.firstElementChild !== null) {
        parent.insertBefore(backdrop, parent.firstElementChild);
    } else {
        parent.appendChild(backdrop);
    }
}

function decorate(element: HTMLElement) {
    const item = layouts.get(element);
    //const fixed: boolean = item?.fixed ?? false;
    const selected = item?.id === selectedId;
    const parent = element.parentElement;

    const outline = selected ? 'outline-primary' : 'outline-info';

    element.classList.remove('outline', 'outline-primary', 'outline-info', 'cursor-move');

    if(selectedElement !== undefined && (parent === targetZone || selected)) {
        element.classList.add('outline', outline, 'cursor-move');
    }
}

function deleteItem(backdrop: HTMLElement) {
    backdrop.remove();

    const sourceOptions = zones.get(sourceZone!);
    const copy = sourceOptions!.items!
        .filter(i => i.id !== selectedId)
        .map(i => ({...i}));

    sourceZone!.dispatchEvent(new CustomEvent('items', { detail: copy }));
}

function fixItem(backdrop: HTMLElement) {
    backdrop.remove();

    const sourceOptions = zones.get(sourceZone!);
    const copy = sourceOptions!.items!.map(i => ({...i}));
    const item = copy.find(i => i.id === selectedId);
    const layout = item!.layouts![sourceOptions!.layoutIndex!];
    layout!.fixed = !layout?.fixed;

    sourceZone!.dispatchEvent(new CustomEvent('items', { detail: copy }));
}

function round(num: number, interval: number) {
    return Math.round(num / interval) * interval;
}

function range(num: number, min: number, max: number)
{
    return Math.min(max, Math.max(min, num));
}

export function gridZone(zone: HTMLElement, options: GridZoneActionOptions) {
    function configure(_options: GridZoneActionOptions) {
        zones.set(zone, _options);

        if(_options.items === undefined || _options.layout === undefined) {
            return;
        }

        const rect = zone.getBoundingClientRect();

        const columnWidth = rect.width / _options.layout!.columns;
        const rowHeight = _options.layout!.rowHeight;

        zone.removeEventListener('pointerup', zonePointerUp); // Removes if exists

        zone.classList.add('relative');
        zone.addEventListener('pointerup', zonePointerUp);

        for (let index = 0; index < zone.children.length; index++) {
            const item = zone.children[index] as HTMLElement;
            const itemData = _options.items![index].layouts[_options.layoutIndex!];

            layouts.set(item, itemData);

            item.removeEventListener('click', itemClick); // Removes if exists

            if(itemData === undefined) {
                continue;
            }
            
            item.classList.add('absolute', 'outline-2');
            item.addEventListener('click', itemClick);
            
            item.style.top = itemData.y * rowHeight + 'px';
            item.style.left = itemData.x * columnWidth + 'px';
            item.style.height = itemData.h * rowHeight + 'px';
            item.style.width = itemData.w * columnWidth + 'px';
        }
    }

    configure(options);

    return {
        update: (newOptions: GridZoneActionOptions) => {
            configure(newOptions);
        },
        destroy: () => {
            zones.delete(zone);
        }
    };
}

export function grid(zone: HTMLElement, options: GridZoneActionOptions) {
    function configure(_options: GridZoneActionOptions) {
        if(_options.items === undefined || _options.layout === undefined) {
            return;
        }

        const rect = zone.getBoundingClientRect();

        const columnWidth = rect.width / _options.layout!.columns;
        const rowHeight = _options.layout!.rowHeight;

        zone.classList.add('relative');

        for (let index = 0; index < zone.children.length; index++) {
            const item = zone.children[index] as HTMLElement;
            const itemData = _options.items![index].layouts[_options.layoutIndex!];

            if(itemData === undefined) {
                continue;
            }
            
            item.classList.add('absolute');
            
            item.style.top = itemData.y * rowHeight + 'px';
            item.style.left = itemData.x * columnWidth + 'px';
            item.style.height = itemData.h * rowHeight + 'px';
            item.style.width = itemData.w * columnWidth + 'px';
        }
    }

    configure(options);

    return {
        update: (newOptions: GridZoneActionOptions) => {
            configure(newOptions);
        },
        destroy: () => {
        }
    };
}