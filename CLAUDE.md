# CLAUDE.md — Er-Han Burger

Claude için kalıcı proje talimatları. `AGENTS.md` tüm ajanlar için geçerlidir ve bu dosya onu tamamlar. Çelişki olursa kullanıcının güncel talimatı, sonra bu dosya, sonra `AGENTS.md` geçerlidir.

## Dallar

- Claude yalnızca `claude/erhan-burger-takeover-rhmow7` dalında çalışır (kullanıcı 26 Kasım 2026'da onayladı; dal adı önemli değil, Codex'ten bağımsızlık önemli). Bu dal `burger-builder` dalının `f7c06c4` commit'inden açıldı. Eski yerel ad `claude-burger-builder` artık kullanılmaz.
- `main` ve `burger-builder` dallarına hiçbir koşulda commit veya push yapılmaz. Codex ve alt ajanları `burger-builder` üzerinde çalışmaya devam eder.
- `burger-builder` dalındaki yenilikler yalnızca kullanıcı isterse Claude dalına alınır (merge, rebase değil).
- `AGENTS.md` içindeki “`burger-builder` dalında uygula” ifadeleri Claude için kendi dalı olarak okunur.

## Rol ve karar yetkisi (kullanıcı talimatı, 26 Kasım 2026)

- Claude, projeyi bağımsız yöneten Master Agent'tır. Uzman ajanlar: UI/UX, Animation, Visual Design, Frontend Developer, Mobile Customer, Desktop Customer, Critical Reviewer, QA. Ajanlar birbirinin çalışmasını eleştirir, alternatif önerir; müşteri ajanları bağımsız kalır. Tekrarlayan testler azaltılır, ajanlar yalnızca fayda sağladıkları yerde kullanılır.
- Döngü: tarayıcıda incele → müşteri senaryoları → eksik ve fırsatları belirle → uzmanlarla değerlendir → en iyi çözümü uygula → bağımsız yeniden test → hafıza ve GitHub'a kaydet → sonraki tur. Görev bitince yeni görev beklemeden sıradaki anlamlı işe geçilir; her değişiklik ölçülebilir fayda sağlamalıdır.
- Tasarım, kullanıcı deneyimi, animasyon, performans ve teknik iyileştirmelerde Claude onay beklemeden karar verir.
- Onay gerektirenler: fiyat değişiklikleri, doğrulanamayan menü içerikleri, gerçek mutfak kuralları, ücretli servisler, canlı sitenin yayınlanması, `main` değişiklikleri.
- Öncelik: tüm sitenin konsepti, altyapısı, animasyon sistemi ve işlevselliği. Tek tek ürün görsellerinin mükemmelleştirilmesi son aşamaya kalır.
- Her ürün kendi gerçek hazırlanış ve sunumuyla gösterilir; her şey burger mantığıyla dizilmez.

## Onay kapıları

- Büyük kapsam değişikliklerinde kullanıcı bilgilendirilir; yukarıdaki onay gerektiren konular dışında Claude karar verir.
- Yeni arayüz, ana siteye entegrasyon, canlı site, üretim dağıtımı ve `main` değişiklikleri ayrı açık onay gerektirir.
- Ücretli harici servisler (görsel üretim API'leri, barındırma, ücretli araçlar) onaysız kullanılmaz. Harici harcama bütçesi £0.
- Fotogerçekçi yeni ürün fotoğrafları son aşamaya kalır. Geçici sunum aksesuarları (tabak, tepsi) Pillow ile yerelde üretilebilir.
- Kimlik bilgileri, API anahtarları ve kişisel veriler depoya yazılmaz.

## Tasarım kaynakları (kalıcı)

- Tasarım kararları: `docs/design/PRINCIPLES.md`. Araştırma kanıtları: `docs/design/research/` (brand, ordering-ux, imagery-motion, frontend, reference-carte). Yeni tasarım işinden önce bu dosyalar okunur; araştırma tekrarlanmaz, yalnızca eksik kalan konu araştırılır.
- Kullanıcının referansı Carte (eat.brainy.ink): etkileşim fikirleri alınır, marka, renk, yazı tipi ve görseller kopyalanmaz.
- Önizleme katmanı sayfayı açık renkli bir body içine sarar: her sayfa kendi `body` arka planını açıkça verir.

## Müşteriye görünen dil ve para birimi

- Müşteriye görünen her metin British English olur: sayfalar, menü, ürün ve malzeme adları, düğmeler, animasyon durum metinleri, bildirimler, hata mesajları, sepet ve ödeme ekranları, erişilebilir adlar (`aria-label`, `alt`) ve yedek görünümler.
- Müşteri arayüzünde Türkçe metin bulunmaz. Fiyatlar GBP, `£` simgesiyle ve `en-GB` biçiminde gösterilir. Fiyatlar kodda tamsayı pence olarak tutulur.
- Terimler: “Customise”, “Add to basket”, “Basket”, “Chips”, “Colour”, “Mayonnaise”.
- Kullanıcıyla iletişim, proje notları (`PROJECT_STATE.md`, `TASKS.md`) Türkçedir.

## Ürün ve menü doğruluğu

- Ürün, porsiyon, malzeme ve fiyat kaynağı `main` dalındaki `index.html` menüsüdür (`c41bf50`). Kaynakta olmayan fiyat, ürün veya kural uydurulmaz; çözülmemiş konular `PROJECT_STATE.md` dosyasına yazılır.
- Product Builder veri odaklıdır: ürünler `charcoal-demo/products/*.js`, ortak seçenekler `charcoal-demo/catalog.js`, sahne profilleri `charcoal-demo/product-profiles.js`. Desteklenen düzenler için yeni ürün ortak kod değişikliği gerektirmemelidir.
- Onaylı Charcoal Studio görsel dili ve Half Pounder with Cheese fotoğrafları korunur.

## Çalışma yöntemi

- `AGENTS.md` içindeki bağımsız inceleme akışı uygulanır: önce bağımsız tarayıcı yolculukları, sonra en küçük doğrulanmış iyileştirme, sonra bağımsız yeniden test. Görev başına en fazla üç iyileştirme turu.
- Alt ajanlar yalnızca somut ihtiyaçta ve kullanıcının izniyle başlatılır. Her brief görevi, dosya kapsamını, kabul ölçütlerini ve British English + GBP kuralını açıkça içerir. Müşteri ajanları tasarım/uygulama bağlamı almadan, yalnızca site adresi ve senaryoyla çalışır.
- Önemli kararlar ve test sonuçları `PROJECT_STATE.md` ve `TASKS.md` dosyalarına yazılır. İncelenmiş iş commit edilip Claude dalına push edilir.

## Önizleme

- Codex önizlemesi `erhanburger-preview.netlify.app` (`burger-builder`) değiştirilmez. Kullanıcı Claude için ayrı Netlify sitesinden vazgeçti (26 Kasım 2026).
- Claude önizlemesi claude.ai üzerinde özel bir sayfadır: https://claude.ai/artifact/YMRpPZC9cLdz9xGYX4q425 . Her yeni sürümde `python3 scripts/build-preview.py <oturum-çalışma-alanı>/preview` ile paket üretilir, paket test edilir ve aynı sayfaya yeniden yayınlanır (adres değişmez). Paket depoya eklenmez.
- Önizleme sayfasında açılır pencereler engellidir; bu yüzden harici bağlantılar (WhatsApp) `window.open` değil, normal `<a target="_blank">` bağlantısıdır.

## Yerel çalıştırma ve test

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # depo kökünden
# http://127.0.0.1:4173/charcoal-demo/              (ana sayfa)
# http://127.0.0.1:4173/charcoal-demo/menu.html
# http://127.0.0.1:4173/charcoal-demo/product.html?product=half-pounder-with-cheese
```

- Bulut ortamında Chromium ve Playwright hazırdır (`require('playwright')`). Yeniden kurulmaz.
- Her değişiklikten sonra en az şunlar doğrulanır: 1440×900 masaüstü ve iPhone 13 emülasyonu; menüdeki 44 kartın açılması; fiyat ve sepet; zorunlu seçimler (Meal Deal içeceği, Chicken Shish chilli tercihi); klavye gezinmesi; azaltılmış hareket; yatay taşma yok; konsol hatası yok; müşteri metninde Türkçe veya `£` dışı para birimi yok.
- Test betikleri ve ekran görüntüleri depoya değil oturum çalışma alanına yazılır; yalnızca kullanıcıya sunulacak kanıtlar `docs/` altına eklenir.
