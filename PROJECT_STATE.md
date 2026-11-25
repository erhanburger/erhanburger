# Burger Builder proje durumu

- Çalışma dalı `burger-builder`. Devralınan commit `ced1864`, ilk proje hafızası commit'i `7548149`.
- Mevcut özelleştirme penceresi ürün, malzeme, sos, fiyat ve sepet durumunu yönetir. 3D ve SVG önizlemeleri bu penceredeki malzeme ve sos seçimlerini kullanır.
- Half Pounder with Cheese, `assets/half-pounder.glb` içindeki dokulu ekmek, köfte, peynir ve sebze modellerini kullanır. Üretim betiği `scripts/build-half-pounder.py`, menü fotoğrafından aldığı yüzey ayrıntılarını yerel renk ve normal haritalarıyla birleştirir. Ekmek ve köfte dahil her malzemenin yerleşim yüksekliği GLB içinde tanımlıdır.
- İlk açılışta malzemeler sırayla düşer. Ek malzeme eklenirken üst katmanlar yer açar. Sos seçiminde üst ekmek kenara geçer, şişe gelir ve sos izi akışla birlikte görünür. Animasyonlar sahne görünürken ilerler ve azaltılmış hareket tercihinde katmanlar doğrudan yerleşir.
- Three.js 0.187.0, WebGL 2 ve stüdyo ışığı kullanılır. Diğer ürünler ilk prototipteki tarayıcı üretimi modellere devam eder.
- Model fare, dokunma ve klavyeyle döndürülür. Katmanlar ayrılabilir ve kamera sıfırlanabilir. 3D önizleme kullanılamadığında Half Pounder with Cheese için menü fotoğrafı, diğer burgerler için SVG görünümü devreye girer.
- Three.js aynı sunucudan yüklenir. Depo kökü statik site olarak çalışır. Blender, fal.ai ve Netlify entegrasyonu ilk prototipin bağımlılıkları arasında değildir.
- Prototip Playwright 1.65.1 ve Chromium 158 ile yerelde doğrulandı. Test kapsamı ve kalan işler `TASKS.md` dosyasında.
- `https://erhanburger-preview.netlify.app` çalışma ortamından HTTP 401 döndürdü. Önizleme dalı bağlantısı doğrulanmadı.
- Önceki oturumda WebGL 2 ve GLB yükleme ayrı bir deneyde doğrulandı. Blender engelleri `SETUP.md` dosyasında kayıtlı.

## Bağımsız demo

- 25 Kasım 2026 tarihinde çalışma `be7443d` üzerinden devralındı. `5bb2345` içindeki ilk prototip bir JavaScript dosyasından oluşuyor. GLB, kaynak üretim betiği ve montaj animasyonları dalda mevcut.
- Onaylanan görsel yön kömür tonlu stüdyo ve uyumlu ışık, kamera açısı ve ölçeğe sahip fotogerçekçi malzemeler. Bağımsız demo için katmanlı 2.5D seçildi. Önceki prototipin düşüş sırası ve sos uygulaması referans alınıyor.
- Üst ekmek montajı bitirir. Malzeme değişiklikleri etkileşimlidir. Demo kaynakları `burger-builder-demo/` altında tutulur. Harici harcama bütçesi £0.
- Dokuz malzeme katmanı, sos şişesi, üç sos izi ve üç akış dokusu görsel üretim aracıyla hazırlandı. Görseller önden yaklaşık 14° yükseltilmiş kamera, 85 mm lens görünümü, sol üstten sıcak ana ışık ve sağdan hafif dolgu referansıyla üretildi. Şeffaf WebP dosyaları `burger-builder-demo/assets/` altında. Önceki GLB ve menü fotoğrafı dalda korunuyor.
