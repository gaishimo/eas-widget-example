/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { ConfigPlugin, withDangerousMod } from "@expo/config-plugins"
import fs from "fs-extra"
import glob from "glob"
import path from "path"

export const withWidgetSourceCodes: ConfigPlugin = config => {
  return withDangerousMod(config, [
    "android",
    async newConfig => {
      const projectRoot = newConfig.modRequest.projectRoot
      const platformRoot = newConfig.modRequest.platformProjectRoot
      const widgetDir = path.join(projectRoot, "widget")
      copyResourceFiles(widgetDir, platformRoot)

      const packageName = config.android?.package
      prepareSourceCodes(widgetDir, platformRoot, packageName!)

      return newConfig
    },
  ])
}

function copyResourceFiles(widgetSourceDir: string, platformRoot: string) {
  const source = path.join(widgetSourceDir, "android", "src", "main", "res")
  const resDest = path.join(platformRoot, "app", "src", "main", "res")

  console.log(`copy the res files from ${source} to ${resDest}`)
  fs.copySync(source, resDest)
}

async function prepareSourceCodes(
  widgetSourceDir: string,
  platformRoot: string,
  packageName: string,
) {
  const packageDirPath = packageName.replace(/\./g, "/")

  const source = path.join(
    widgetSourceDir,
    `android/src/main/java/package_name`,
  )
  const dest = path.join(platformRoot, "app/src/main/java", packageDirPath)
  console.log(`copy the kotlin codes from ${source} to ${dest}`)
  fs.copySync(source, dest)

  const files = glob.sync(`${dest}/*.kt`)
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8")
    const newContent = content.replace(
      /^package .*\s/,
      `package ${packageName}\n`,
    )
    fs.writeFileSync(file, newContent)
  }
}
