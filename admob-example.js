/* مثال عملي لتكامل AdMob مع Capacitor
   - يستخدم معرفات إعلانات الاختبار من Google (لا تستخدمها في أصل الإنتاج)
   - تثبيت: npm install capacitor-admob
   - ثم: npx cap sync android
   - استدعِ الدوال التالية بعد أن يكون التطبيق على جهاز Android (بعد npx cap open android و build)
*/

// إذا كنت تستخدم bundler/module system
// import { AdMob } from 'capacitor-admob';

// إذا لم يكن لديك import (مثلاً تستخدم require/bundler)، عدّل حسب بيئتك.

const AdMobExample = {
  bannerId: 'ca-app-pub-3940256099942544/6300978111', // معرف إعلان بانر تجريبي
  interstitialId: 'ca-app-pub-3940256099942544/1033173712', // معرف إنترستيشيال تجريبي
  rewardedId: 'ca-app-pub-3940256099942544/5224354917', // معرف إعلان مكافأة تجريبي

  async init() {
    try {
      if (!window.Capacitor) {
        console.warn('Capacitor غير متاح - AdMob يعمل فقط على الجهاز');
        return;
      }

      const { AdMob } = Capacitor.Plugins || window.Capacitor?.Plugins || {};
      if (!AdMob) {
        console.warn('لا يوجد plugin AdMob مثبت. تأكد من تثبيت capacitor-admob ومزامنته.');
        return;
      }

      await AdMob.initialize();
      console.log('AdMob initialized');
    } catch (e) {
      console.error('خطأ تهيئة AdMob', e);
    }
  },

  async showBanner() {
    try {
      const { AdMob } = Capacitor.Plugins || window.Capacitor?.Plugins || {};
      if (!AdMob) return;
      await AdMob.showBanner({
        adId: this.bannerId,
        position: 'BOTTOM_CENTER',
        margin: 0
      });
      console.log('Banner shown');
    } catch (e) {
      console.error('خطأ عرض Banner', e);
    }
  },

  async hideBanner() {
    try {
      const { AdMob } = Capacitor.Plugins || window.Capacitor?.Plugins || {};
      if (!AdMob) return;
      await AdMob.hideBanner();
      console.log('Banner hidden');
    } catch (e) {
      console.error('خطأ إخفاء Banner', e);
    }
  },

  async showInterstitial() {
    try {
      const { AdMob } = Capacitor.Plugins || window.Capacitor?.Plugins || {};
      if (!AdMob) return;
      await AdMob.prepareInterstitial({ adId: this.interstitialId });
      const res = await AdMob.showInterstitial();
      console.log('Interstitial result', res);
    } catch (e) {
      console.error('خطأ Interstitial', e);
    }
  },

  async showRewarded() {
    try {
      const { AdMob } = Capacitor.Plugins || window.Capacitor?.Plugins || {};
      if (!AdMob) return;
      await AdMob.prepareRewardVideoAd({ adId: this.rewardedId });
      const res = await AdMob.showRewardVideoAd();
      console.log('Rewarded result', res);
    } catch (e) {
      console.error('خطأ Rewarded', e);
    }
  }
};

// مثال استخدام: استدعِ AdMobExample.init() عند deviceready، ثم showBanner عندما يحتاج التطبيق
if (typeof document !== 'undefined') {
  document.addEventListener('deviceready', () => {
    AdMobExample.init();
  });
}

// Expose for debugging in webview console
window.AdMobExample = AdMobExample;
