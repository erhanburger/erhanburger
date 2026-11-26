# CLAUDE.md — Er-Han Burger

Claude için kalıcı proje talimatları. `AGENTS.md` tüm ajanlar için geçerlidir ve bu dosya onu tamamlar. Çelişki olursa kullanıcının güncel talimatı, sonra bu dosya, sonra `AGENTS.md` geçerlidir.

## Dallar

- Claude yalnızca `claude-burger-builder` dalında çalışır. Bu dal `burger-builder` dalının `f7c06c4` commit'inden açıldı.
- `main` ve `burger-builder` dallarına hiçbir koşulda commit veya push yapılmaz. Codex ve alt ajanları `burger-builder` üzerinde çalışmaya devam eder.
- `burger-builder` dalındaki yenilikler yalnızca kullanıcı isterse `claude-burger-builder` dalına alınır (merge, rebase değil).
- `AGENTS.md` içindeki “`burger-builder` dalında uygula” ifadeleri Claude için `claude-burger-builder` olarak okunur.

## Onay kapıları

- Tasarım veya uygulama değişikliğine başlamadan önce kullanıcı onayı alınır.
- Yeni arayüz, ana siteye entegrasyon, canlı site, üretim dağıtımı ve `main` değişiklikleri ayrı açık onay gerektirir.
- Ücretli harici servisler (görsel üretim API'leri, barındırma, ücretli araçlar) onaysız kullanılmaz. Harici harcama bütçesi £0.
- Half Pounder with Cheese dışındaki ürünler için yeni görsel üretimi kullanıcı onayı gerektirir.
- Kimlik bilgileri, API anahtarları ve kişisel veriler depoya yazılmaz.

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
- Önemli kararlar ve test sonuçları `PROJECT_STATE.md` ve `TASKS.md` dosyalarına yazılır. İncelenmiş iş commit edilip `claude-burger-builder` dalına push edilir.

## Yerel çalıştırma ve test

```sh
python3 -m http.server 4173 --bind 127.0.0.1   # depo kökünden
# http://127.0.0.1:4173/charcoal-demo/menu.html
# http://127.0.0.1:4173/charcoal-demo/?product=half-pounder-with-cheese
```

- Bulut ortamında Chromium ve Playwright hazırdır (`require('playwright')`). Yeniden kurulmaz.
- Her değişiklikten sonra en az şunlar doğrulanır: 1440×900 masaüstü ve iPhone 13 emülasyonu; menüdeki 46 ürünün açılması; fiyat ve sepet; zorunlu seçimler (Meal Deal içeceği, Chicken Shish chilli tercihi); klavye gezinmesi; azaltılmış hareket; yatay taşma yok; konsol hatası yok; müşteri metninde Türkçe veya `£` dışı para birimi yok.
- Test betikleri ve ekran görüntüleri depoya değil oturum çalışma alanına yazılır; yalnızca kullanıcıya sunulacak kanıtlar `docs/` altına eklenir.
