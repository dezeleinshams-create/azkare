# مثال تكامل Google Play Billing (Kotlin)

هذا الملف يوضح مثالاً عمليًا مبسّطًا لتهيئة مكتبة Google Play Billing داخل Activity باستخدام `BillingClient` لإدارة الاشتراكات.

ملاحظات قبل البدء:
- نفّذ البناء عبر Android Studio داخل مجلد `android` الناتج من Capacitor.
- أضف المنتجات (Subscriptions) في Google Play Console واحصل على معرف المنتج (مثلاً `monthly_subscription`).

1) اعتمد المكتبة في `app/build.gradle`:

```gradle
dependencies {
    implementation 'com.android.billingclient:billing-ktx:6.0.1'
}
```

2) مثال Activity (Kotlin):

```kotlin
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.android.billingclient.api.*

class BillingActivity : AppCompatActivity(), PurchasesUpdatedListener {
    private lateinit var billingClient: BillingClient
    private val SUBSCRIPTION_ID = "monthly_subscription" // ضع معرف المنتج هنا

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // setContentView(...) حسب تخطيطك

        billingClient = BillingClient.newBuilder(this)
            .setListener(this)
            .enablePendingPurchases()
            .build()

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingServiceDisconnected() {
                // حاول إعادة الاتصال لاحقاً
            }

            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    // جاهز؛ استعلم عن المنتجات المتاحة
                    queryAvailableProducts()
                }
            }
        })
    }

    private fun queryAvailableProducts() {
        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(
                listOf(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(SUBSCRIPTION_ID)
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build())
            ).build()

        billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
            if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                // احفظ productDetailsList لمعالجة الشراء لاحقاً
            }
        }
    }

    // استدعِ هذه الدالة لبدء عملية الشراء
    private fun startPurchaseFlow(productDetails: ProductDetails) {
        val productDetailsParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(productDetails)
            .build()

        val billingFlowParams = BillingFlowParams.newBuilder()
            .setProductDetailsParamsList(listOf(productDetailsParams))
            .build()

        billingClient.launchBillingFlow(this, billingFlowParams)
    }

    override fun onPurchasesUpdated(billingResult: BillingResult, purchases: MutableList<Purchase>?) {
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            for (purchase in purchases) {
                // تحقق من الشراء على الخادم (recommended) ثم قم بمنح المحتوى
                handlePurchase(purchase)
            }
        } else if (billingResult.responseCode == BillingClient.BillingResponseCode.USER_CANCELED) {
            // المستخدم ألغى
        } else {
            // خطأ
        }
    }

    private fun handlePurchase(purchase: Purchase) {
        // التحقق من التوقيع/التحقق عبر الخادم ثم منح الاشتراك أو حفظه
        if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
            if (!purchase.isAcknowledged) {
                val params = AcknowledgePurchaseParams.newBuilder()
                    .setPurchaseToken(purchase.purchaseToken)
                    .build()

                billingClient.acknowledgePurchase(params) { billingResult ->
                    // تعامل مع نتيجة الإقرار
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        billingClient.endConnection()
    }
}
```

3) اختبار الاشتراكات:
- استخدم حسابات اختبار (License Testing) في Play Console تحت إعدادات "License testing".
- استخدم Internal Testing في Play Console لتحميل نسخة AAB واختبار الشراء داخل التطبيق.

ملاحظات أمنية:
- تحقق دائمًا من صحة المشتريات عبر الخادم باستخدام Google Play Developer API أو التحقق من التوقيع.
- لا تمنح المحتوى قبل التحقق من صحة الشراء.

هذا المثال يوفّر نقطة انطلاق؛ أستطيع إنشاء ملف Kotlin كامل أو إرشادات ربطه مع Capacitor إذا رغبت.
