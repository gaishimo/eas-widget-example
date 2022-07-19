import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetIos } from "./ios/withWidgetIos"

const withAppConfigs: ConfigPlugin = config => {
  // config = withWidgetAndroid(config)
  config = withWidgetIos(config)
  return config
}

export default withAppConfigs
