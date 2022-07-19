import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetXCode } from "./withWidgetXCode"

export const withWidgetIos: ConfigPlugin = config => {
  config = withWidgetXCode(config)
  return config
}
