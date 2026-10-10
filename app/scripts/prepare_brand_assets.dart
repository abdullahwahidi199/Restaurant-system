import 'dart:io';
import 'dart:math' as math;

import 'package:image/image.dart' as image;

// Reuses the website's existing logo without redrawing, stretching, or cropping.
// Run from app/. Generated assets are committed so builds remain self-contained.
void main() {
  final source = File('../frontend/public/rmsFavicon.png');
  final bytes = source.readAsBytesSync();
  final logo = image.decodePng(bytes);
  if (logo == null) throw StateError('The Pakhlai website logo must be a PNG.');
  final directory = Directory('assets/branding')..createSync(recursive: true);
  File('${directory.path}/pakhlai-logo.png').writeAsBytesSync(bytes);

  image.Image canvas({required int logoSize, required bool opaque}) {
    final result = image.Image(width: 1024, height: 1024, numChannels: 4);
    image.fill(
      result,
      color: opaque
          ? image.ColorRgba8(255, 255, 255, 255)
          : image.ColorRgba8(0, 0, 0, 0),
    );
    final scale = logoSize / math.max(logo.width, logo.height);
    final resized = image.copyResize(
      logo,
      width: (logo.width * scale).round(),
      height: (logo.height * scale).round(),
      interpolation: image.Interpolation.average,
    );
    return image.compositeImage(
      result,
      resized,
      dstX: (1024 - resized.width) ~/ 2,
      dstY: (1024 - resized.height) ~/ 2,
    );
  }

  // The white, padded icon fits circular/maskable launchers too. Android's
  // adaptive foreground uses its own safe-zone inset from the YAML config.
  File('${directory.path}/app-icon.png')
      .writeAsBytesSync(image.encodePng(canvas(logoSize: 740, opaque: true)));
  File('${directory.path}/app-icon-foreground.png')
      .writeAsBytesSync(image.encodePng(canvas(logoSize: 1024, opaque: false)));
  stdout.writeln('Prepared Pakhlai launcher assets from ${source.path}.');
}
