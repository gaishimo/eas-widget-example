import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetAppBuildGradle } from "./withWidgetAppBuildGradle"
import { withWidgetManifest } from "./withWidgetManifest"
import { withWidgetProjectBuildGradle } from "./withWidgetProjectBuildGradle"
import { withWidgetSourceCodes } from "./withWidgetSourceCodes"

/**
 * @param config
 * @returns
 */
export const withWidgetAndroid: ConfigPlugin = config => {
  config = withWidgetManifest(config)
  config = withWidgetProjectBuildGradle(config)
  config = withWidgetAppBuildGradle(config)
  config = withWidgetSourceCodes(config)
  return config
}
