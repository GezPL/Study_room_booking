const fs = require('fs');
const path = require('path');

const expoNotificationsBuild = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-notifications',
  'build'
);

function patchFile(fileName, searchPattern, replacement) {
  const filePath = path.join(expoNotificationsBuild, fileName);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchPattern)) {
      content = content.replace(searchPattern, replacement);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`[patch] Patched ${fileName}`);
    }
  }
}

// 1. TopicSubscriptionModule.android.js
patchFile(
  'TopicSubscriptionModule.android.js',
  "import { requireNativeModule } from 'expo-modules-core';\nexport default requireNativeModule('ExpoTopicSubscriptionModule');",
  "import { requireOptionalNativeModule } from 'expo-modules-core';\nexport default requireOptionalNativeModule('ExpoTopicSubscriptionModule');"
);

// 2. PushTokenManager.native.js
patchFile(
  'PushTokenManager.native.js',
  "import { requireNativeModule } from 'expo-modules-core';\nexport default requireNativeModule('ExpoPushTokenManager');",
  "import { requireOptionalNativeModule } from 'expo-modules-core';\nexport default requireOptionalNativeModule('ExpoPushTokenManager');"
);

// 3. ServerRegistrationModule.native.js
patchFile(
  'ServerRegistrationModule.native.js',
  "import { requireNativeModule } from 'expo-modules-core';\nexport default requireNativeModule('NotificationsServerRegistrationModule');",
  "import { requireOptionalNativeModule } from 'expo-modules-core';\nexport default requireOptionalNativeModule('NotificationsServerRegistrationModule');"
);

// 4. BackgroundNotificationTasksModule.native.js
patchFile(
  'BackgroundNotificationTasksModule.native.js',
  "import { requireNativeModule } from 'expo-modules-core';\nexport default requireNativeModule('ExpoBackgroundNotificationTasksModule');",
  "import { requireOptionalNativeModule } from 'expo-modules-core';\nexport default requireOptionalNativeModule('ExpoBackgroundNotificationTasksModule');"
);

// 5. warnOfExpoGoPushUsage.js
const warnFile = path.join(expoNotificationsBuild, 'warnOfExpoGoPushUsage.js');
if (fs.existsSync(warnFile)) {
  let content = fs.readFileSync(warnFile, 'utf8');
  if (content.includes("throw new Error(message);")) {
    content = content.replace("throw new Error(message);", "didWarn = true; console.warn(message);");
    fs.writeFileSync(warnFile, content, 'utf8');
    console.log('[patch] Patched warnOfExpoGoPushUsage.js');
  }
}

console.log('[patch] Finished patching expo-notifications native modules for Expo Go Android.');
