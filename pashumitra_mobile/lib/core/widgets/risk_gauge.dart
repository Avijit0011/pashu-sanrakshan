import 'package:flutter/material.dart';
import '../constants/app_enums.dart';
import '../theme/app_theme.dart';

class RiskGaugeWidget extends StatelessWidget {
  final int score;
  final RiskLevel level;
  final double size;

  const RiskGaugeWidget({
    Key? key,
    required this.score,
    required this.level,
    this.size = 100,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.getRiskColor(level);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: size,
                height: size,
                child: CircularProgressIndicator(
                  value: score / 100,
                  strokeWidth: 8,
                  backgroundColor: color.withOpacity(0.15),
                  valueColor: AlwaysStoppedAnimation<Color>(color),
                ),
              ),
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    '$score',
                    style: TextStyle(
                      fontSize: size * 0.28,
                      fontWeight: FontWeight.w900,
                      color: color,
                      fontFamily: 'monospace',
                    ),
                  ),
                  Text(
                    '/ 100',
                    style: TextStyle(
                      fontSize: size * 0.12,
                      color: Colors.grey.shade600,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 6),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withOpacity(0.4)),
          ),
          child: Text(
            level.name.toUpperCase(),
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}
