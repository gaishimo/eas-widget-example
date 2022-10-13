import { ConfigPlugin, withProjectBuildGradle } from "@expo/config-plugins"

/**
 * Add configuration of kotlin-gradle-plugin
 * @param config
 * @returns
 */
export const withWidgetProjectBuildGradle: ConfigPlugin = config => {
  return withProjectBuildGradle(config, async newConfig => {
    const buildGradle = newConfig.modResults.contents

    const search = /dependencies\s?{/
    const replace = `dependencies {
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:\${project.ext.kotlinVersion}"`
    const newBuildGradle = buildGradle.replace(search, replace)
    newConfig.modResults.contents = newBuildGradle
    return newConfig
  })
}
