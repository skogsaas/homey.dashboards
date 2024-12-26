import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface FlowSettings_v1 extends WidgetSettings_v1 {
    flowId: string | undefined;
    title: string | undefined;
    iconId: string | undefined;
}