import {
  AndroidConfig,
  ConfigPlugin,
  withAndroidManifest,
} from "@expo/config-plugins"

export const withWidgetManifest: ConfigPlugin = config => {
  return withAndroidManifest(config, async newConfig => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      newConfig.modResults,
    )
    const widgetReceivers = await buildWidgetsReceivers()
    mainApplication.receiver = widgetReceivers

    return newConfig
  })
}

async function buildWidgetsReceivers() {
  return [
    {
      $: {
        "android:name": ".SampleWidget",
        "android:exported": "false" as const,
      },
      "intent-filter": [
        {
          action: [
            {
              $: {
                "android:name": "android.appwidget.action.APPWIDGET_UPDATE",
              },
            },
          ],
        },
      ],
      "meta-data": [
        {
          $: {
            "android:name": "android.appwidget.provider",
            "android:resource": "@xml/sample_widget_info",
          },
        },
      ],
    },
  ]
  /*
    <receiver
        android:name=".SampleWidget"
        android:exported="false">
        <intent-filter>
            <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
        </intent-filter>

        <meta-data
            android:name="android.appwidget.provider"
            android:resource="@xml/sample_widget_info" />
    </receiver>
   */
}
