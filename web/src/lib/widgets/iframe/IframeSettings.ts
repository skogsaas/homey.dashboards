import type { WidgetSettings } from "../../types/Widgets";

export default interface DashboardLinkSettings extends WidgetSettings {
    url: string | undefined;
    height: number | undefined;
    width: number | undefined;

    allowForms: boolean | undefined;
    allowModals: boolean | undefined;
    allowOrientationLock: boolean | undefined;
    allowPointerLock: boolean | undefined;
    allowPopups: boolean | undefined;
    allowPopupsToEscapeSandbox: boolean | undefined;
    allowPresentation: boolean | undefined;
    allowSameOrigin: boolean | undefined;
    allowScripts: boolean | undefined;
    allowTopNavigation: boolean | undefined;
    allowTopLevelNavigationByUserActivation: boolean | undefined;
}