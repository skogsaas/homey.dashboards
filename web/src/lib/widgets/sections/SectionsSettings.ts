import type { WidgetSettings_v1 } from "$lib/types/Widgets";

export interface SectionsSettings_v1 extends WidgetSettings_v1 {
    items: WidgetSettings_v1[] | undefined;

    sm?: 'sm:grid-cols-1' | 'sm:grid-cols-2' | 'sm:grid-cols-3' | 'sm:grid-cols-4' | 'sm:grid-cols-5' | 'sm:grid-cols-6' | 'sm:grid-cols-7' | 'sm:grid-cols-8' | 'sm:grid-cols-9' | 'sm:grid-cols-10'| 'sm:grid-cols-11'| 'sm:grid-cols-12';
    smGap?: 'sm:gap-0' | 'sm:gap-0.5' | 'sm:gap-1' | 'sm:gap-2' | 'sm:gap-3' | 'sm:gap-4' | 'sm:gap-5' | 'sm:gap-6' | 'sm:gap-7' | 'sm:gap-8' | 'sm:gap-9' | 'sm:gap-10';

    md?: 'md:grid-cols-1' | 'md:grid-cols-2' | 'md:grid-cols-3' | 'md:grid-cols-4' | 'md:grid-cols-5' | 'md:grid-cols-6' | 'md:grid-cols-7' | 'md:grid-cols-8' | 'md:grid-cols-9' | 'md:grid-cols-10'| 'md:grid-cols-11'| 'md:grid-cols-12';
    mdGap?: 'md:gap-0' | 'md:gap-0.5' | 'md:gap-1' | 'md:gap-2' | 'md:gap-3' | 'md:gap-4' | 'md:gap-5' | 'md:gap-6' | 'md:gap-7' | 'md:gap-8' | 'md:gap-9' | 'md:gap-10';
    
    lg?: 'lg:grid-cols-1' | 'lg:grid-cols-2' | 'lg:grid-cols-3' | 'lg:grid-cols-4' | 'lg:grid-cols-5' | 'lg:grid-cols-6' | 'lg:grid-cols-7' | 'lg:grid-cols-8' | 'lg:grid-cols-9' | 'lg:grid-cols-10'| 'lg:grid-cols-11'| 'lg:grid-cols-12';
    lgGap?: 'lg:gap-0' | 'lg:gap-0.5' | 'lg:gap-1' | 'lg:gap-2' | 'lg:gap-3' | 'lg:gap-4' | 'lg:gap-5' | 'lg:gap-6' | 'lg:gap-7' | 'lg:gap-8' | 'lg:gap-9' | 'lg:gap-10';

    xl?: 'xl:grid-cols-1' | 'xl:grid-cols-2' | 'xl:grid-cols-3' | 'xl:grid-cols-4' | 'xl:grid-cols-5' | 'xl:grid-cols-6' | 'xl:grid-cols-7' | 'xl:grid-cols-8' | 'xl:grid-cols-9' | 'xl:grid-cols-10'| 'xl:grid-cols-11'| 'xl:grid-cols-12';
    xlGap?: 'xl:gap-0' | 'xl:gap-0.5' | 'xl:gap-1' | 'xl:gap-2' | 'xl:gap-3' | 'xl:gap-4' | 'xl:gap-5' | 'xl:gap-6' | 'xl:gap-7' | 'xl:gap-8' | 'xl:gap-9' | 'xl:gap-10';

    xxl?: '2xl:grid-cols-1' | '2xl:grid-cols-2' | '2xl:grid-cols-3' | '2xl:grid-cols-4' | '2xl:grid-cols-5' | '2xl:grid-cols-6' | '2xl:grid-cols-7' | '2xl:grid-cols-8' | '2xl:grid-cols-9' | '2xl:grid-cols-10'| '2xl:grid-cols-11'| '2xl:grid-cols-12';
    xxlGap?: '2xl:gap-0' | '2xl:gap-0.5' | '2xl:gap-1' | '2xl:gap-2' | '2xl:gap-3' | '2xl:gap-4' | '2xl:gap-5' | '2xl:gap-6' | '2xl:gap-7' | '2xl:gap-8' | '2xl:gap-9' | '2xl:gap-10';
}