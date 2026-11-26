# Kurulum

Statik siteyi depo kökünden yerel HTTP ile aç.

```sh
python3 -m http.server 4173
```

Geliştirme araçlarını ayrı bir dizine kur.

```sh
npm install --prefix /tmp/burger-builder-tools three@0.187.0 playwright@1.65.1 @sparticuz/chromium@158.0.0
```

- Önceki oturumun `/opt/burger-builder-tools` dizini bu ortamda bulunmadı. Node.js 22 ve npm 10 erişilebilir.
- Önceki oturumda Blender 4.5.17 bpy, `libXfixes`, `libXi`, `libxkbcommon` ve `libGL` eksikliği nedeniyle başlayamadı. Debian paket deposu HTTP 403 döndürdü. Bu kurulum 3D prototip için gerekli değil.

## 3D önizleme

Ürün menüsünden bir burgerin özelleştirme penceresini aç. 3D modül ilk burger açıldığında yüklenir. Ok tuşları ve sürükleme modeli hareket ettirir. `Home` veya `Reset view` kamerayı sıfırlar. `Explode view` katmanları ayırır.

Half Pounder with Cheese açıldığında `assets/half-pounder.glb` yüklenir. Model yüklenirken veya WebGL önizlemesi kullanılamadığında ürünün menü fotoğrafı gösterilir. Sos seçeneklerindeki `View 3D burger` düğmesi önizlemeye döner.

Tarayıcı Three.js 0.187.0'ı `vendor/three-burger.js` dosyasından yükler. Normal kullanımda npm, internet CDN'i veya Blender gerekmez. Three.js paketi MIT lisanslıdır. Lisans `vendor/three-LICENSE.txt` dosyasındadır.

Three.js paketini yeniden oluşturmak için depo kökünden aşağıdaki komutları çalıştır.

```sh
npm install --prefix /tmp/burger-builder-tools three@0.187.0 esbuild@0.28.1
cat > /tmp/burger-builder-tools/three-burger-entry.js <<'MODULE'
export {
  ACESFilmicToneMapping, BufferGeometry, CanvasTexture, Color, CylinderGeometry, DirectionalLight,
  DoubleSide, Float32BufferAttribute, Group, HemisphereLight, IcosahedronGeometry,
  InstancedMesh, LatheGeometry, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Object3D,
  OrthographicCamera, PCFShadowMap, PlaneGeometry, RepeatWrapping, Scene,
  ShadowMaterial, SphereGeometry, Vector2, Vector3, WebGLRenderer,
} from 'three';
export { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
MODULE
/tmp/burger-builder-tools/node_modules/.bin/esbuild /tmp/burger-builder-tools/three-burger-entry.js \
  --bundle --minify --format=esm --legal-comments=inline --outfile=vendor/three-burger.js
cp /tmp/burger-builder-tools/node_modules/three/LICENSE vendor/three-LICENSE.txt
```

## Half Pounder GLB modelini yeniden üretme

Üretim betiği NumPy ve Pillow kullanır ve dokular için depodaki `IMG_0352.png` dosyasını okur. Depo kökünden çalıştır.

```sh
python3 -m venv /tmp/burger-model-venv
/tmp/burger-model-venv/bin/pip install numpy pillow
/tmp/burger-model-venv/bin/python scripts/build-half-pounder.py
```

## Bilinen erişim kısıtı

Netlify önizlemesi daha önce HTTP 401 döndürdü. Son denemede çalışma ortamının ağ geçidi bağlantıyı HTTP 403 ile reddetti. Kullanıcı Netlify önizlemesinin `burger-builder` dalına bağlı olduğunu belirtti. Uzak dağıtım bu ortamdan doğrulanamadı.

## Bağımsız Burger Atölyesi

`burger-builder-demo/` klasöründe demo için gereken HTML, CSS, JavaScript ve görseller bulunur. Kurulum, derleme ve API anahtarı gerekmez. GitHub'dan `burger-builder` dalının ZIP dosyasını indirip açtıktan sonra terminalde arşiv köküne geç:

```sh
python3 -m http.server 3000 --bind 127.0.0.1 --directory burger-builder-demo
```

Tarayıcıda `http://127.0.0.1:3000/` adresini aç. Sunucu yalnızca demo klasörünü servis eder.

## Kömür Stüdyosu

`charcoal-demo/` statik önizlemedir. Onaylanan Kömür Stüdyosu görselleri ve ortak malzeme dosyaları depodadır. Depo kökünden `python3 -m http.server 3000 --bind 127.0.0.1` komutunu çalıştır ve tarayıcıda `http://127.0.0.1:3000/charcoal-demo/` adresini aç. Netlify önizleme hedefi aynı `/charcoal-demo/` yolunu kullanır.

### Ürün yapılandırması

- `charcoal-demo/catalog.js` ürünleri, kategorileri, seçenek gruplarını ve menüdeki fiyatları pence cinsinden tanımlar. Yeni bir ürün için benzersiz ürün kimliği, menüden doğrulanmış taban fiyatı, onaylı görseli ve ilgili seçim grupları girilir. Porsiyon, içecek ve benzeri seçenekler fiyat farkı ve seçim sınırı olan gruplarla tanımlanır.
- `charcoal-demo/scene.js` katmanlı veya menü fotoğraflı önizlemeyi çalıştırır. Katman sırası, ortak görseller, kapanan katman ve animasyon süreleri ürün profiliyle tanımlanabilir. Seçimler gerektiğinde önizleme katmanlarıyla eşleştirilir.
- `charcoal-demo/app.js` katalogdan arayüzü ve GBP fiyatını oluşturur. Önizleme sepeti bu tarayıcıda saklanır. `?product=<ürün-kimliği>` ile kayıtlı ürün seçilir. İlk sürümde kayıtlı uygulama ürünü Half Pounder with Cheese.
