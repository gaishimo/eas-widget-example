import { ConfigPlugin } from "@expo/config-plugins"
import { withWidgetAndroid } from "./android/withWidgetAndroid"

const withAppConfigs: ConfigPlugin = config => {
  config = withWidgetAndroid(config)
  return config
}

export default withAppConfigs
