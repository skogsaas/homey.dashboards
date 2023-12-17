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