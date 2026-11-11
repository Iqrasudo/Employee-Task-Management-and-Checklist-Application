# Step 0 + Login — how to add these files

1. In VS Code (project `task-checklist`), DELETE the folder `src/app` (the Expo sample screens).
2. Copy the `src` folder from this zip into `task-checklist`, and choose "Replace" if asked.
3. In the terminal, install the fonts:

   npx expo install expo-font expo-splash-screen @expo-google-fonts/inter @expo-google-fonts/bricolage-grotesque @expo-google-fonts/ibm-plex-sans-arabic

4. Start with a clean cache:

   npx expo start -c

5. Test login:
   - Email: ayesha@company.com
   - Password: Password@123

## Folder structure

src/
  app/            screens (Expo Router: file name = screen)
    (auth)/       screens before login (login, set password, forgot password)
    (app)/        screens after login (home now; tabs next)
  components/ui/  shared building blocks (AppButton, AppTextInput, AppText, Logo)
  theme/          colors, fonts, spacing, animation timings
  services/       talks to the backend (mock for now)
  context/        logged-in user state
