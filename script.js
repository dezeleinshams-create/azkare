// إدارة الأذكار والبيانات
let bookmarks = JSON.parse(localStorage.getItem('azkaar-bookmarks')) || [];
let soundEnabled = true;
let prayerCity = localStorage.getItem('prayer-city') || 'cairo';

// بيانات أوقات الصلاة للمدن المختلفة
const prayerTimesData = {
    cairo: { fajr: '04:55', sunrise: '06:22', dhuhr: '12:25', asr: '15:52', maghrib: '18:27', isha: '20:00' },
    riyadh: { fajr: '05:00', sunrise: '06:30', dhuhr: '12:30', asr: '15:45', maghrib: '18:10', isha: '19:40' },
    dubai: { fajr: '05:10', sunrise: '06:40', dhuhr: '12:35', asr: '15:55', maghrib: '18:25', isha: '19:55' },
    amman: { fajr: '04:50', sunrise: '06:20', dhuhr: '12:22', asr: '15:50', maghrib: '18:25', isha: '19:55' }
};

// تبديل التابات
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// نطق الأذكار
function speakAzkar(btn) {
    const card = btn.closest('.adkar-card');
    const text = card.querySelector('.arabic-text')?.textContent || '';
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.pitch = 1;
    
    if (synth.speaking) {
        synth.cancel();
        btn.style.opacity = '1';
        return;
    }
    
    btn.style.opacity = '0.5';
    synth.speak(utterance);
    
    utterance.onend = () => {
        btn.style.opacity = '1';
        incrementRepeatCount(card);
    };
}

// زيادة عداد التكرار
function incrementRepeatCount(card) {
    const countElement = card.querySelector('.count');
    const maxMatch = card.querySelector('.repeat-count')?.textContent.match(/\/(\d+)/);
    const max = maxMatch ? parseInt(maxMatch[1]) : 1;
    let current = parseInt(countElement.textContent) || 0;
    current = (current + 1) % (max + 1);
    countElement.textContent = current;
}

// حفظ الأذكار المفضلة
function toggleBookmark(btn) {
    const card = btn.closest('.adkar-card');
    const title = card.querySelector('h3')?.textContent || '';
    const text = card.querySelector('.arabic-text')?.textContent || '';
    
    const isBookmarked = btn.textContent === '❤️';
    
    if (isBookmarked) {
        btn.textContent = '🤍';
        card.classList.remove('bookmarked');
        bookmarks = bookmarks.filter(b => b.text !== text);
    } else {
        btn.textContent = '❤️';
        card.classList.add('bookmarked');
        if (!bookmarks.find(b => b.text === text)) {
            bookmarks.push({ title, text, timestamp: new Date().toLocaleString('ar-SA') });
        }
    }
    
    localStorage.setItem('azkaar-bookmarks', JSON.stringify(bookmarks));
    updateBookmarksList();
}

// تحديث قائمة المحفوظات
function updateBookmarksList() {
    const bookmarksList = document.getElementById('bookmarks-list');
    
    if (bookmarks.length === 0) {
        bookmarksList.innerHTML = '<p class="empty-message">لا توجد أذكار محفوظة حالياً</p>';
        return;
    }
    
    bookmarksList.innerHTML = bookmarks.map((bookmark, index) => `
        <div class="bookmark-item">
            <div class="bookmark-item-title">${bookmark.title}</div>
            <div class="bookmark-item-text">${bookmark.text}</div>
            <button class="remove-bookmark-btn" onclick="removeBookmark(${index})">
                حذف من المحفوظات
            </button>
        </div>
    `).join('');
}

// إزالة من المحفوظات
function removeBookmark(index) {
    const removedBookmark = bookmarks[index];
    bookmarks.splice(index, 1);
    localStorage.setItem('azkaar-bookmarks', JSON.stringify(bookmarks));
    
    document.querySelectorAll('.adkar-card').forEach(card => {
        const text = card.querySelector('.arabic-text')?.textContent || '';
        const btn = card.querySelector('.bookmark-btn');
        if (text === removedBookmark.text) {
            btn.textContent = '🤍';
            card.classList.remove('bookmarked');
        }
    });
    
    updateBookmarksList();
}

// تفعيل الإشعارات
function enableNotifications() {
    if (!('Notification' in window)) {
        alert('متصفحك لا يدعم الإشعارات');
        return;
    }
    
    if (Notification.permission === 'granted') {
        showNotification('تم تفعيل الإشعارات', 'سيتم تنبيهك بالأذكار في الأوقات المحددة');
        document.getElementById('notificationBtn').textContent = '✓ الإشعارات مفعلة';
        document.getElementById('notificationBtn').style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('تم تفعيل الإشعارات', 'سيتم تنبيهك بالأذكار في الأوقات المحددة');
                document.getElementById('notificationBtn').textContent = '✓ الإشعارات مفعلة';
                document.getElementById('notificationBtn').style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            }
        });
    }
}

// عرض إشعار
function showNotification(title, body) {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body: body,
            icon: '🌙',
            badge: '🕌'
        });
    }
}

// تشغيل الأذان
function playAdhhan() {
    const btn = document.getElementById('playAdhhanBtn');
    btn.style.opacity = '0.5';
    
    // محاكاة تشغيل الأذان
    const synth = window.speechSynthesis;
    const adhhanText = 'الله أكبر الله أكبر، أشهد أن لا إله إلا الله، أشهد أن محمداً رسول الله، حي على الصلاة، حي على الفلاح، الله أكبر الله أكبر، لا إله إلا الله';
    
    const utterance = new SpeechSynthesisUtterance(adhhanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.9;
    
    synth.speak(utterance);
    
    utterance.onend = () => {
        btn.style.opacity = '1';
        showNotification('انتهى الأذان', 'حان وقت الصلاة');
    };
}

// تبديل الإعدادات
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.classList.toggle('active');
}

// تغيير مدينة الصلاة
function changePrayerCity() {
    const city = document.getElementById('citySelect').value;
    prayerCity = city;
    localStorage.setItem('prayer-city', city);
    updatePrayerTimes();
}

// تحديث أوقات الصلاة
function updatePrayerTimes() {
    const times = prayerTimesData[prayerCity];
    const prayers = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
    const timesArray = Object.values(times);
    
    const cards = document.querySelectorAll('.prayer-time-card');
    cards.forEach((card, index) => {
        const timeElement = card.querySelector('.prayer-time');
        timeElement.textContent = timesArray[index];
    });
}

// تحديث الوقت الحالي
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    const timeDisplay = document.getElementById('currentTime');
    if (timeDisplay) {
        timeDisplay.textContent = timeString;
    }
}

// إضافة الوضع الليلي
document.addEventListener('DOMContentLoaded', () => {
    const darkModeCheckbox = document.getElementById('darkMode');
    if (darkModeCheckbox) {
        const isDarkMode = localStorage.getItem('dark-mode') === 'true';
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            darkModeCheckbox.checked = true;
        }
        
        darkModeCheckbox.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', document.body.classList.contains('dark-mode'));
        });
    }

    const soundCheckbox = document.getElementById('soundToggle');
    if (soundCheckbox) {
        soundEnabled = localStorage.getItem('sound-enabled') !== 'false';
        soundCheckbox.checked = soundEnabled;
        soundCheckbox.addEventListener('change', () => {
            soundEnabled = soundCheckbox.checked;
            localStorage.setItem('sound-enabled', soundEnabled);
        });
    }

    // تهيئة التابات
    initTabs();
    
    // تحديث أوقات الصلاة
    updatePrayerTimes();
    
    // تحديث أيقونات القلب
    document.querySelectorAll('.adkar-card').forEach(card => {
        const text = card.querySelector('.arabic-text')?.textContent || '';
        const btn = card.querySelector('.bookmark-btn');
        
        if (bookmarks.find(b => b.text === text)) {
            btn.textContent = '❤️';
            card.classList.add('bookmarked');
        }
    });
    
    updateBookmarksList();
    
    // تحديث الوقت كل ثانية
    setInterval(updateCurrentTime, 1000);
    updateCurrentTime();
    
    // إضافة تنبيهات أوقات الصلاة
    setInterval(checkPrayerTime, 60000);
});

// فحص أوقات الصلاة
function checkPrayerTime() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const times = prayerTimesData[prayerCity];
    const prayers = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
    
    Object.keys(times).forEach((key, index) => {
        if (times[key] === currentTime) {
            showNotification(`حان وقت ${prayers[index]}`, `الآن تمام الساعة ${times[key]}`);
        }
    });
}

// إصلاح مشكلة الإيقاف التلقائي للكلام
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
});

// وظيفة مشاركة التطبيق: تحاول واجهة Web Share ثم تنسخ الرابط للحافظة كاحتياط
function shareApp() {
    const shareData = {
        title: 'أذكار الصباح والمساء',
        text: 'جرب تطبيق أذكار الصباح والمساء - بسيط وخفيف',
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(() => {
            navigator.clipboard.writeText(window.location.href).then(()=> alert('تم نسخ رابط التطبيق، أرسله لأصدقائك'));
        });
    } else {
        navigator.clipboard.writeText(window.location.href).then(()=> alert('تم نسخ رابط التطبيق، أرسله لأصدقائك'));
    }
}

// تسجيل Service Worker لجعل التطبيق PWA وقابل للتثبيت
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service Worker requires a secure origin (https) or localhost.
        // Avoid registering when opening the file via file:// (origin 'null').
        const allowed = (location.protocol === 'https:' || location.protocol === 'http:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
        if (!allowed) {
                console.warn('Service Worker not registered: serve the app over http(s) or localhost (currently', location.protocol + '//' + location.hostname + ')');
                // Show visible warning for users opening the file directly
                try {
                    const warn = document.getElementById('fileOriginWarning');
                    if (warn) warn.style.display = 'block';
                } catch (e) {}
            return;
        }

        const swPath = './service-worker.js';
        navigator.serviceWorker.register(swPath).catch(err => {
            console.warn('Service Worker registration failed:', err);
        });
    });
}

// تهيئة عنصر الإعلان الوهمي (يُستبدل بشيفرة AdMob/AdSense عند التحزيم)
function initAdPlaceholder() {
    const ad = document.getElementById('adBanner');
    if (!ad) return;
    // عرض رسالة تذكير للمطورين لاستبدال هذا العنصر بإعلان حقيقي
    ad.querySelector('.ad-placeholder').textContent = 'إمكانك استبدال هذا المكان بشيفرة إعلان بعد إعداد AdMob/AdSense';
}

document.addEventListener('DOMContentLoaded', initAdPlaceholder);

/* --------- Payment UI and helpers (Stripe + PayPal examples) --------- */
function openPaymentsModal() {
    const modal = document.getElementById('paymentsModal');
    if (modal) {
        modal.style.display = 'block';
        // lazy-load PayPal SDK
        initPayPal();
    }
}

function closePaymentsModal() {
    const modal = document.getElementById('paymentsModal');
    if (modal) modal.style.display = 'none';
}

// Stripe Checkout example: requests server to create a Checkout Session
async function startStripeCheckout() {
    try {
        const res = await fetch('/create-checkout-session', { method: 'POST' });
        if (!res.ok) throw new Error('فشل إنشاء جلسة الدفع');
        const data = await res.json();
        if (data.url) {
            // Redirect user to Stripe Checkout
            window.location.href = data.url;
        }
    } catch (e) {
        alert('خطأ أثناء بدء الدفع: ' + e.message);
    }
}

// PayPal Buttons (client-side) using client-id only (uses PayPal's checkout popup)
function initPayPal() {
    if (document.getElementById('paypal-button-container').children.length > 0) return; // already loaded

    const scriptId = 'paypal-sdk';
    if (!document.getElementById(scriptId)) {
        const s = document.createElement('script');
        s.id = scriptId;
        // Replace YOUR_PAYPAL_CLIENT_ID with your real client id when ready
        s.src = 'https://www.paypal.com/sdk/js?client-id=YOUR_PAYPAL_CLIENT_ID&currency=USD';
        s.onload = () => renderPayPalButtons();
        document.head.appendChild(s);
    } else {
        renderPayPalButtons();
    }
}

function renderPayPalButtons() {
    if (!window.paypal) {
        console.warn('PayPal SDK not available');
        return;
    }

    window.paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{ amount: { value: '1.00' } }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('تمت العملية، شكراً ' + details.payer.name.given_name);
            });
        },
        onError: function(err) {
            console.error(err);
            alert('حدث خطأ في PayPal: ' + err);
        }
    }).render('#paypal-button-container');
}

// Expose payment functions for manual testing
window.openPaymentsModal = openPaymentsModal;
window.closePaymentsModal = closePaymentsModal;
window.startStripeCheckout = startStripeCheckout;
window.startSubscription = startSubscription;

// In-App Purchase (IAP) / Subscription starter function
async function startSubscription() {
    // This function attempts to use a Capacitor/Cordova IAP plugin when available.
    // For Android (Capacitor) you can install: cordova-plugin-purchase (aka in-app-purchase)
    // or use native billing plugins. This is a safe fallback for web.
    if (window.Capacitor && window.Capacitor.Plugins) {
        // If you added a native IAP plugin, call it here. Example placeholder:
        try {
            // Example: call plugin method (replace with actual plugin API)
            const result = await Capacitor.Plugins.InAppPurchase?.purchase({ productId: 'monthly_subscription' });
            console.log('IAP result', result);
            alert('تم بدء عملية الشراء على الجهاز');
            return;
        } catch (e) {
            console.warn('IAP native error', e);
        }
    }

    // Web fallback: redirect to Stripe Checkout for recurring payment, or show instructions
    if (confirm('جهازك لا يدعم الشراء داخل التطبيق هنا. هل تريد الدفع عبر Stripe كبديل للاشتراك؟')) {
        startStripeCheckout();
    } else {
        alert('يمكنك تثبيت التطبيق من المتجر لاستخدام عمليات الشراء داخل التطبيق.');
    }
}

