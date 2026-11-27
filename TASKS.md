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

## Half Pounder animasyonları

- [x] Gerçek reklam çekimlerini, sos sıkma yakın planlarını ve malzeme düşüşünü referans al.
- [x] Yedi ayrı şişeyi, sos dokularını ve malzemeye göre değişen düşüş, temas ve yerleşme hareketlerini uygula.
- [x] Görsel ve işlevsel Chromium kontrollerini tamamla.
- [ ] Netlify önizlemesini kullanıcıyla değerlendir. Sonraki ürünlere ayrı onayla geç.

## Half Pounder menü uyumu

- [x] Ana daldaki sipariş sayfasının açılır bölümlerini ürün türlerine göre denetle ve içecek kurallarını kaydet.
- [x] Half Pounder seçenek adlarını kaynakla eşleştir, ek malzeme ve soslara erişimi iyileştir.
- [x] 1440×900 masaüstü ve 390×844 dokunmatik emülasyonda 23 seçeneği tek tek seç, £6.90–£9.80 fiyatı ve sepetteki 23 etiketi doğrula. Örnek malzeme ve sos animasyonlarını kontrol et.
- [ ] Yetkili erişimle canlı menü ve Netlify önizlemesini doğrula.

## 46 ürünlü menü önizlemesi

- [x] Yedi çalışma grubunun ürünlerini ve sipariş kurallarını ana dalın menü koduyla karşılaştır.
- [x] 46 ürünün tamamını menüye, ortak sepete ve ürün animasyon profillerine bağla.
- [x] Masaüstü ve mobilde her ürünün açılmasını, doğru fiyatı, görselleri, zorunlu seçimleri ve sepeti doğrula.
- [x] Geçici görseller için ürün bazlı `VISUAL_BACKLOG.md` listesini kaydet.
- [ ] Netlify önizlemesini kullanıcıyla değerlendir. Son görsel iyileştirmelerini site tamamlandıktan sonra ele al.

## Bağımsız müşteri incelemesi

- [x] İki müşteri ajanının bağımsız tarayıcı incelemesini ve UX eleştirisini tamamla.
- [x] Chips seçeneklerini, Hot Dog ve Shish sahnelerini, menü kartlarını ve sepet gezinmesini iyileştir.
- [ ] Netlify menü önizlemesini kullanıcının erişimiyle değerlendir. Chips sos politikası ve arka planı gömülü ürün fotoğrafları açık konular.
- [x] Değişiklikleri bağımsız müşteri ajanları ve ayrı QA uzmanıyla yeniden test et.

## Araştırma ve konsept karşılaştırması

- [x] Çalışan önizlemenin GitHub geri dönüş noktasını kaydet.
- [x] Erişilebilen marka ve teknik kaynakların bulgularını, kısıtlarıyla birlikte kaydet.
- [x] Üç farklı prototipi masaüstü ve mobilde bağımsız olarak karşılaştır.
- [ ] Birincil referansa erişim sağlandığında masaüstü ve mobil davranışı ile render tekniğini doğrula.
- [x] Kullanıcının onayladığı Order Counter ve Build Room birleşimini önizlemeye uygula.
- [x] 45 ürünü masaüstü ve mobil Chromium’da fiyat, zorunlu seçenekler ve ortak sepet için yeniden doğrula.
- [ ] Birleşik önizlemeyi fiziksel mobil cihazlarda doğrula. Kaynak kart görsellerinin son düzenlemesi için VISUAL_BACKLOG.md dosyasını kullan.

## Güncel önizleme hedefi

- [x] Cloudflare Pages ve `burger-builder` otomatik dağıtım ayarlarını proje hafızasına kaydet.
- [ ] Cloudflare Pages dağıtımında ana sayfa, menü, özelleştirme, animasyon ve sepeti doğrula. Önceki Netlify doğrulama maddeleri emekliye ayrıldı.
