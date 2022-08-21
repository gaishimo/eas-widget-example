import { ConfigPlugin, withXcodeProject } from "@expo/config-plugins"
import fs from "fs-extra"
import path from "path"
import xcode from "xcode"

const EXTENSION_TARGET_NAME = "widget"

const TOP_LEVEL_FILES = ["Assets.xcassets", "Info.plist", "widget.swift"]

const BUILD_CONFIGURATION_SETTINGS = {
  ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
  ASSETCATALOG_COMPILER_WIDGET_BACKGROUND_COLOR_NAME: "WidgetBackground",
  CLANG_ANALYZER_NONNULL: "YES",
  CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
  CLANG_CXX_LANGUAGE_STANDARD: '"gnu++17"',
  CLANG_ENABLE_OBJC_WEAK: "YES",
  CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
  CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
  CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
  CODE_SIGN_STYLE: "Automatic",
  CURRENT_PROJECT_VERSION: "1",
  DEBUG_INFORMATION_FORMAT: "dwarf",
  GCC_C_LANGUAGE_STANDARD: "gnu11",
  GENERATE_INFOPLIST_FILE: "YES",
  INFOPLIST_FILE: "widget/Info.plist",
  INFOPLIST_KEY_CFBundleDisplayName: "widget",
  INFOPLIST_KEY_NSHumanReadableCopyright: '""',
  IPHONEOS_DEPLOYMENT_TARGET: "14.0",
  LD_RUNPATH_SEARCH_PATHS:
    '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"',
  MARKETING_VERSION: "1.0",
  MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE",
  MTL_FAST_MATH: "YES",
  PRODUCT_NAME: '"$(TARGET_NAME)"',
  SKIP_INSTALL: "YES",
  SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG",
  SWIFT_EMIT_LOC_STRINGS: "YES",
  SWIFT_OPTIMIZATION_LEVEL: "-Onone",
  SWIFT_VERSION: "5.0",
  TARGETED_DEVICE_FAMILY: '"1"',
}

export const withWidgetXCode: ConfigPlugin<WithWidgetProps> = (
  config,
  options: WithWidgetProps,
) => {
  return withXcodeProject(config, async newConfig => {
    try {
      const projectName = newConfig.modRequest.projectName
      const projectPath = newConfig.modRequest.projectRoot
      const platformProjectPath = newConfig.modRequest.platformProjectRoot
      const widgetSourceDirPath = path.join(
        projectPath,
        "widget",
        "ios",
        "widget",
      )
      const bundleId = config.ios?.bundleIdentifier || ""
      const widgetBundleId = `${bundleId}.widget`

      const extensionFilesDir = path.join(
        platformProjectPath,
        EXTENSION_TARGET_NAME,
      )
      fs.copySync(widgetSourceDirPath, extensionFilesDir)

      const projPath = `${newConfig.modRequest.platformProjectRoot}/${projectName}.xcodeproj/project.pbxproj`
      await updateXCodeProj(projPath, widgetBundleId, options.devTeamId)
      return newConfig
    } catch (e) {
      console.error(e)
      throw e
    }
  })
}

async function updateXCodeProj(
  projPath: string,
  widgetBundleId: string,
  developmentTeamId: string,
) {
  const xcodeProject = xcode.project(projPath)

  xcodeProject.parse(() => {
    const pbxGroup = xcodeProject.addPbxGroup(
      TOP_LEVEL_FILES,
      EXTENSION_TARGET_NAME,
      EXTENSION_TARGET_NAME,
    )

    // Add the new PBXGroup to the top level group. This makes the
    // files / folder appear in the file explorer in Xcode.
    const groups = xcodeProject.hash.project.objects.PBXGroup
    Object.keys(groups).forEach(function (groupKey) {
      if (groups[groupKey].name === undefined) {
        xcodeProject.addToPbxGroup(pbxGroup.uuid, groupKey)
      }
    })

    // // WORK AROUND for codeProject.addTarget BUG
    // // Xcode projects don't contain these if there is only one target
    // // An upstream fix should be made to the code referenced in this link:
    // //   - https://github.com/apache/cordova-node-xcode/blob/8b98cabc5978359db88dc9ff2d4c015cba40f150/lib/pbxProject.js#L860
    const projObjects = xcodeProject.hash.project.objects
    projObjects["PBXTargetDependency"] =
      projObjects["PBXTargetDependency"] || {}
    projObjects["PBXContainerItemProxy"] =
      projObjects["PBXTargetDependency"] || {}

    // // add target
    const widgetTarget = xcodeProject.addTarget(
      EXTENSION_TARGET_NAME,
      "app_extension",
      EXTENSION_TARGET_NAME,
      widgetBundleId,
    )

    // add build phase
    xcodeProject.addBuildPhase(
      ["widget.swift"],
      "PBXSourcesBuildPhase",
      "Sources",
      widgetTarget.uuid,
      undefined,
      "widget",
    )
    xcodeProject.addBuildPhase(
      ["SwiftUI.framework", "WidgetKit.framework"],
      "PBXFrameworksBuildPhase",
      "Frameworks",
      widgetTarget.uuid,
    )
    const resourcesBuildPhase = xcodeProject.addBuildPhase(
      ["Assets.xcassets"],
      "PBXResourcesBuildPhase",
      "Resources",
      widgetTarget.uuid,
      undefined,
      "widget",
    )

    /* Update build configurations */
    const configurations = xcodeProject.pbxXCBuildConfigurationSection()

    for (const key in configurations) {
      if (typeof configurations[key].buildSettings !== "undefined") {
        const productName = configurations[key].buildSettings.PRODUCT_NAME
        if (productName === `"${EXTENSION_TARGET_NAME}"`) {
          configurations[key].buildSettings = {
            ...configurations[key].buildSettings,
            ...BUILD_CONFIGURATION_SETTINGS,
            DEVELOPMENT_TEAM: developmentTeamId,
            PRODUCT_BUNDLE_IDENTIFIER: widgetBundleId,
          }
        }
      }
    }

    fs.writeFileSync(projPath, xcodeProject.writeSync())
  })
}
