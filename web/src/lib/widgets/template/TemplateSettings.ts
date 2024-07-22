import type { WidgetSettings_v1 } from "../../types/Widgets";

export interface TemplateSettings_v1 extends WidgetSettings_v1 {
    templateId: string;
    arguments: TemplateSettingsArgument_v1[];
}

export interface TemplateSettingsArgument_v1 {
    argId: string;
    value: any | undefined;
}