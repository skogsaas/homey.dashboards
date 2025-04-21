export interface Style_v1 {
    margin: number | undefined;
    padding: number | undefined;
    borders: Border_v1 | undefined;
    outline: Outline_v1 | undefined;
    shadow: 'shadow-none' | 'shadow-sm' | 'shadow' | 'shadow-md' | 'shadow-lg' | 'shadow-xl' | 'shadow-inner' | undefined;
}

export interface Border_v1 {
    radius: 'rounded-none' | 'rounded-sm' | 'rounded' | 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-full' | undefined;
    width: 'border-0' | 'border' | 'border-2' | 'border-4' | 'border-8' | undefined;
    style: 'border-none' | 'border-solid' | 'border-dashed' | 'border-dotted' | 'border-hidden' | undefined;
    color: string | undefined;
}

export interface Outline_v1 {
    width: 'outline-0' | 'outline-1' | 'outline-2' | 'outline-4' | 'outline-8' | undefined;
    style: 'outline-none' | 'outline' | 'outline-dashed' | 'outline-dotted' | undefined;
    color: string | undefined;
    offset: 'outline-offset-0' | 'outline-offset-1' | 'outline-offset-2' | 'outline-offset-4' | 'outline-offset-8' | undefined;
}