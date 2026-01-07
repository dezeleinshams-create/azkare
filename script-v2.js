// إدارة الأذكار والبيانات
let bookmarks = JSON.parse(localStorage.getItem('azkaar-bookmarks')) || [];
let soundEnabled = true;
let prayerCity = localStorage.getItem('prayer-city') || 'cairo';
let currentUtterance = null;

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

// نطق الأذكار - نسخة محسنة
function speakAzkar(btn) {
    try {
        const card = btn.closest('.adkar-card');
        if (!card) {
            console.error('لم يتم العثور على البطاقة');
            return;
        }
        
        const text = card.querySelector('.arabic-text')?.textContent || '';
        if (!text) {
            console.error('لا يوجد نص للنطق');
            return;
        }
        
        const synth = window.speechSynthesis;
        
        // إذا كان هناك كلام جاري، أيقفه
        if (synth.speaking || synth.pending) {
            synth.cancel();
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
            btn.textContent = '🔊';
            return;
        }
        
        // إنشاء utterance جديد
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        currentUtterance = utterance;
        
        // معالجات الأحداث
        utterance.onstart = () => {
            console.log('بدء النطق');
            btn.style.opacity = '0.5';
            btn.style.transform = 'scale(0.95)';
            btn.textContent = '⏸';
        };
        
        utterance.onend = () => {
            console.log('انتهى النطق');
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
            btn.textContent = '🔊';
            incrementRepeatCount(card);
            showNotification('✓ انتهى نطق الذكر', text.substring(0, 25) + '...');
        };
        
        utterance.onerror = (event) => {
            console.error('خطأ في النطق:', event.error);
            btn.style.opacity = '1';
            btn.style.transform = 'scale(1)';
            btn.textContent = '🔊';
            alert('❌ خطأ: ' + event.error + '\nتأكد من تفعيل الصوت في المتصفح');
        };
        
        // تشغيل الكلام
        synth.speak(utterance);
        console.log('تم إرسال الكلام للنطق');
        
    } catch (error) {
        console.error('استثناء في speakAzkar:', error);
        btn.style.opacity = '1';
        alert('حدث خطأ: ' + error.message);
    }
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
        showNotification('✓ تم تفعيل الإشعارات', 'سيتم تنبيهك بالأذكار في الأوقات المحددة');
        document.getElementById('notificationBtn').textContent = '✓ الإشعارات مفعلة';
        document.getElementById('notificationBtn').style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification('✓ تم تفعيل الإشعارات', 'سيتم تنبيهك بالأذكار في الأوقات المحددة');
                document.getElementById('notificationBtn').textContent = '✓ الإشعارات مفعلة';
                document.getElementById('notificationBtn').style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            }
        });
    }
}

// عرض إشعار
function showNotification(title, body) {
    try {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '🌙',
                badge: '🕌',
                tag: 'azkaar-notification'
            });
        }
    } catch (error) {
        console.error('خطأ في الإشعار:', error);
    }
}

// تشغيل الأذان - نسخة محسنة
function playAdhhan() {
    try {
        const btn = document.getElementById('playAdhhanBtn');
        if (!btn) return;
        
        const synth = window.speechSynthesis;
        
        if (synth.speaking || synth.pending) {
            synth.cancel();
            btn.style.opacity = '1';
            btn.textContent = '🎵 شغل الأذان';
            return;
        }
        
        btn.style.opacity = '0.5';
        btn.textContent = '⏸ جاري التشغيل...';
        
        const adhhanText = 'الله أكبر الله أكبر، الله أكبر الله أكبر، أشهد أن لا إله إلا الله، أشهد أن لا إله إلا الله، أشهد أن محمداً رسول الله، أشهد أن محمداً رسول الله، حي على الصلاة، حي على الصلاة، حي على الفلاح، حي على الفلاح، الله أكبر الله أكبر، لا إله إلا الله';
        
        const utterance = new SpeechSynthesisUtterance(adhhanText);
        utterance.lang = 'ar-SA';
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onend = () => {
            btn.style.opacity = '1';
            btn.textContent = '🎵 شغل الأذان';
            showNotification('📯 انتهى الأذان', 'حان وقت الصلاة والخشوع');
        };
        
        utterance.onerror = (event) => {
            console.error('خطأ في الأذان:', event.error);
            btn.style.opacity = '1';
            btn.textContent = '🎵 شغل الأذان';
            alert('خطأ في تشغيل الأذان: ' + event.error);
        };
        
        synth.speak(utterance);
        
    } catch (error) {
        console.error('خطأ في playAdhhan:', error);
        alert('حدث خطأ: ' + error.message);
    }
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
        if (timeElement) {
            timeElement.textContent = timesArray[index];
        }
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

// تهيئة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل الصفحة');
    
    // الوضع الليلي
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

    // التحكم بالصوت
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
    
    // فحص أوقات الصلاة كل دقيقة
    setInterval(checkPrayerTime, 60000);
    
    console.log('تم تهيئة التطبيق بنجاح');
});

// فحص أوقات الصلاة
function checkPrayerTime() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const times = prayerTimesData[prayerCity];
    const prayers = ['الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
    
    Object.keys(times).forEach((key, index) => {
        if (times[key] === currentTime) {
            showNotification(`🕌 حان وقت ${prayers[index]}`, `الآن تمام الساعة ${times[key]}`);
        }
    });
}

// إيقاف الكلام عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
});

// معالج أخطاء عام
window.addEventListener('error', (event) => {
    console.error('خطأ عام:', event.error);
});
