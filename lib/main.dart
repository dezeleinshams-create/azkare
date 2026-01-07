import 'package:flutter/material.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'dart:async';

void main() {
  runApp(const AzkareApp());
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
  final FlutterTts _tts = FlutterTts();
  int _currentPage = 0;
  bool _isSpeaking = false;
  String? _currentSpeakingId;

  // أذكار الصباح
  final List<Map<String, String>> _morningAzkars = [
    {
      'id': 'm1',
      'title': 'بسم الله',
      'text': 'بسم الله الرحمن الرحيم',
      'count': '3',
    },
    {
      'id': 'm2',
      'title': 'الحمد لله',
      'text': 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور',
      'count': '1',
    },
    {
      'id': 'm3',
      'title': 'دعاء الصباح',
      'text':
          'أصبحنا وأصبح الملك لله رب العالمين، اللهم أني أسألك خير هذا اليوم',
      'count': '1',
    },
    {
      'id': 'm4',
      'title': 'سبحان الله',
      'text': 'سبحان الله وبحمده سبحان الله العظيم',
      'count': '100',
    },
    {
      'id': 'm5',
      'title': 'لا إله إلا الله',
      'text':
          'لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير',
      'count': '100',
    },
  ];

  // أذكار المساء
  final List<Map<String, String>> _eveningAzkars = [
    {
      'id': 'e1',
      'title': 'بسم الله',
      'text': 'بسم الله الرحمن الرحيم',
      'count': '3',
    },
    {
      'id': 'e2',
      'title': 'الحمد لله',
      'text': 'الحمد لله الذي أمسى بنا والملك له',
      'count': '1',
    },
    {
      'id': 'e3',
      'title': 'دعاء المساء',
      'text':
          'أمسينا وأمسى الملك لله رب العالمين، اللهم أني أسألك خير هذه الليلة',
      'count': '1',
    },
    {
      'id': 'e4',
      'title': 'سبحان الله',
      'text': 'سبحان الله وبحمده سبحان الله العظيم',
      'count': '100',
    },
    {
      'id': 'e5',
      'title': 'آية الكرسي',
      'text': 'الله لا إله إلا هو الحي القيوم لا تأخذه سنة ولا نوم',
      'count': '1',
    },
  ];

  @override
  void initState() {
    super.initState();
    _initTts();
  }

  void _initTts() async {
    await _tts.setLanguage("ar-SA");
    await _tts.setSpeechRate(0.5);
    await _tts.setVolume(1.0);
    await _tts.setPitch(1.0);
  }

  void _speak(String text, String id) async {
    if (_isSpeaking && _currentSpeakingId == id) {
      await _tts.stop();
      setState(() {
        _isSpeaking = false;
        _currentSpeakingId = null;
      });
    } else {
      setState(() {
        _isSpeaking = true;
        _currentSpeakingId = id;
      });
      await _tts.speak(text);
      _tts.setCompletionHandler(() {
        setState(() {
          _isSpeaking = false;
          _currentSpeakingId = null;
        });
      });
    }
  }

  @override
  void dispose() {
    _tts.stop();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
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
            ],
          ),
        ),
        body: TabBarView(
          children: [
            _buildAzkarsView(_morningAzkars, 'صباح'),
            _buildAzkarsView(_eveningAzkars, 'مساء'),
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
        final isCurrentlySpeaking =
            _isSpeaking && _currentSpeakingId == azkar['id'];

        return Card(
          margin: const EdgeInsets.symmetric(vertical: 8.0, horizontal: 4.0),
          elevation: isCurrentlySpeaking ? 8.0 : 2.0,
          color: isCurrentlySpeaking
              ? Colors.teal.withOpacity(0.2)
              : Colors.white,
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
                    FloatingActionButton(
                      heroTag: azkar['id'],
                      onPressed: () => _speak(azkar['text']!, azkar['id']!),
                      backgroundColor: isCurrentlySpeaking
                          ? Colors.green
                          : Colors.teal,
                      child: Icon(
                        isCurrentlySpeaking ? Icons.stop : Icons.volume_up,
                        color: Colors.white,
                      ),
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
