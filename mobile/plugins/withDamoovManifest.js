const { withAndroidManifest } = require('@expo/config-plugins')

// The Damoov Telematics SDK's own integration guide requires removing
// android:allowBackup="true" from <application> — Expo's own template sets
// it to true by default, and Damoov's SDK relies on that being off (its
// background-service/permission state isn't meant to survive an Android
// auto-backup/restore cycle onto a different device).
module.exports = function withDamoovManifest(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (application?.$?.['android:allowBackup'] !== undefined) {
      delete application.$['android:allowBackup']
    }
    return config
  })
}
