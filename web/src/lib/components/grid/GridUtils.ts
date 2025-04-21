import type { GridItem_v2, GridItemLayout_v1 } from "$lib/types/Grid";

export function CalculatePosition(
    columns: number,
    width: number, 
    rowHeight: number, 
    posX: number, 
    posY: number
) {
    const y = Math.round(posY / rowHeight);
    const x = Math.round(columns / width * posX);

    return { x, y };
}

export function reorganize(item: GridItem_v2, items: GridItem_v2[], index: number) {
    // Get all colliding items and move them down
    var collisions = items.filter(i => collision(item.layouts[index], i.layouts[index]));

    collisions
        .filter(i => !i.layouts[index].fixed)
        .forEach(i => i.layouts[index].y = item.layouts[index].y + item.layouts[index].h);
    collisions
        .filter(i => !i.layouts[index].fixed)
        .forEach(i => reorganize(i, items, index));
}

export function collision(a: GridItemLayout_v1, b: GridItemLayout_v1) : boolean {
    if(a.id === b.id) {
        return false;
    }

    return !(
        ((a.y + a.h) <= (b.y)) ||
        (a.y >= (b.y + b.h)) ||
        ((a.x + a.w) <= b.x) ||
        (a.x >= (b.x + b.w))
    );
}