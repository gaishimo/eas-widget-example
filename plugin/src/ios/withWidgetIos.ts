import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetXCode } from "./withWidgetXCode"
import { withWidgetEAS } from "./withWidgetEAS"

export const withWidgetIos: ConfigPlugin<WithWidgetProps> = (
  config,
  options,
) => {
  config = withWidgetXCode(config, options)
  config = withWidgetEAS(config, options)
  return config
}
