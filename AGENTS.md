# Roller ve çalışma kuralları

- Proje sorumlusu `burger-builder` dalındaki kararları ve görevleri günceller, entegrasyonu inceler ve teslimatı doğrular.
- Gerektiğinde 3D görsel uzmanı malzeme geometrisi, yüzey dokuları, ışık ve mobil GPU bütçesinden sorumludur. Önceki oturumda bu rol için bir ajan kullanıldı.
- Gerektiğinde web entegrasyon uzmanı özelleştirme penceresi, dokunmatik ve klavye etkileşimi, 2D yedek görünüm ve sepet uyumluluğundan sorumludur. Önceki oturumda bu rol için bir ajan kullanıldı.
- QA sorumlusu masaüstü ve mobilde görseli, malzeme değişimini, etkileşimleri, yedek görünümü ve sepete eklemeyi doğrular.
- Yalnızca somut ihtiyaç olduğunda uzman ajan oluştur. Görev, dosya kapsamı ve kabul ölçütlerini belirt.
- Çalışmayı `burger-builder` dalında tut. `main` değişiklikleri, üretim dağıtımı ve ücretli hizmetler için açık onay al.
- Önemli kararları ve test sonuçlarını `PROJECT_STATE.md` ve `TASKS.md` dosyalarına yaz. Kimlik bilgilerini depoya ekleme.

## Permanent customer-facing language and currency rules

- Use British English across the entire Er-Han Burger website. This includes every page, menu, product description, ingredient name, button, animation caption or status, notification, error message, basket and checkout screen, including accessible names and fallback states.
- Customer-facing interfaces must contain no Turkish text. Display all prices in pounds sterling (GBP) with the £ symbol. Use British English terms such as “Customise” and “Add to basket”.
- Apply these rules to all future design and development tasks. Include them explicitly in every subagent brief and verify them during review.
- Obtain the user's approval before implementing a proposed new interface, integrating it into the existing website or modifying the live website.
