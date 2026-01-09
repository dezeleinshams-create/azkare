import 'package:flutter/material.dart';
import 'dart:async';
import 'package:adhan/adhan.dart' as adhan; // تعديل السطر 410
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:timezone/data/latest_all.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
    FlutterLocalNotificationsPlugin();

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  tz.initializeTimeZones();
  await NotificationService().init();
  runApp(const AzkareApp());
}

class NotificationService {
  Future<void> init() async {
    const AndroidInitializationSettings initializationSettingsAndroid =
        AndroidInitializationSettings('@mipmap/ic_launcher');
    const InitializationSettings initializationSettings =
        InitializationSettings(android: initializationSettingsAndroid);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  Future<void> requestPermissions() async {
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >()
        ?.createNotificationChannel(
          const AndroidNotificationChannel(
            'adhan_channel',
            'Adhan Notifications',
            importance: Importance.max,
          ),
        );
  }

  // تصليح أخطاء السطور 83 و 84 و 87
  Future<void> scheduleAzkarNotifications() async {
    await _scheduleRecurringNotification(
      5,
      'أذكار الصباح',
      'لا تنسى قراءة أذكار الصباح',
      7,
      0,
    );
    await _scheduleRecurringNotification(
      6,
      'أذكار المساء',
      'لا تنسى قراءة أذكار المساء',
      19,
      0,
    );
  }

  Future<void> _scheduleRecurringNotification(
    int id,
    String title,
    String body,
    int hour,
    int minute,
  ) async {
    await flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      _nextInstanceOfTime(hour, minute),
      const NotificationDetails(
        android: AndroidNotificationDetails('azkar_channel', 'Azkar'),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  // تصليح خطأ السطر 107
  tz.TZDateTime _nextInstanceOfTime(int hour, int minute) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }

  Future<void> scheduleNotifications(PrayerTimesData prayerTimes) async {
    await _scheduleAdhan(0, 'الفجر', prayerTimes.fajr);
    await _scheduleAdhan(1, 'الظهر', prayerTimes.dhuhr);
    await _scheduleAdhan(2, 'العصر', prayerTimes.asr);
    await _scheduleAdhan(3, 'المغرب', prayerTimes.maghrib);
    await _scheduleAdhan(4, 'العشاء', prayerTimes.isha);
  }

  Future<void> _scheduleAdhan(int id, String name, DateTime time) async {
    await flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      'أذان $name',
      'حان الآن موعد الصلاة',
      tz.TZDateTime.from(time, tz.local),
      const NotificationDetails(
        android: AndroidNotificationDetails('adhan_channel', 'Adhan'),
      ),
      androidScheduleMode: AndroidScheduleMode.exactAllowWhileIdle,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }
}

class AzkareApp extends StatelessWidget {
  const AzkareApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.teal),
      home: const AzkareHome(),
    );
  }
}

class AzkareHome extends StatefulWidget {
  const AzkareHome({super.key});
  @override
  State<AzkareHome> createState() => _AzkareHomeState();
}

class _AzkareHomeState extends State<AzkareHome> {
  final AudioPlayer _audioPlayer = AudioPlayer();
  final List<Map<String, String>> _azkar = [
    {
      'id': '1',
      'title': 'بسم الله',
      'text': 'بسم الله الرحمن الرحيم',
      'audio': 'morning_azkar.mp3',
    },
  ];

  @override
  void initState() {
    super.initState();
    NotificationService().requestPermissions();
    NotificationService().scheduleAzkarNotifications();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: const Text('أذكاري'),
          bottom: const TabBar(
            tabs: [
              Tab(text: 'الأذكار'),
              Tab(text: 'المواقيت'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            ListView(
              children: _azkar
                  .map(
                    (a) => ListTile(
                      title: Text(a['title']!),
                      subtitle: Text(a['text']!),
                      trailing: IconButton(
                        icon: const Icon(Icons.volume_up),
                        onPressed: () => _audioPlayer.play(
                          AssetSource('audio/${a['audio']}'),
                        ),
                      ),
                    ),
                  )
                  .toList(),
            ),
            const PrayerTimesView(),
          ],
        ),
      ),
    );
  }
}

class PrayerTimesView extends StatelessWidget {
  const PrayerTimesView({super.key});
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<PrayerTimesData>(
      future: _getPrayerTimes(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Center(child: CircularProgressIndicator());
        }
        final p = snapshot.data!;
        return ListView(
          children: [
            ListTile(
              title: const Text('الفجر'),
              trailing: Text(DateFormat.jm().format(p.fajr)),
            ),
            ListTile(
              title: const Text('الظهر'),
              trailing: Text(DateFormat.jm().format(p.dhuhr)),
            ),
            ListTile(
              title: const Text('العصر'),
              trailing: Text(DateFormat.jm().format(p.asr)),
            ),
            ListTile(
              title: const Text('المغرب'),
              trailing: Text(DateFormat.jm().format(p.maghrib)),
            ),
            ListTile(
              title: const Text('العشاء'),
              trailing: Text(DateFormat.jm().format(p.isha)),
            ),
          ],
        );
      },
    );
  }
}

// تصليح خطأ السطر 410
Future<PrayerTimesData> _getPrayerTimes() async {
  final myCoordinates = adhan.Coordinates(30.0444, 31.2357);
  final params = adhan.CalculationMethod.egyptian.getParameters();
  final prayerTimes = adhan.PrayerTimes(myCoordinates, adhan.DateComponents(DateTime.now().year, DateTime.now().month, DateTime.now().day), params);

  final data = PrayerTimesData(
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  );
  await NotificationService().scheduleNotifications(data);
  return data;
}

class PrayerTimesData {
  final DateTime fajr, sunrise, dhuhr, asr, maghrib, isha;
  PrayerTimesData({
    required this.fajr,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
  });
}
