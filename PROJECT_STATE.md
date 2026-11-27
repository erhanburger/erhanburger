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
- İlk turda iki bağımsız müşteri ajanı önceki 46 menü kartının tamamını masaüstü ve mobilde seçip sepete ekledi. Menüyü kapatan sepetin Half Pounder sayfasına dönmesi, mobilde gizlenen kategoriler, menüye dönüşte kategori kaybı ve birbiriyle çelişen chilli/peynir notları belirlendi. Bağımsız UX incelemesi mobil kategori erişimini ve kart görsellerini ayrıca inceledi.
- Menüde tek Chips kartı var. Kaynak fiyatları £2.90 ve £3.90, dolayısıyla Make it large farkı £1.00. Eski küçük ve büyük boy bağlantıları yeni ekrana gider. Salt ve No salt tek tercih alanında. Sos adları mevcut menüden gelir ve önizleme sepetine talep olarak yazılır. Kaynakta Chips için sosun bulunabilirliği ve ek ücreti belirtilmez. Bu nedenle ayrıca teyit gerekir.
- Sepette Continue shopping, kategoriye geri dönüş, kaydırırken görünen menü sepeti ve mobil Jump to seçici eklendi. Çelişen chilli veya peynir seçimleri için uyarı gösterilir. Kaynaktaki çoklu seçim kuralları korunur.
- Hot Dog ve Deal 5 açık yarıklı üstten görünen ekmekle hazırlanır. Sosis ve malzemeler yarığa yerleşir, sos ekmek boyunca uygulanır. Chicken Shish fotoğraftaki ızgara tavuğu ve sebzeleri ayrı salatayla gösterir. Medium ve Large görsel ölçekte ayrılır, chips yalnız ilgili çeşitlerde görünür. Porsiyon ağırlığı, servis kabı ve nihai kart fotoğrafı gereksinimleri `VISUAL_BACKLOG.md` içinde.
- Aynı turun bağımsız yeniden testinde iki müşteri ajanı yeni akışları kontrol etti. Ayrı QA uzmanı 45 kartın tamamını 1440×900 ve 390×844 Chromium görünümlerinde sepete ekledi. Chips boyutu, tuz ve çoklu sos notları, Hot Dog ve Shish görselleri, menüye dönüş ve zorunlu seçenekler doğrulandı. 568×320 yatay mobilde hedefli kontroller de geçti. Fiziksel mobil cihaz testi yapılmadı.

## Araştırma ve yeniden tasarım

- Yeniden tasarım öncesi geri dönüş noktası `c59a5f7bce82a2ac49248c319ed2881b59311f74`. Çalışma ağacı temizdi ve GitHub `burger-builder` başının aynı commit olduğu doğrulandı. Bu sürümde 45 menü kartı, Chips boyut seçimi, bağımsız testler, yarıklı Hot Dog ekmeği ve ayrı Chicken Shish sunumu mevcut.
- Kullanıcı görsel tasarım özgürlüğünü genişletti. Önizleme yeniden tasarlanabilir. Doğrulanmış menü, sipariş ve sepet kuralları, GBP ve müşteri arayüzünde British English korunur. Üç gerçekten farklı konsept hazırlanır ve bağımsız değerlendirme yapılır. Ticari kurallar mevcut doğrulanmış kayıtlara dayanır.
- Yalnızca `burger-builder` dalı kullanılacak. Netlify kredi limiti nedeniyle yeni dağıtım denemesi yapılmaz. Harici bütçe £0.
- Birincil referans `eat.brainy.ink`, Chromium masaüstü ve mobilde ağ geçidinde engellendi. Alan adına özel erişim isteğinin onayı tamamlanmadı. Görsel teknoloji, özelleştirme, mobil davranış ve performans doğrulanamadı. Yayımlanmış teknik vaka çalışmaları ve restoran menü incelemeleri `docs/experience-review/` altında.
- Open Grill, Order Counter ve Build Room prototipleri masaüstü ve mobil görselleriyle kaydedildi. Bağımsız inceleme tek üstün yön bulmadı. Tam menü keşfinde Order Counter, etkileşimli hazırlamada Build Room, marka sunumunda Open Grill öne çıktı. Üretim kodu ve doğrulanmış sipariş kuralları korundu. Tasarım seçimi ve erişim doğrulanınca uygulama ölçütleri yeniden değerlendirilecek.
