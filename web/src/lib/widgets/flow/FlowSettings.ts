import type { WidgetSettings } from "../../types/Widgets";

export default interface FlowSettings extends WidgetSettings {
    flowId: string | undefined;
    iconId: string | undefined;
}