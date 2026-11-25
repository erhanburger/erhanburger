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

## 3D önizleme

Ürün menüsünden bir burgerin özelleştirme penceresini aç. 3D modül ilk burger açıldığında yüklenir. Ok tuşları ve sürükleme modeli hareket ettirir. `Home` veya `Reset view` kamerayı sıfırlar. `Explode view` katmanları ayırır.

Tarayıcı Three.js 0.187.0'ı `vendor/three-burger.js` dosyasından yükler. Normal kullanımda npm, internet CDN'i veya Blender gerekmez. Three.js paketi MIT lisanslıdır. Lisans `vendor/three-LICENSE.txt` dosyasındadır.

Three.js paketini yeniden oluşturmak için depo kökünden aşağıdaki komutları çalıştır.

```sh
npm install --prefix /tmp/burger-builder-tools three@0.187.0 esbuild@0.28.1
cat > /tmp/burger-builder-tools/three-burger-entry.js <<'MODULE'
export {
  ACESFilmicToneMapping, BufferGeometry, CanvasTexture, Color, DirectionalLight,
  DoubleSide, Float32BufferAttribute, Group, HemisphereLight, IcosahedronGeometry,
  InstancedMesh, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
  OrthographicCamera, PCFShadowMap, PlaneGeometry, RepeatWrapping, Scene,
  ShadowMaterial, SphereGeometry, WebGLRenderer,
} from 'three';
MODULE
/tmp/burger-builder-tools/node_modules/.bin/esbuild /tmp/burger-builder-tools/three-burger-entry.js \
  --bundle --minify --format=esm --legal-comments=inline --outfile=vendor/three-burger.js
cp /tmp/burger-builder-tools/node_modules/three/LICENSE vendor/three-LICENSE.txt
```

## Bilinen erişim kısıtı

Netlify önizlemesi bu çalışma ortamından HTTP 401 döndürdü. Dalın canlı önizlemeyle bağlantısı ve canlı ortamın davranışı doğrulanamadı.
