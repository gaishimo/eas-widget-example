import { ConfigPlugin, withProjectBuildGradle } from "@expo/config-plugins"

/**
 * kotlin-gradle-pluginの設定を追加する
 * @param config
 * @returns
 */
export const withWidgetProjectBuildGradle: ConfigPlugin = config => {
  return withProjectBuildGradle(config, async newConfig => {
    const buildGradle = newConfig.modResults.contents

    const search = /dependencies\s?{/
    const replace = `dependencies {
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.6.10'`
    const newBuildGradle = buildGradle.replace(search, replace)
    newConfig.modResults.contents = newBuildGradle
    return newConfig
  })
}
