import 'package:flutter/material.dart';
import '../constants/app_enums.dart';

class AppTheme {
  static const Color primaryGreen = Color(0xFF16A34A);
  static const Color primaryDarkGreen = Color(0xFF14532D);
  static const Color accentTeal = Color(0xFF0D9488);
  static const Color backgroundLight = Color(0xFFF8FAFC);
  static const Color cardSurface = Colors.white;

  // Risk Level Colors
  static const Color riskLow = Color(0xFF10B981);      // Emerald Green
  static const Color riskMedium = Color(0xFFF59E0B);   // Amber Yellow
  static const Color riskHigh = Color(0xFFF97316);     // Orange
  static const Color riskCritical = Color(0xFFEF4444); // Red

  static Color getRiskColor(RiskLevel level) {
    switch (level) {
      case RiskLevel.low:
        return riskLow;
      case RiskLevel.medium:
        return riskMedium;
      case RiskLevel.high:
        return riskHigh;
      case RiskLevel.critical:
        return riskCritical;
    }
  }

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryGreen,
        primary: primaryGreen,
        secondary: accentTeal,
        surface: cardSurface,
        background: backgroundLight,
      ),
      scaffoldBackgroundColor: backgroundLight,
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        scaffoldColorScheme: ColorScheme.light(),
        iconTheme: IconThemeData(color: Color(0xFF0F172A)),
        titleTextStyle: TextStyle(
          color: Color(0xFF0F172A),
          fontSize: 18,
          fontWeight: FontWeight.bold,
        ),
      ),
      cardTheme: CardTheme(
        elevation: 1,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: cardSurface,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryGreen,
          foregroundColor: Colors.white,
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}
