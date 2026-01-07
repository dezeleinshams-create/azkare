import 'package:flutter/material.dart';
import 'dart:async';
import 'package:adhan/adhan.dart';
import 'package:intl/intl.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:timezone/data/latest.dart' as tz;
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
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(const AndroidNotificationChannel(
          'adhan_channel', // id
          'Adhan Notifications', // title
          description: 'Channel for Adhan notifications', // description
          importance: Importance.max,
          sound: RawResourceAndroidNotificationSound('adhan'),
        ));
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(const AndroidNotificationChannel(
          'azkar_channel', // id
          'Azkar Notifications', // title
          description: 'Channel for Azkar notifications', // description
          importance: Importance.defaultImportance,
        ));
  }

  Future<void> scheduleNotifications(PrayerTimesData prayerTimes) async {
    await _scheduleNotification(0, 'الفجر', prayerTimes.fajr);
    await _scheduleNotification(1, 'الظهر', prayerTimes.dhuhr);
    await _scheduleNotification(2, 'العصر', prayerTimes.asr);
    await _scheduleNotification(3, 'المغرب', prayerTimes.maghrib);
    await _scheduleNotification(4, 'العشاء', prayerTimes.isha);
  }

  Future<void> _scheduleNotification(int id, String prayerName, DateTime time) async {
    await flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      'حان الآن وقت أذان $prayerName',
      '',
      tz.TZDateTime.from(time, tz.local),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'adhan_channel',
          'Adhan Notifications',
          channelDescription: 'Channel for Adhan notifications',
          sound: RawResourceAndroidNotificationSound('adhan'),
        ),
      ),
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  Future<void> scheduleAzkarNotifications() async {
    await _scheduleRecurringNotification(5, 'أذكار الصباح', 'لا تنسى قراءة أذكار الصباح', const Time(7, 0, 0));
    await _scheduleRecurringNotification(6, 'أذكار المساء', 'لا تنسى قراءة أذكار المساء', const Time(19, 0, 0));
  }

  Future<void> _scheduleRecurringNotification(int id, String title, String body, Time time) async {
    await flutterLocalNotificationsPlugin.zonedSchedule(
      id,
      title,
      body,
      _nextInstanceOfTime(time),
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'azkar_channel',
          'Azkar Notifications',
          channelDescription: 'Channel for Azkar notifications',
        ),
      ),
      androidAllowWhileIdle: true,
      uiLocalNotificationDateInterpretation:
          UILocalNotificationDateInterpretation.absoluteTime,
      matchDateTimeComponents: DateTimeComponents.time,
    );
  }

  tz.TZDateTime _nextInstanceOfTime(Time time) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate =
        tz.TZDateTime(tz.local, now.year, now.month, now.day, time.hour, time.minute, time.second);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(const Duration(days: 1));
    }
    return scheduledDate;
  }
}

class AzkareApp extends StatelessWidget {
  const AzkareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'تطبيق الأذكار',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
      ),
      home: const AzkareHome(),
      debugShowCheckedModeBanner: false,
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

  // أذكار الصباح
  final List<Map<String, String>> _morningAzkars = [
    {
      'id': 'm1',
      'title': 'بسم الله',
      'text': 'بسم الله الرحمن الرحيم',
      'count': '3',
      'audio': 'morning_azkar.mp3',
    },
    {
      'id': 'm2',
      'title': 'الحمد لله',
      'text': 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور',
      'count': '1',
      'audio': 'morning_azkar.mp3',
    },
    {
      'id': 'm3',
      'title': 'دعاء الصباح',
      'text':
          'أصبحنا وأصبح الملك لله رب العالمين، اللهم أني أسألك خير هذا اليوم',
      'count': '1',
      'audio': 'morning_azkar.mp3',
    },
    {
      'id': 'm4',
      'title': 'سبحان الله',
      'text': 'سبحان الله وبحمده سبحان الله العظيم',
      'count': '100',
      'audio': 'morning_azkar.mp3',
    },
    {
      'id': 'm5',
      'title': 'لا إله إلا الله',
      'text':
          'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
      'count': '100',
      'audio': 'morning_azkar.mp3',
    },
  ];

  // أذكار المساء
  final List<Map<String, String>> _eveningAzkars = [
    {
      'id': 'e1',
      'title': 'بسم الله',
      'text': 'بسم الله الرحمن الرحيم',
      'count': '3',
      'audio': 'evening_azkar.mp3',
    },
    {
      'id': 'e2',
      'title': 'الحمد لله',
      'text': 'الحمد لله الذي أمسى بنا والملك له',
      'count': '1',
      'audio': 'evening_azkar.mp3',
    },
    {
      'id': 'e3',
      'title': 'دعاء المساء',
      'text':
          'أمسينا وأمسى الملك لله رب العالمين، اللهم أني أسألك خير هذه الليلة',
      'count': '1',
      'audio': 'evening_azkar.mp3',
    },
    {
      'id': 'e4',
      'title': 'سبحان الله',
      'text': 'سبحان الله وبحمده سبحان الله العظيم',
      'count': '100',
      'audio': 'evening_azkar.mp3',
    },
    {
      'id': 'e5',
      'title': 'آية الكرسي',
      'text': 'الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم',
      'count': '1',
      'audio': 'evening_azkar.mp3',
    },
  ];

  @override
  void initState() {
    super.initState();
    NotificationService().requestPermissions();
    NotificationService().scheduleAzkarNotifications();
  }

  Future<void> _playAzkarAudio(String audioPath) async {
    await _audioPlayer.play(AssetSource(audioPath));
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: const Text(
            'تطبيق الأذكار',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          centerTitle: true,
          elevation: 2,
          bottom: const TabBar(
            tabs: [
              Tab(text: 'أذكار الصباح', icon: Icon(Icons.wb_sunny)),
              Tab(text: 'أذكار المساء', icon: Icon(Icons.nights_stay)),
              Tab(text: 'مواقيت الصلاة', icon: Icon(Icons.access_time)),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildAzkarsView(_morningAzkars, 'صباح'),
            _buildAzkarsView(_eveningAzkars, 'مساء'),
            const PrayerTimesView(),
          ],
        ),
      ),
    );
  }

  Widget _buildAzkarsView(List<Map<String, String>> azkars, String title) {
    return ListView.builder(
      padding: const EdgeInsets.all(8.0),
      itemCount: azkars.length,
      itemBuilder: (context, index) {
        final azkar = azkars[index];

        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          elevation: 2.0,
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            azkar['title']!,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.teal,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'العدد: ${azkar['count']}',
                            style: TextStyle(
                              fontSize: 14,
                              color: Colors.grey[600],
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.volume_up),
                      onPressed: () {
                        _playAzkarAudio('audio/${azkar['audio']}');
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    azkar['text']!,
                    style: const TextStyle(
                      fontSize: 16,
                      height: 1.6,
                      color: Colors.black87,
                    ),
                    textAlign: TextAlign.right,
                  ),
                ),
              ],
            ),
          ),
        );
      },
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
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }
        if (!snapshot.hasData) {
          return const Center(child: Text('No data'));
        }

        final prayerTimes = snapshot.data!;
        return ListView(
          padding: const EdgeInsets.all(8.0),
          children: [
            _buildPrayerTimeCard('الفجر', prayerTimes.fajr),
            _buildPrayerTimeCard('الشروق', prayerTimes.sunrise),
            _buildPrayerTimeCard('الظهر', prayerTimes.dhuhr),
            _buildPrayerTimeCard('العصر', prayerTimes.asr),
            _buildPrayerTimeCard('المغرب', prayerTimes.maghrib),
            _buildPrayerTimeCard('العشاء', prayerTimes.isha),
          ],
        );
      },
    );
  }

  Widget _buildPrayerTimeCard(String name, DateTime time) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              name,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.teal,
              ),
            ),
            Text(
              DateFormat.jm().format(time),
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

Future<PrayerTimesData> _getPrayerTimes() async {
  final myCoordinates = Coordinates(30.0444, 31.2357); // Cairo, Egypt
  final params = CalculationMethod.egyptian.getParameters();
  final prayerTimes = adhan.PrayerTimes(myCoordinates, DateTime.now(), params);

  final prayerTimesData = PrayerTimesData(
    fajr: prayerTimes.fajr,
    sunrise: prayerTimes.sunrise,
    dhuhr: prayerTimes.dhuhr,
    asr: prayerTimes.asr,
    maghrib: prayerTimes.maghrib,
    isha: prayerTimes.isha,
  );

  await NotificationService().scheduleNotifications(prayerTimesData);

  return prayerTimesData;
}
class PrayerTimesData {
  final DateTime fajr;
  final DateTime sunrise;
  final DateTime dhuhr;
  final DateTime asr;
  final DateTime maghrib;
  final DateTime isha;

  PrayerTimesData({
    required this.fajr,
    required this.sunrise,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
  });
}