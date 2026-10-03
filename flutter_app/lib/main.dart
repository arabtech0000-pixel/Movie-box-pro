import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Color(0xFF090A0F),
      statusBarIconBrightness: Brightness.light,
      navigationBarColor: Color(0xFF090A0F),
    ),
  );
  runApp(const MovieBoxProApp());
}

class MovieBoxProApp extends StatelessWidget {
  const MovieBoxProApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MovieBox Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF090A0F),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF00DF82),
          surface: Color(0xFF121422),
        ),
      ),
      home: const MovieBoxMainScreen(),
    );
  }
}

class MovieBoxMainScreen extends StatefulWidget {
  const MovieBoxMainScreen({super.key});

  @override
  State<MovieBoxMainScreen> createState() => _MovieBoxMainScreenState();
}

class _MovieBoxMainScreenState extends State<MovieBoxMainScreen> {
  InAppWebViewController? webViewController;
  bool isLoading = true;
  double progress = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF090A0F),
      body: SafeArea(
        child: Stack(
          children: [
            InAppWebView(
              initialUrlRequest: URLRequest(
                url: WebUri('https://ais-dev-aor5laggis375mvvljtu5k-706784507558.europe-west2.run.app/'),
              ),
              initialSettings: InAppWebViewSettings(
                javaScriptEnabled: true,
                domStorageEnabled: true,
                databaseEnabled: true,
                useWideViewPort: true,
                mediaPlaybackRequiresUserGesture: false,
                allowsInlineMediaPlayback: true,
                allowFileAccessFromFileURLs: true,
                allowUniversalAccessFromFileURLs: true,
              ),
              onWebViewCreated: (controller) {
                webViewController = controller;
              },
              onProgressChanged: (controller, p) {
                setState(() {
                  progress = p / 100;
                  if (p == 100) isLoading = false;
                });
              },
            ),
            if (isLoading)
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: LinearProgressIndicator(
                  value: progress,
                  backgroundColor: Colors.transparent,
                  color: const Color(0xFF00DF82),
                  minHeight: 3,
                ),
              ),
          ],
        ),
      ),
    );
  }
}
