# Görevler

## Tamamlandı

- [x] Geliştirme dalına erişimi ve mevcut SVG özelleştirme akışını doğrula.
- [x] Proje hafızasını dört dosya olarak `burger-builder` dalına kaydet.
- [x] İlk 3D prototipte burger ve opsiyonel malzeme modellerini oluşturarak tavuk, sebze köftesi, çift köfte ve burger menülerini mevcut seçimlere bağla.
- [x] Fare, dokunma, klavye, kamera sıfırlama, ayrılmış katman görünümü ve SVG yedeğini ekle.

- [x] Playwright 1.65.1 ve Chromium 158 ile masaüstünde WebGL 2, fare ve klavye, sıfırlama, katman ayırma, malzeme ve sos değişimini doğrula.
- [x] 360 px mobil emülasyonda dokunarak döndürmeyi doğrula. Normal burger ve içecekli menü için sepet içeriğini ve burger ek malzeme fiyatını kontrol et.
- [x] WebGL başlangıçta kullanılamadığında, bağlam kaybolduğunda ve 3D modülü yüklenemediğinde SVG yedeğini doğrula.

- [x] Half Pounder with Cheese için menü fotoğrafını referans alan dokuz malzemeli GLB üret ve özelleştirme penceresine bağla. Khronos glTF Validator sıfır hata ve uyarı bildirdi.
- [x] Katmanların düşüşünü, sos şişesi ve sos izini, ekran dışında animasyonu bekletmeyi ve azaltılmış hareket seçeneğini ekle.
- [x] Playwright 1.65.1 ve Chromium 156 ile masaüstü ve 360 px dokunmatik mobil emülasyonda GLB yükleme, döndürme, katman ayırma, sos değiştirme ve sepeti kontrol et. GLB ve WebGL hatalarında fotoğraf yedeğini doğrula.

## Sonraki adımlar

- [ ] Netlify önizlemesine yetkili erişim sağlandığında `burger-builder` dalının yayınını doğrula.
- [ ] Fiziksel iOS ve Android cihazlarda yükleme süresini ve etkileşimi ölç.
- [ ] Half Pounder with Cheese için elde edilen görsel sonucu diğer ürünlerin menü fotoğraflarıyla karşılaştır ve uygun GLB modellerini planla.

## Bağımsız demo

- [x] `burger-builder` dalını, son commitleri, çalışma ağacını ve proje hafızasını doğrula.
- [x] Ayrı, fotoğraf görünümlü malzeme katmanlarını hazırla.
- [x] Malzeme düşüşü, ekleme ve çıkarma, sos şişesi ve üst ekmek sırasını bağımsız demoda uygula.
- [x] Masaüstü, mobil, klavye ve azaltılmış hareket akışlarını doğrula.
- [x] Çalışan önizlemeyi kullanıcı onayına sun.
- [x] Mevcut Kömür Stüdyosu demosu için kullanıcının geçici onayını kaydet.

## Kömür Stüdyosu Netlify önizlemesi

- [x] Kayıtlı sürümü `charcoal-demo/` altında koru ve yerel statik önizlemeyi masaüstü ve mobilde doğrula.
- [x] GitHub'da Kömür Stüdyosu dosyasını, önceki prototipi, görselleri ve model kaynaklarını doğrula.

## Kullanıcı döndüğünde

- [ ] Yetkili oturumdan Netlify `/charcoal-demo/` önizlemesinin `burger-builder` dalındaki demo sürümünü sunduğunu doğrula.
- [ ] Fiziksel iOS ve Android cihazlarda yükleme, dokunmatik seçim, sos akışı ve tekrar oynatmayı kontrol et.
- [ ] Geri bildirimlere göre sonraki geliştirme kapsamını kullanıcıyla belirle. Ana site entegrasyonu için ayrı onay al.

## Yeni Burger Builder arayüzü

- [x] Kalıcı British English ve GBP (£) kuralını `AGENTS.md` ve `PROJECT_STATE.md` dosyalarına yaz.
- [x] Mevcut onaylı görsellerle üç tasarımın masaüstü ve mobil taslaklarını hazırla ve kontrol et.
- [x] Kullanıcının Charcoal Studio seçimini ve test önizlemesi için uygulama onayını kaydet.
- [x] Tam menüyü destekleyecek veri odaklı Product Builder kararını kalıcı olarak kaydet.
- [x] Charcoal Studio'yu `charcoal-demo/` içinde Half Pounder with Cheese ve mevcut menü fiyatlarıyla uygula.
- [x] Görsel ve işlevsel kaliteyi masaüstü, mobil ve yatay mobil Chromium görünümlerinde kontrol et.
- [ ] Netlify önizlemesindeki uygulamayı kullanıcı onayına sun. Diğer ürünlerin görsellerine ve canlı site entegrasyonuna ayrı onayla geç.
