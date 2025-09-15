# TourShield App Icon Setup

## Required Icon Files

To complete the app setup, you need to provide the following icon files in the `assets/icons/` directory:

### Main App Icon
- **File**: `icon.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG with transparency support
- **Description**: This will be used as the main app icon on both iOS and Android

### Splash Screen Icon (Optional)
- **File**: `splash.png`
- **Size**: 1024x1024 pixels
- **Format**: PNG
- **Description**: This will be displayed on the splash screen

## Icon Requirements

### Design Guidelines
- **Shape**: Square with rounded corners (iOS/Android will handle rounding)
- **Background**: Should work well on both light and dark backgrounds
- **Content**: Should be recognizable at small sizes (down to 16x16 pixels)
- **Colors**: Should match your app's color scheme (#667eea, #764ba2, #f093fb)

### Technical Requirements
- **Format**: PNG with alpha channel support
- **Resolution**: High resolution (1024x1024 minimum)
- **File Size**: Under 1MB recommended
- **Transparency**: Supported

## How to Add Your Icon

1. **Prepare your icon image** (1024x1024 PNG)
2. **Save it as** `assets/icons/icon.png`
3. **Optionally save splash image as** `assets/icons/splash.png`
4. **Run the build command** to test

## Build Commands

After adding your icon files:

```bash
# For development
npx expo start

# For production build
eas build --platform all
```

## Current App Configuration

- **App Name**: TourShield
- **Bundle ID**: com.tourshield.app
- **Package Name**: com.tourshield.app
- **Icon Path**: ./assets/icons/icon.png
- **Splash Background**: #667eea (purple gradient)

## Troubleshooting

If you encounter icon-related errors:
1. Ensure the icon file exists at `assets/icons/icon.png`
2. Check that the file is a valid PNG image
3. Verify the file size is under 1MB
4. Make sure the image is square (1024x1024 recommended)

## Next Steps

1. Add your icon file to `assets/icons/icon.png`
2. Test with `npx expo start`
3. Build for production with `eas build`
