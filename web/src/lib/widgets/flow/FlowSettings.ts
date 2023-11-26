import type { WidgetSettings } from "../../types/Widgets";

export interface FlowSettings_v1 extends WidgetSettings {
    flowId: string | undefined;
    
    title: string | undefined;
    titleHidden: boolean | undefined;
    
    iconId: string | undefined;
    iconHidden: boolean | undefined;
    iconSize: 'xs'|'sm'|'md'|'lg'|'xl' | undefined;
}