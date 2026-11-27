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
- Bağımsız demo, Half Pounder montaj akışını katmanlı 2.5D olarak uygular. Yedi malzeme açılıp kapatılabilir ve aynı anda bir sos seçilebilir. Ekmekler sabittir. Sos şişesinin girişi, akış ve üst ekmeğin kapanışı sıralı çalışır. Mobilde sahne kaydırma sırasında görünür kalır. Azaltılmış hareket tercihinde seçimler doğrudan yerleşir.
- Chromium 156 ve Playwright ile masaüstü ve dokunmatik mobil emülasyonda sıra, yeniden oynatma, sıfırlama, hızlı seçim değişiklikleri ve azaltılmış hareket kontrol edildi. Klavye ile seçim ve tüm katmanlar açıkken 320–2560 px aralığında sekiz görünümde üst ekmek ve sos şişesinin sahne içindeki yerleşimi doğrulandı. Fiziksel mobil cihaz testi yapılmadı.
- Demo, Cloud Chrome önizlemesi ve GitHub dalından indirilebilir statik kaynak olarak incelemeye sunulur. Yerel çalıştırma komutu `SETUP.md` dosyasında. Yayındaki siteye entegrasyon kullanıcı onayına bağlıdır.

## Kömür Stüdyosu önizlemesi

- Daha önce kayıtlı Kömür Stüdyosu sürümünün `2de8bdc` commit'indeki HTML dosyası, gömülü WebP görselleri, CSS ve animasyon betiğiyle birlikte bayt düzeyinde aynı kopya olarak `charcoal-demo/index.html` yoluna alındı. Netlify hedefi `/charcoal-demo/`.
- Chromium ile 1440×900 masaüstü ve 390×844 dokunmatik görünümde bu yolun açılması, görsellerin yüklenmesi, malzeme seçimi, tekrar oynatma ve sos animasyonu doğrulandı.
- 25 Kasım 2026 kapanışı. Kullanıcı mevcut Kömür Stüdyosu demosunu şimdilik beğendi ve çalışmayı duraklattı. Bu onay bağımsız önizleme içindir. Ana site entegrasyonu ayrı onay gerektirir.
- GitHub'daki `ce67e94` commit'inde `charcoal-demo/index.html`, önceki bağımsız prototipin kaynakları ve 16 WebP dosyası, GLB ve üretim betiği doğrulandı. Kömür Stüdyosu HTML dosyası kayıtlı özgün sürümle aynı.
- Netlify hedefi `https://erhanburger-preview.netlify.app/charcoal-demo/`. Kullanıcı önizleme sitesinin `burger-builder` dalına bağlı olduğunu belirtti. Yerel yol test edildi, uzaktaki otomatik dağıtım bu ortamın ağ kısıtı nedeniyle doğrulanamadı. ChatGPT Sites üzerinden yeni yayın denemesi yapılmayacak.
- `main` ve yayındaki ana site değişmedi. Harici harcama £0. Çalışma ancak kullanıcı döndüğünde devam edecek.

## Permanent customer-facing language and currency decisions

- British English is required throughout the entire Er-Han Burger website, including all pages, menus, product descriptions, ingredient names, buttons, animation text, notifications, error messages, basket and checkout screens, accessible names and fallback states.
- Customer-facing interfaces must contain no Turkish text. All prices must be displayed in GBP (£). Apply and verify these rules on every future development task and brief every subagent on them.
- Preserve the approved Kömür Stüdyosu reference and burger imagery. The user approved the Charcoal Studio preview implementation. Integration and live website changes require separate approval.
- Onay için üç statik görsel yön hazırlandı. Charcoal Studio, Menu Board ve Build Counter tasarımlarının 1440×900 masaüstü ve 390×844 mobil PNG'leri `docs/burger-builder-designs/` altında. Mevcut burger ve malzeme görselleri kullanıldı. Mobil taslaklarda burger ve sepet çubuğu, kaydırılan malzeme alanını çevreler.
- Fiyatlar tasarım örneğidir. £7.95 temel fiyat ve £1.25 ekstra dana köfte seçimi, £9.20 toplamı gösterir. Geliştirme onayından sonra gerçek menü fiyatları doğrulanacak.

## Charcoal Studio uygulaması ve kalıcı Product Builder mimarisi

- Kullanıcı Charcoal Studio masaüstü ve mobil tasarım yönünü onayladı. Geliştirme `charcoal-demo/` ve `burger-builder` dalıyla sınırlı. İlk uygulama ve kalite kontrol ürünü Half Pounder with Cheese. Diğer ürünlerin görselleri için ayrı onay gerekiyor.
- Kalıcı hedef tüm Er-Han Burger menüsünü kapsayan veri odaklı Product Builder. Dana, tavuk ve sebze burgerleri, hot dog, chicken shish, nuggets, chips, onion rings, mozzarella sticks, meal deals, diğer mevcut ürünler ve soslar aynı altyapıyı kullanabilmeli.
- Her ürün kendi veri kaydında porsiyon, pence cinsinden fiyat, seçim grupları ve kuralları, görseller ve gerektiğinde animasyon profili tanımlar. Ortak malzeme görselleri, sos animasyonları ve arayüz bileşenleri yeniden kullanılır. Desteklenen düzen ve animasyon türlerinde ürün eklemek için ortak uygulama kodu değişmez.
- Mevcut menüde taban fiyat £6.90. Ekstra peynir £0.30, iki parça halloumi £2.00 ve yumurta £0.60. Menü ücretli bir ekstra köfte sunmuyor. Taslakta kullanılan örnek fiyatlar uygulamaya alınmadı. Katalog, menünün çoklu sos ve ücretsiz tercih kurallarını korur.
- Charcoal Studio onaylı burger, sahne ve malzeme görsellerini kullanır. Half Pounder için yumurta ve halloumi katmanları eklendi. Tuz ve sirke seçenekleri sepete kaydedilir, sıkma animasyonunu yalnızca soslar kullanır. Sepet bu önizlemenin yerel tarayıcı verisidir.
- Chromium masaüstü ve dokunmatik emülasyonunda, kısa ve yatay ekranlar dahil, görsel yerleşim, fiyat, sepet, malzeme animasyonu, üst ekmek, sos akışı, tekrar oynatma ve azaltılmış hareket doğrulandı. Fiziksel telefonla test yapılmadı. Netlify uç noktasına bu çalışma ortamının ağ geçidi erişim vermedi.

## Charcoal Studio animasyon iyileştirmesi

- Onaylanan arayüz ve Half Pounder with Cheese fotoğrafları korundu. Kapsam, sahne animasyonları ve yedi yeni fotogerçekçi sos şişesiyle sınırlı. Tuz ve sirke mevcut sipariş seçenekleri olarak kalır.
- `charcoal-demo/sauce-motion.js` her sos için şişe görseli, ölçülmüş uç konumu, renk, kalınlık, akış direnci ve parlaklık tanımlar. Şişe sıkılırken uç sabit kalacak şekilde hafifçe sıkışır. Şişe ucu, akışın temas noktası ve burger üzerinde kalan iz aynı geometriyi paylaşır. Yedi şişe `charcoal-demo/assets/sauces/` altında.
- `charcoal-demo/ingredient-motion.js` düşüş ve temas profillerini tanımlar. Köfte hızlı ve az sekerek iner. Peynir döner ve temasla yayılır. Marul hafif dalgalanır, domates kısa sekmeyle oturur. Temas gölgesi ve alttaki katmanlara aktarılan kısa basınç, yerleşme hissini destekler. Üst ekmek en son kapanır.
- Çekim referansları, malzemelerin kontrollü bırakılması için [Chuck Studios](https://www.itsnicethat.com/articles/chuck-studios-burger-drop-process-advertising-290922) ve [Steve Giralt](https://petapixel.com/2016/08/18/built-special-burger-drop-machine-capture-one-slow-motion-shot/), sos akışı ve kapanış için [DFuse](https://www.dfuse.ca/en/blogs/portfolio/benny-co-x-firebarns) ve [Pexels yakın planı](https://www.pexels.com/video/close-up-of-hands-putting-ketchup-on-hot-dog-5429585/). Referans görüntüler projeye eklenmedi.
- Chromium'da masaüstü, dikey mobil ve kısa yatay mobilde sos ucu bağlantısı, sahne sınırları, üst ekmeğin sırası, hızlı seçimler, azaltılmış hareket, fiyat ve sepet kontrol edildi. Netlify önizlemesine çalışma ortamının ağ geçidi erişim vermedi.

## Menü seçenekleri denetimi

- Referans GitHub ana dalındaki `c41bf50` sürümünün `index.html` menü ve sipariş kodu. Canlı sipariş sitesinin adresi ve güncel yayını doğrulanamadı. Depodaki özelleştirme ekranları yerelde çalıştırılıp açılır bölümleri incelendi.
- Half Pounder with Cheese £6.90. Kaynaktaki 14 malzeme ve tercih seçeneğinin tamamı demoda mevcut. Ücretsiz seçenekler All Salad, Lettuce, Tomato, Cucumber, Onion, Pickle, Plain, No Veggie, No Onion, No Pepper ve No Cheese. Ücretli seçenekler Extra Cheese £0.30, Halloumi x2 £2.00 ve Egg £0.60. Menüdeki Pickle seçeneği demoda Pickle (gherkin) olarak görünür.
- Dokuz ücretsiz sos ve çeşni seçeneği Chilli Sauce, Garlic Mayo, Burger Sauce, BBQ Sauce, Ketchup, Mayo, Mustard, Salt ve Vinegar. Malzeme ve soslar çoklu seçilebilir, asgari seçim yoktur. Tuz ve sirke siparişe kaydedilir. Kategori bağlantıları tüm ilgili seçenekleri açar ve açılır bölümdeki ek seçenek sayısı görünür. No Veggie seçeneğinin mutfaktaki kapsamı kaynakta tanımlanmadığı için bu seçenek sepete kendi adıyla kaydedilir.
- Depoda `burger` akışını 15 ürün, `kebab` akışını dört Chicken Shish çeşidi, `meal` akışını altı Meal Deal kullanıyor. Burger ve kebab aynı 14 malzeme ve 9 sosu paylaşır. Meal Deal aynı listeye ücretsiz Cheese ekler. Chicken Shish ayrıca beş ücretsiz tercihten en az birini ister ve çoklu seçime izin verir. Bunlar Chilli, Extra Chilli, Little Chilli, No Chilli ve BBQ. Ayrı nuggets ve chips satırları `none` akışını kullanır.
- Meal Deal içecek grubu fiyata dâhil tam bir seçim ister. Water, Coca-Cola Classic, Coca-Cola Zero, Coca-Cola Diet, Pepsi, Tango Orange, Fanta Orange, Mirinda Strawberry, Ribena Strawberry ve Ribena Blackcurrant seçeneklerinin her biri ayrı içecek menüsünde £1.50. Ayrı içecek menüsü ayrıca Lucozade Orange ve Lucozade Original (£1.90), Red Bull (£2.30) sunar. Bunlar Meal Deal içecek listesinde yer almaz. Tek başına Half Pounder özelleştirmesinde içecek grubu bulunmaz.

## Menü geneline genişleme

- Kullanıcı Half Pounder with Cheese çalışmasını geçici olarak onayladı ve önizlemeyi menünün tamamına genişletme izni verdi. Kaynak, `main` dalındaki `c41bf50` menü ve sipariş kodu. Yedi çalışma grubunun kayıtları `charcoal-demo/products/` altında ayrı commit'lerle saklanıyor.
- Kaynakta siparişe açık 46 ürün var. Dana, tavuk ve sebze burgerleri, hot dog, dört Chicken Shish, patates, nuggets, çikolatalar, Halloumi Cheese Sandwich, 13 ayrı içecek ve altı Meal Deal kapsamda. Onion rings ve mozzarella sticks kaynakta siparişe açık ürün olarak bulunamadı. Fiyat ve seçenek eklenmedi.
- Aynı sepet ve sos katmanları ürünler arasında kullanılır. Meal Deal için fiyata dâhil on içecekten tam bir seçim, Chicken Shish için en az bir chilli tercihi gerekir.
- Tüm 46 kayıt Netlify önizleme yolu `charcoal-demo/menu.html` üzerinden seçilebilir. Ürün sayfaları ortak yerel sepeti kullanır. Menü ve sepet gezinmesi mevcut Half Pounder bağlantılarını korur.
- 12 geçici, şeffaf WebP katman üretildi. Tavuk ve sebze köftesi, hot dog ekmeği ve sosis, patates, nugget, tavuk şiş ve dört çikolata görseli mevcut sahneye uyarlandı. İçecekler ve Halloumi Cheese Sandwich kaynak menü fotoğraflarını kullanır. Sos şişeleri ve malzemeye göre değişen hareket profilleri ortaktır. Ürünlerin ayrı görsel işleri `VISUAL_BACKLOG.md` dosyasında.
- 46 ürünün her biri 1440×900 ve 390×844 Chromium görünümlerinde menüden açıldı. Ad, fiyat, görsel yükleme ve sayfalar arası sepet doğrulandı. Altı Meal Deal ve dört Chicken Shish ürününde zorunlu seçimler test edildi. Menü ve ortak sepet 568×320 yatay mobil emülasyonda da test edildi.
- Kaynak, patatesin ağırlığını, Meal Deal 4 nugget adedini, şiş porsiyon ağırlığını veya Half Pounder köfte adedini açıkça belirtmiyor. Sahne görselleri sunumu temsil eder. Yeni fiyat veya satın alma seçeneği eklenmedi. Canlı Netlify dağıtımı bu ortamın ağ geçidi nedeniyle doğrulanamadı.
- 14 temsilî üründe tekrar oynatma doğrulandı. Kapsam burger, hot dog, shish, nuggets, chips, çikolata, sandviç, içecek ve üç Meal Deal sahnesini içeriyor. Sos sunulan örneklerde şişe animasyonu da doğrulandı.

## Bağımsız müşteri incelemesi ve ekip çalışma yöntemi

- Kullanıcı, bağımsız tarayıcı incelemesi, bulguların ekip içinde değerlendirilmesi, uygulama ve bağımsız yeniden test sırasını kalıcı olarak onayladı. İki müşteri rolü tasarım ve uygulamadan bağımsızdır. Her görev en fazla üç iyileştirme turu kullanır.
- Uzman rol dağılımı, müşteri senaryoları ve doğrulama ilkeleri `AGENTS.md` dosyasında. İnceleme, teknik hatalarla birlikte menü mantığını, mobil gezinmeyi, görsel tutarlılığı ve hazırlama hareketlerinin ürüne uygunluğunu kapsar.

## Claude devralması (26 Kasım 2026)

- Kullanıcı projeyi Claude'a devretti. Claude `burger-builder` dalının `f7c06c4` commit'inden `claude-burger-builder` dalını açtı ve yalnızca bu dalda çalışır. `main` ve `burger-builder` değişmez. Kalıcı Claude talimatları `CLAUDE.md` dosyasında.
- İlk incelemede uygulama kodu ve tasarım değiştirilmedi. Yerel statik sunucuda Chromium 1440×900 ve iPhone 13 emülasyonunda menü (46 ürün), Half Pounder fiyatı (£6.90 → £7.20 Extra cheese ile), sepet, Meal Deal ve Chicken Shish zorunlu seçimleri, klavye sırası ve azaltılmış hareket kontrol edildi. Konsol hatası ve yatay taşma bulunmadı. Müşteri metninde Türkçe veya `£` dışı para birimi bulunmadı.
- Tespit edilen açıklar: Product Builder sepeti ana sitenin WhatsApp sipariş sepetine bağlı değil; bilinmeyen `?product=` değeri sessizce Half Pounder açıyor; mobilde seçenekler ilk ekranın altında kalıyor; sepette adet değiştirme yok; Chicken Shish sahnesi tabak yerine burger yığını gibi görünüyor; çeyrek pounder ürünleri aynı menü fotoğrafını paylaşıyor; onion rings ve mozzarella sticks kaynakta yok.
- Bu oturumdan GitHub push erişimi ve Netlify önizlemesi engelli. Commit'ler yerelde tutuldu.
- GitHub 403 araştırması: okuma çalışıyor (bağlı hesap `erhanburger`), git push ve GitHub API yazma (`create_branch`) `403 Resource not accessible by integration` döndürüyor. Sorun dal adı değil, Claude GitHub App'in depoda yazma izni olmaması. Kullanıcı ortamın tanımladığı `claude/erhan-burger-takeover-rhmow7` dalını onayladı; Claude dalı artık bu.
- Netlify: Codex sitesi `erhanburger-preview` korunur. Claude için ayrı `erhanburger-claude-preview` sitesi önerildi (Claude dalı, build komutu yok, yayın dizini kök).

## İlk geliştirme paketi (kullanıcı onayı 26 Kasım 2026)

- Sepette adet artırma/azaltma (en fazla 20), sipariş notu ve ana sitedeki WhatsApp gönderimiyle aynı biçimde "Order via WhatsApp" eklendi. Numara ve kapanış satırı `charcoal-demo/order-config.js` içinde, kaynak `main` `index.html`. Gönderimden sonra sepet boşalır ve onay metni görünür; telefonla sipariş bağlantısı da var. Yalnızca gel-al (collection).
- Bilinmeyen `?product=` değeri artık "Item not found" durumunu ve menü bağlantısını gösterir. Parametresiz adres Half Pounder açmaya devam eder.
- "Deal 1 – …" ve "Chicken Shish – …" başlıklarında ikinci satır tireyle başlamaz; tire yalnızca ekran okuyucuya okunur.
- Mobilde dahil (değiştirilemez) seçenek grupları tek satıra iner ve sahne yüksekliği `clamp(220px, 60vw, 300px)` oldu. iPhone 13 ve Pixel 7'de ilk seçenek satırı alt sipariş çubuğunun üstünde; iPhone SE'de kısmen görünür.
- Doğrulama: 1440×900 ve iPhone 13'te 46 ürün açılıyor, taşma ve konsol hatası yok; Egg ile 2 × £7.50 = £15.00 ve WhatsApp mesajı doğru.

## Bağımsız inceleme turu 1 (26 Kasım 2026)

- İki müşteri ajanı (masaüstü, mobil), bağımsız UX eleştirmeni ve QA ajanı yerel önizlemeyi test etti. QA 46 ürünün fiyatını `main` menüsüyle eşleştirdi; blocker veya major hata yok.
- Ortak bulgular ve uygulanan en küçük iyileştirmeler (`3afe109`): sepet menü ve ürün sayfalarında ortak pencere (`basket-ui.js`); menüdeki Basket düğmesi artık ürün sayfası açmıyor; WhatsApp sonrası sepet, müşteri "Yes, I’ve sent it" diyene kadar korunur; "Keep browsing" ürünün menü kategorisine döner; çelişen seçimler (`optionConflicts`, `catalog.js`) birbirini kaldırır; zorunlu seçim hatası grubun içinde görünür ve oraya kaydırılır; yalnızca fotoğraflı ürünlerde Replay gizli; kayıtlı adetler en fazla 20; menüde ve sepette gel-al, telefon ve alerji yönlendirmesi.
- Regresyon: masaüstü, iPhone 13 ve 844×390 yatay (azaltılmış hareket) görünümlerinde 46 ürünün tamamı sepete eklendi; taşma ve konsol hatası yok.

### Yeniden test ve tur 2

- Müşteri ajanları yeniden test etti: sepetin korunması, menüdeki sepet, Keep browsing, çakışan seçimler ve satır içi uyarı düzeldi; yeni sorun bildirilmedi.
- Tur 2 (kalan iki işlevsel bulgu): sepet penceresinde Subtotal ve "Order via WhatsApp" alt kısımda yapışkan; 4 ürünle iPhone SE'de bile kaydırmadan görünür. "Yes, I’ve sent it" sonrası sipariş özeti gösterilir ve son sipariş (`erhan_product_builder_last_order_v1`) boş sepette "Your last order" olarak kalır. 3 görünümde 46 ürün regresyonu temiz.

### Kullanıcı kararı bekleyen konular

- Ürüne özel seçenek listeleri: canlı sitede de shish, hot dog, veggie ve Meal Deal 4 (nuggets) burger malzemelerini (Extra cheese, Halloumi, Egg, No Veggie) sunuyor. Hangi ürünün neyi değiştirebileceği mutfak kuralıdır.
- Chilli tercihi: canlı site "Select all that apply" diyor; turda yalnızca No chilli ile chilli seviyeleri ve seviyelerin kendi arasındaki çakışma engellendi, BBQ ile birlikte seçilebilir.
- WhatsApp mesajına müşteri adı ve gel-al saati alanı eklenmesi.
- Basit ürünler (içecek, çikolata, nuggets, chips) için menüden tek dokunuşla ekleme; menüde arama, "Popular" ve kart açıklamaları.
- Shish sahnesinin tabak sunumu ve yumurta/marul görünürlüğü (animasyon sistemi işi).
- Nugget adları: canlı sitede sepete "6pcs Chicken Nuggets" olarak gidiyor, önizlemede "6 Chicken Nuggets".
- Açılış saatleri kaynakta yok; sitede gösterilmedi.

## GitHub erişimi düzeldi (26 Kasım 2026)

- Kullanıcı Claude GitHub App yazma iznini verdi. 6 commit `claude/erhan-burger-takeover-rhmow7` dalına push edildi ve uzakta `5d44715` doğrulandı. `main` (`c41bf50`) ve `burger-builder` (`f7c06c4`) değişmedi.
- Sıradaki adım ayrı Claude Netlify önizlemesi `erhanburger-claude-preview`. Bu çalışma ortamı Netlify'a erişemediği için site kullanıcı tarafından panelden oluşturulur.

## Önizleme kararı (26 Kasım 2026)

- Kullanıcı ayrı Netlify sitesinden vazgeçti; önizleme claude.ai üzerinden yapılacak. Özel önizleme: https://claude.ai/artifact/YMRpPZC9cLdz9xGYX4q425 (sürüm 1).
- `scripts/build-preview.py`, `charcoal-demo/` klasörünü ve üst dizinden kullandığı 28 paylaşılan görseli tek pakette toplar (`../` yolları `./shared/` olur). Paket 9,8 MB, 85 dosya.
- Önizleme ortamında açılır pencereler engellendiği için "Order via WhatsApp" düğmesi normal bağlantıya çevrildi; mesaj tıklamadan hemen önce güncellenir. Paket ve depo sürümünde 3 görünümde 46 ürün regresyonu, WhatsApp mesajı ve gönderim onayı temiz.

## Master Agent turu 1: site yapısı ve ürüne özel sunumlar (26 Kasım 2026)

- Kullanıcı Claude'u bağımsız Master Agent olarak yetkilendirdi (kurallar `CLAUDE.md`).
- Yeni ana sayfa `charcoal-demo/index.html`: açık/kapalı durumu (Europe/London), Popular meal deals (canlı sitede Deal 1, 2, 5 "Popular"), sipariş adımları, kategoriler, adres, harita, saatler ve telefon. Açılış saatleri canlı site başlığından: Mon–Sat 11am–8pm, Sun 11am–6pm. Ürün oluşturucu `product.html` oldu.
- Chips tek kart: Regular £2.90, "Make it large" +£1.00 (menüdeki £3.90 ile aynı toplam), Salt, Vinegar ve soslar. Nuggets tek kart: 6 adet £3.90, 9 adet +£1.00 (£4.90), soslar. Eski bağlantılar (`chips-large`, `chicken-nuggets-9`) ilgili seçimle açılır. Menü 44 kart.
- Chips ve nuggets için Salt/Vinegar ve soslar ücretsiz sunuldu (kullanıcı talimatı). Canlı sitede bu ürünlerde seçenek yok; mutfak kuralı olarak kullanıcı onayı bekliyor.
- İçecek ve çikolatalar menüden tek dokunuşla eklenir. Sepette isteğe bağlı isim alanı; WhatsApp mesajında "Name" satırı.
- Canlı sitedeki Deal 5 fotoğrafı (`IMG_0402.jpeg`) stok fotoğraf filigranı taşıyor; lisans riski. Önizlemede hot dog fotoğrafı (`IMG_0353.png`) kullanıldı. Canlı site için kullanıcıya bildirildi.
- Ürüne özel sunum: shish tabakta (salata solda, tavuk sağda, chips tabakta), nuggets ve chips kâğıtlı tepside, hot dog açık ekmek (arka yarı sosisin arkasında, peynir ve yumurta sosis boyunca), hot dog ve shish soslarında zikzak iz (`path: 'zigzag'`). Tabak/tepsi aksesuarları Visual Design ajanı tarafından Pillow ile üretildi (`assets/props/`).
- Regresyon: 3 görünümde 44 ürün sepete eklendi, hata yok. Önizleme sürüm 2 yayınlandı.

## Yeni aşama: Professional Design Research & Creative Redesign (26 Kasım 2026)

- Kullanıcı genel tasarım kalitesini yetersiz buldu ve araştırma, bağımsız değerlendirme, en az üç farklı tasarım konsepti ve ortak tasarım sistemiyle yeniden tasarım istedi. Ana fikir (interaktif hazırlama, animasyonlu önizleme, sepet, WhatsApp siparişi), ürünler, fiyatlar ve doğrulanmış kurallar korunur. Güçlü ortak karar çıkarsa uygulama için ayrıca onay gerekmez; seçim kişisel zevke kalırsa alternatifler kullanıcıya sunulur.
- Yeniden tasarım öncesi güvenli nokta: `92ae6d9` (Claude dalı, GitHub'a push edildi). Önizleme sürüm 3 aynı içerik.
- Araştırma için kişisel "erhanburger (design research)" ortamı oluşturuldu (kullanıcı onayıyla); referans siteler ve görsel sunucuları izinli. Erişilebilen: Shake Shack, Five Guys, Honest Burgers, Black Bear, Burger King, Wendy's, Burger & Lobster, Byron, GBK. Erişilemeyen: McDonald's ve Behance (bot koruması, 403), Awwwards (502), Dirty Burger, Bleecker, Patty & Bun (bağlantı yok).
- Araştırma ekibi: marka/yaratıcı yön, sipariş UX/dönüşüm, yemek görselleri/hareket, frontend/erişilebilirlik/performans. Bulgular `docs/design/` altına kalıcı olarak yazılacak.
- Araştırma tamamlandı ve kalıcı olarak kaydedildi: `docs/design/PRINCIPLES.md` (bağlayıcı ilkeler) ve `docs/design/research/` (brand, ordering-ux, imagery-motion, frontend, reference-carte). Kullanıcının referans videosu ve sitesi Carte (eat.brainy.ink, ücretli bir sipariş uygulaması) canlı incelendi; etkileşim fikirleri alındı, marka kopyalanmaz.
- Kullanıcının ekran görüntüsündeki "beyaz ana sayfa" sorunu bulundu: önizleme katmanı sayfayı açık renkli body ile sarıyordu, stil yalnızca `:root` arka planı veriyordu. `html, body` arka planı eklendi (`aa43f95`), önizleme sürüm 4.
- Konsept turu 1 başladı: brief `docs/design/CONCEPT_BRIEF.md`. Üç yön: `coal` (Coal & Cream, koyu sıcak ızgara evi), `daylight` (açık renkli editoryal mahalle markası), `ticket` (uygulama odaklı, mutfak fişi ve WhatsApp). Prototipler `charcoal-demo/concepts/<slug>/`. Paralel olarak bağımsız ajans denetimi yapılıyor.
- 27 Kasım 2026: Bağımsız ajans denetimi `docs/design/AUDIT.md` dosyasına yazıldı (öneri: altyapıyı ve veriyi koru, görsel sistemi ve bileşenleri yeniden kur). Standart ürün görsel seti `charcoal-demo/assets/products/` (25 saydam 800×800 WebP, `manifest.json` kalite notlarıyla). Yeni fotoğraf gereken: halloumi sandviç, chicken burger, Deal 6 (veggie), Diet Coke (fotoğraf "Coca-Cola light").
- Üç tasarımcı ajan kullanım limitine takılıp durdu; çalışmaları kaydedildi (`1f36b6e`) ve limit sıfırlanınca kaldıkları yerden devam ettirildi.
- 27 Kasım 2026: Üç konsept (coal, daylight, ticket) tamamlandı ve galeri önizlemesi yayınlandı: https://claude.ai/artifact/7BHN2KSjYvYA3hVAyoCSyU (`scripts/build-gallery-preview.py`). Üç bağımsız panel (tasarım, müşteri/UX, teknik) puanladı: `docs/design/EVALUATION.md`.
- Kullanıcı seçimi ajansa bıraktı. Karar: Ticket yönü, ortak animasyon motoru ve `basket-ui.js` üzerine tema olarak; Coal'dan koyu "kitchen pass" yemek sahnesi ve seçim halkası, Daylight'tan numaralı menü rayı ve kart düzeni alınır. Üretim sayfaları (`charcoal-demo/` index, menu, product, sepet) bu yönde yeniden kuruluyor; konseptler referans olarak kalır.
- Üretim sayfaları Ticket yönünde yeniden kuruldu (`6883235`): `tokens.css` + `components.css` tek tasarım sistemi (eski üç stil dosyası kaldırıldı), `shell.js` ve `art.js`, fiş biçiminde sepet (`basket-ui.js`, ekrandaki fiş ve WhatsApp mesajı tek fonksiyondan), telefonda alt çubuk, masaüstünde içerik rayı ve canlı fiş sütunu, koyu "kitchen pass" sahnede mevcut animasyon motoru, `product.html` gömülü görseller ayrı dosyalara taşındı (389 KB → 6 KB), normalize ürün görselleri ve kurgulanmış meal deal'ler. Geliştiricinin testi: 138 kontrol, 0 hata. Önizleme sürüm 5. Bağımsız QA, mobil müşteri ve eleştirmen yeniden testi sürüyor.
- Bağımsız yeniden test (Ticket yeniden kurulumu): QA 44/44 fiyat, tüm akışlar, 8 kapanış saati senaryosu, 435 metin taraması temiz; tek küçük kusur menü kartı odak halkası. Eleştirmen: profesyonellik 7,5, marka 8, görsel 7, bütünlük 6,5, işçilik 7; eski denetimin 15 sorunundan 7'si çözüldü, kalanlar kısmen. Mobil müşteri siparişi güvenle verdi; küçük ekran ve sepet düzeni sorunları buldu.
- Düzeltme turu 1 geliştirici ajana verildi (15 madde: küçük ekranda en az iki seçenek sırası, meal deal sahnesinde doğru ana ürün ve seçilen içecek, ürün çeşidine göre görseller, kart ve sahne tutarlılığı, büyük chips ve baharat görünürlüğü, sepette isim alanı ve sepetin katalogla yeniden doğrulanması, menü çipi vurgusu, odak halkası, tipografi inceltmeleri).
- Kullanıcı onayı bekleyen mutfak kuralı: hot dog ve shish gibi ürünlerde burger malzemelerinin (Halloumi, Extra cheese, No Veggie) sunulması canlı sitede de böyle; değiştirilmedi.
- Düzeltme turu 1 uygulandı (`b255bcc`): 15 madde; geliştirici testi 189 kontrol, 0 hata. Kartlar ve ana sayfa artık hazırlama sahnesinin durağan hali (`burger-layers.js`), ürün çeşitleri birbirinden ayrışıyor. Önizleme sürüm 6. Eleştirmen ve mobil müşteri yeniden test ediyor.
- Yeniden test (tur 1 sonrası): eleştirmen puanları profesyonellik 8, marka 8, görsel 7,5, bütünlük 8, işçilik 7,5; menü-sahne tutarlılığı, mobil sahne ve kesilen içerik düzeldi. Mobil müşteri: toplamlar ve WhatsApp birebir; 7 sorundan 4'ü düzeldi. Son düzeltme turu (tur 3, 12 madde) geliştiriciye verildi: büyük chips farkı, içecek kadrajı, SE taşmaları, fiyat dökümü, ürün sayfasından menüye bağlantı, chicken/veggie köfte görselleri, Deal 2 çift köfte ve içecek, menü kartlarının ağırlığı, öneri düğmeleri, sepet kaydırma ipucu, ana sayfa ve menü başlığı, tercih çakışma notu.
- Son düzeltme turu uygulandı (`eb7c549`): 12 madde; geliştirici testi 197 kontrol, 0 hata. Önizleme sürüm 7. Bilinen küçük kusur: dar ekranda "Ribena Blackcurrant" etiketi kırılıyor. QA son regresyonu çalıştırıyor.
- Son QA regresyonu (`f1af65b`): yeni hata yok. Menü kartı odak halkası ve katalogla sepet doğrulaması çözüldü; 44 ürün, taşma (1440/390/844×390/375/320), fiyatlar, çakışmalar, zorunlu seçimler, sepet, WhatsApp, eski bağlantılar ve klavye geçti. Tekrarlanmayanlar: dil taraması, beyaz zemin, kapanış saatleri, azaltılmış hareket (bunlar önceki turda geçmişti). Not: chips biletinde "Regular" satırı yazılıyor (mutfağa bilgi; kullanıcıya sorulabilir).

## Chicken Shish görsel ve etkileşim yükseltmesi (27 Kasım 2026)

- Kullanıcı mevcut tasarımı beğendi; ilk ürün kategorisi olarak Chicken Shish için gerçekçi, katmanlı, etkileşimli HP10 kutu sahnesi istedi. Şartname: `docs/design/SHISH_SPEC.md`. Kaynak fotoğraflar (2 gerçek, 5 ChatGPT referansı) `charcoal-demo/assets/source/shish/`.
- Porsiyon: Medium ~15, Large ~25 tavuk parçası; chips aynı. Fark parça sayısıyla gösterilir, ölçek/kamera değişmez.
- Araçlar: Pillow, NumPy, ImageMagick (OpenCV yok; paket kurulumu bu oturumda engellendi). Görsel üretim aracı yok, £0 bütçe: parçalar gerçek ızgara fotoğrafından kesilir, kutu yerelde üretilir.
- Ekip: Food Visualisation Expert (`assets/library/shish/` sprite kütüphanesi + manifest) ve Animation/Frontend (yeniden kullanılabilir `box-scene` motoru) paralel çalışıyor. Seçenek kararı: shish'ten anlamsız "No cheese" kaldırılır; ücretli ekstralar (Extra cheese, Halloumi, Egg) canlı menüde olduğu için kalır; "No Veggie" kapsamı ve salatanın varsayılan olup olmadığı kullanıcıya sorulacak.
