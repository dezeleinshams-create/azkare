What this does

This repository currently did not contain a Flutter project root (no pubspec.yaml). The included batch script `setup-flutter.bat` automates basic steps to initialize and build a Flutter APK on Windows.

How to use

1. Open PowerShell or Command Prompt.
2. Change directory to this repo:

```powershell
cd C:\Users\Geforce\Desktop\azkare
```

3. Run one of the scripts:

- Quick automated setup and build (creates project then builds):

```powershell
.\setup-flutter.bat
```

- Build, log, and copy APK to your Desktop (recommended once `pubspec.yaml` exists):

```powershell
.\build-and-package.bat
```

What the script does

- Runs `flutter doctor -v` to verify Flutter is installed and on PATH.
- Runs `flutter create .` to initialize a Flutter project in the current folder (creates `pubspec.yaml`, `lib/`, `android/`, etc.).
- Runs `flutter build apk --release` to build a release APK.

Notes and next steps

- You must have Flutter SDK installed and `flutter` available in PATH. If `flutter doctor -v` reports problems, follow its guidance before re-running the script.
- If you already have an existing Flutter project elsewhere, it's safer to `cd` into that project's root (where `pubspec.yaml` is) and run `flutter build apk --release` instead of initializing a new one here.
- After a successful build, the APK will be at `build/app/outputs/flutter-apk/`.

- After a successful run of `build-and-package.bat`, a copy of the release APK
	will be on your Desktop named `build-and-package-app-release.apk` (or similar).


If the script fails, copy the terminal output and paste it here and I will diagnose further.