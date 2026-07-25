const { withAndroidManifest } = require('@expo/config-plugins')

// Requests a larger memory ceiling from Android so the app is less likely to
// be killed by the OS's low-memory process reclaim while the native camera
// activity (launched by expo-image-picker) is in the foreground — the
// heaviest moment in the inspection/reference-photo capture flows. This
// reduces, but can't fully eliminate, that risk: a full process kill during
// the camera activity happens before any JS code regains control, so no app
// logic can recover from it.
module.exports = function withLargeHeap(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0]
    if (application) {
      application.$['android:largeHeap'] = 'true'
    }
    return config
  })
}
