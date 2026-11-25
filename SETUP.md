# Kurulum

Statik siteyi depo kökünden yerel HTTP ile aç.

```sh
python3 -m http.server 8080
```

Geliştirme araçlarını ayrı bir dizine kur.

```sh
npm install --prefix /tmp/burger-builder-tools three@0.187.0 playwright@1.65.1 @sparticuz/chromium@158.0.0
```

- Önceki oturumun `/opt/burger-builder-tools` dizini bu ortamda bulunmadı. Node.js 22 ve npm 10 erişilebilir.
- Önceki oturumda Blender 4.5.17 bpy, `libXfixes`, `libXi`, `libxkbcommon` ve `libGL` eksikliği nedeniyle başlayamadı. Debian paket deposu HTTP 403 döndürdü. Bu kurulum 3D prototip için gerekli değil.
