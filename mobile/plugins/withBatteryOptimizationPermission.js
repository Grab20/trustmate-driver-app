const { AndroidConfig, withAndroidManifest } = require('@expo/config-plugins')

// REQUEST_IGNORE_BATTERY_OPTIMIZATIONS is required before the app can show the
// system "allow this app to run in the background without battery
// restrictions" dialog. Without it, Android (Samsung devices especially) can
// silently kill the background location foreground service within minutes of
// the app leaving the foreground, with no error surfaced anywhere in the app —
// which looks exactly like "trip tracking doesn't work" to the driver.
module.exports = function withBatteryOptimizationPermission(config) {
  return withAndroidManifest(config, (config) => {
    // ensurePermissions mutates config.modResults in place and returns a
    // results map, not the manifest — reassigning modResults to that (or to
    // addPermission's undefined return) corrupts the manifest and breaks
    // prebuild entirely.
    AndroidConfig.Permissions.ensurePermissions(config.modResults, [
      'android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS',
    ])
    return config
  })
}
