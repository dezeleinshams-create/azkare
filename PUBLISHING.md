خطوات سريعة لتحزيم التطبيق، إضافة إعلانات، ونشره على Google Play

1) تحويل التطبيق إلى PWA (مُنجز جزئياً)
- تأكد من وجود `manifest.json` و `service-worker.js` (موجودان الآن).
- اختبر PWA محلياً عبر HTTP (لا تعمل PWA على `file://`).

2) إنشاء حزمة Android (مناسب لعرض الإعلانات عبر AdMob)
خيار أ (تـوليد TWA عبر PWABuilder / Bubblewrap):
- استخدم https://pwabuilder.com إن أردت توليد مشروع Android (TWA) سريعاً.
- بعد توليد المشروع، افتح المشروع في Android Studio.

خيار ب (Capacitor - يفضل إن أردت مداخلّة Native بسهولة):
- ثبت Node + npm، ثم نفّذ في مجلد المشروع:

```bash
npm init -y
npm install @capacitor/cli @capacitor/core
npx cap init azkare com.example.azkare
npx cap add android
npx cap copy android
```
- افتح المشروع `android` في Android Studio.

3) إضافة إعلانات AdMob (داخل مشروع Android native)
- أضف الاعتماديات في `app/build.gradle`:

```gradle
implementation 'com.google.android.gms:play-services-ads:22.2.0'
```
- اتبع دليل AdMob لتهيئة `MobileAds.initialize(this)` وادراج Banner/Interstitial/Rewarded داخل الـ Activity.
- إذا كنت تستخدم Capacitor أو TWA، استخدم plugin مناسب (مثلاً `capacitor-admob` أو `cordova-plugin-admob`) وراجع التوثيق لاستخدامه مع AndroidX.

4) إعدادات Google Play
- سجّل حساب مطور Google Play (مرة واحدة، برسوم تسجيل).
- أنشئ تطبيقاً جديداً، املأ البيانات (اسم، وصف، صور، فئة).
- أرفق ملف AAB (مفضل) أو APK، املأ تقييم المحتوى، سياسة الخصوصية، تفاصيل الإعلان.
- استخدم Internal testing لمشاركة التطبيق مع أصدقائك قبل الإصدار العام.

5) مشاركة التطبيق مع الأصدقاء
- طريقة سريعة: استخدم Internal testing في Google Play (يمكنك إضافة إيميلات أو إنشاء رابط اختبار داخلي).
- بديل: شارك ملف `apk` أو `aab` مباشرة عبر Google Drive أو Telegram/WhatsApp (تأكد من تفعيل "السماح بالتثبيت من مصادر غير معروفة" على هواتفهم).
- أفضل ممارسة: استخدم Firebase App Distribution لاختبارات بيتا خاصة.

ملاحظات مهمة
- لربح مستدام عبر الإعلانات: احترم سياسات AdMob وGoogle Play (المحتوى الحساس، الخصوصية، خلط الإعلانات بالمحتوى الديني يجب أن يكون ملتزماً بسياسات الشبكة).
- تحتاج إلى سياسة خصوصية: ضع رابط سياسة الخصوصية في صفحة المتجر.
- إن أردت، أستطيع:
  - إدراج مثال تكويد مبدئي لـ AdMob داخل مشروع Capacitor.
  - تهيئة ملف `README` وملفات أيقونات `icons/` وتهيئة `package.json` لو رغبت.

أمثلة سريعة: تكامل AdMob مع Capacitor (مخطط)

- تثبيت plugin شائع: `capacitor-admob` (راجع توثيق الإصدار في npm قبل الاستخدام):

```bash
npm install capacitor-admob
npx cap sync android
```

- مثال تهيئة واستدعاء من JavaScript (تشغيل عند فتح التطبيق على Android فقط):

```javascript
import { AdMob } from 'capacitor-admob';

async function initAds() {
  try {
    await AdMob.initialize();
    // Banner example
    await AdMob.showBanner({ adId: 'ca-app-pub-XXXXXXXXXXXXXXXX/BBBBBBBBBB', position: 'BOTTOM_CENTER' });
  } catch (e) {
    console.error('AdMob init error', e);
  }
}

document.addEventListener('deviceready', initAds);
```

- في حال استخدام TWA أو مشروع Native مباشرة، أضف معرف الإعلان (`adUnitId`) من حساب AdMob في الـ XML/Activity أو عبر كود Java/Kotlin وأتبَع خطوات تهيئة الـ SDK الرسمية.

ملاحظات قانونية وتقنية:
- أضف رابط `privacy-policy.html` في صفحة التطبيق ووفره في صفحة متجر Google Play.
- تأكد من الامتثال لقواعد عرض الإعلانات داخل التطبيقات الدينية وتجنّب وضع إعلانات بين نصوص دينية حساسة بطريقة قد تخالف سياسات AdMob.
- اختبر الإعلانات في وضع اختبار (test ads) قبل النشر لتجنب حظر الحساب.

Firebase / Google Analytics (مزامنة الويب وAndroid):

- لإضافة تتبع شامل استخدم Firebase Console:
  1. أنشئ مشروع في Firebase.
  2. أضف تطبيق ويب Web App واحصل على Measurement ID (G-XXXXXXX) وضعه داخل `index.html` كما في المثال.
  3. أضف تطبيق Android داخل نفس المشروع للحصول على `google-services.json` وأضفه لمجلد `android/app/` داخل مشروع Capacitor/Android.
  4. في Android Studio أضف اعتماديات Firebase Analytics واتبع خطوات الربط وفق توثيق Firebase.

- مثال مقتضب لتهيئة Firebase Analytics في الويب (index.html):

```html
<!-- استبدل الإعدادات بما يوفره Firebase console -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXX');
</script>
```

- تذكّر استخدام إعلانات اختبار على Android أثناء تطويرك، وأضف سياسة الخصوصية في صفحة التطبيق والـ Play Store.

مثال عملي كامل: تثبيت وتشغيل `capacitor-admob` (خطوات)

1) في جذر مشروعك:

```bash
npm install capacitor-admob
npx cap sync android
```

2) أضف كود الإعلان داخل مشروع الويب قبل بناءه (مثلاً في `admob-example.js`) أو ضمن ملفات JS الخاصة بالتطبيق. يوجد ملف مثال `admob-example.js` في المشروع.

3) افتح مشروع Android في Android Studio:

```bash
npx cap open android
```

4) بناء/تشغيل على جهاز حقيقي أو محاكي (يفضل جهاز حقيقي لاختبار AdMob). استخدم حساب مطور اختبار إن أمكن.

5) تأكد من استخدام معرفات الإعلانات الاختبارية أثناء التطوير:
- Banner test id: `ca-app-pub-3940256099942544/6300978111`
- Interstitial test id: `ca-app-pub-3940256099942544/1033173712`
- Rewarded test id: `ca-app-pub-3940256099942544/5224354917`

6) خطوات فحص سريعة:
- شغّل التطبيق على جهاز Android بعد بناءه من Android Studio.
- في Console راقب سجلات `AdMob initialized` و`Banner shown` أو أي أخطاء.

نقطة مهمة: لا تنشر معرفات الإعلانات الحقيقية في بيئة الاختبار. استخدم test ads ثم بدّلها بمعرفاتك الحقيقية عند الموافقة والاختبار النهائي.

ملفات مرفقة في المشروع:
- `admob-example.js` — مثال عملي جاهز للاستخدام داخل بيئة Capacitor.

- `iap-example.js` — مثال لتهيئة الشراء داخل التطبيق (cordova-plugin-purchase) وإرشادات التثبيت.
 - `iap-example.js` — مثال لتهيئة الشراء داخل التطبيق (cordova-plugin-purchase) وإرشادات التثبيت.
 - `native-billing-example.md` — مثال نيتف (Kotlin) لاستخدام `BillingClient` لاشتراكات Google Play.

Server-side verification:
- A sample Node server is available at `server/verify-subscription-server.js` to verify subscriptions using a Google Service Account. See `server/.env.example` for configuration.

