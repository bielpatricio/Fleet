import * as dotenv from 'dotenv'

dotenv.config()

module.exports = {
  expo: {
    name: 'fleet',
    slug: 'fleet',
    scheme: 'fleet',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'dark',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'cover',
      backgroundColor: '#202024',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bielpatricio.fleet',
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
      infoPlist: {
        UIBackgroundModes: ['location'],
      },
    },
    android: {
      package: 'com.bielpatricio.fleet',
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'ACCESS_BACKGROUND_LOCATION',
      ],
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#202024',
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow $(PRODUCT_NAME) to use your location.',
        },
      ],
    ],
  },
}
