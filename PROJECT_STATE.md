# Burger Builder proje durumu

- Çalışma dalı `burger-builder`. Devralınan commit `ced1864`, ilk proje hafızası commit'i `7548149`.
- Mevcut özelleştirme penceresi ürün, malzeme, sos, fiyat ve sepet durumunu yönetir. 3D ve SVG önizlemeleri bu penceredeki malzeme ve sos seçimlerini kullanır.
- İlk prototipte ekmek, köfte, sebze ve sos geometrileri ile dokular tarayıcıda üretilir. Three.js 0.187.0, WebGL 2 ve stüdyo ışığı kullanılır. İçe aktarılan GLB varlığı bulunmaz.
- Model fare, dokunma ve klavyeyle döndürülür. Katmanlar ayrılabilir ve kamera sıfırlanabilir. 3D modülü yüklenemezse veya WebGL bağlamı kaybolursa SVG görünümü devreye girer.
- Three.js aynı sunucudan yüklenir. Depo kökü statik site olarak çalışır. Blender, fal.ai ve Netlify entegrasyonu ilk prototipin bağımlılıkları arasında değildir.
- Prototip Playwright 1.65.1 ve Chromium 158 ile yerelde doğrulandı. Test kapsamı ve kalan işler `TASKS.md` dosyasında.
- `https://erhanburger-preview.netlify.app` çalışma ortamından HTTP 401 döndürdü. Önizleme dalı bağlantısı doğrulanmadı.
- Önceki oturumda WebGL 2 ve GLB yükleme ayrı bir deneyde doğrulandı. Blender engelleri `SETUP.md` dosyasında kayıtlı.
