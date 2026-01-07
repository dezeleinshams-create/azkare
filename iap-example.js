/* iap-example.js
   Guidance + example stubs for implementing In-App Purchases (IAP) / Subscriptions
   Works with Cordova/Capacitor on Android. This file does not install a plugin — it shows
   how to call the plugin API after installation.

   Recommended plugin (Cordova-compatible):
   - cordova-plugin-purchase (https://github.com/j3k0/cordova-plugin-purchase)
   Installation (inside Android/Capacitor project):
     npm install cordova-plugin-purchase
     npx cap sync android

   Example usage (after plugin is installed and app runs on device):
*/

const IAPExample = {
  productId: 'monthly_subscription', // replace with product id configured in Play Console

  // Initialize store and register products
  init: function() {
    if (!window.store) {
      console.warn('IAP plugin not available (window.store)');
      return;
    }

    store.verbosity = store.INFO;

    store.register({ id: this.productId, alias: 'اشتراك شهري', type: store.PAID_SUBSCRIPTION });

    store.ready(() => {
      console.log('Store ready, products:', store.get(this.productId));
    });

    store.refresh();

    store.when(this.productId).approved((order) => {
      console.log('Purchase approved', order);
      // finish the transaction
      order.finish();
      alert('تم تفعيل اشتراكك، شكراً لك');
    });

    store.error((err) => {
      console.error('Store error', err);
    });
  },

  buy: function() {
    if (!window.store) {
      alert('IAP غير متاح على بيئة المتصفح. اختبر على جهاز Android بعد تثبيت plugin.');
      return;
    }
    store.order(this.productId);
  }
};

// Expose for console testing
window.IAPExample = IAPExample;
