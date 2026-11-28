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

## Permanent Product Builder architecture

- Build a shared, data-driven Product Builder for the full Er-Han Burger menu. Support beef, chicken and veggie burgers, hot dogs, chicken shish, chicken nuggets, chips, onion rings, mozzarella sticks, meal deals and other existing products and sauces.
- Product data defines portions, prices in integer pence, choice groups and rules, images, and optional animation profiles. Reuse approved ingredient assets, sauce animations and interface components across products. A new menu product should require catalogue data and its approved assets, with no changes to the shared builder for supported layouts and animation types.
- Use the existing menu as the source for products, portions, ingredients and prices. Wait for user approval before generating other product imagery. Half Pounder with Cheese is the initial implementation and QA product.

## Permanent independent review workflow

- The Master Agent coordinates eight specialist roles: UI/UX Designer, Frontend Developer, Animation Specialist, Food Visualisation Expert, Customer Experience Agent 1, Customer Experience Agent 2, Independent UX Critic, and QA & Testing Agent. When concurrency is limited, sequence the roles or pair related delivery roles. Keep the two customer agents independent of design and implementation.
- Begin with independent browser journeys. Customer agents select products, customise and add to the preview basket on desktop and mobile. The critic and QA review discoverability, commercial and menu logic, accessibility, realism, motion and edge cases.
- Share evidence across roles, agree the smallest verified improvements, implement on `burger-builder`, and ask independent agents to retest. Limit each development task to three improvement rounds. Verify facts against the approved menu or user instructions. Record unresolved prices, ingredients and commercial rules.
- Match the preparation and animation to the actual product. Preserve the approved Charcoal Studio language, British English and GBP. Commit and push reviewed work as it is completed. Release or changes to the live site require separate user approval.

## Experience redesign rules

- Use `eat.brainy.ink` as the primary experience reference. Inspect it in a real desktop and mobile browser when access permits. Separate observed behaviour and browser evidence from architectural hypotheses. Do not copy another site's identity, assets or interface.
- Research professional restaurant and design examples, then share the findings in project memory. Develop at least three materially different concepts covering layout, typography, brand character, product presentation and the customer journey. Use independent customer and QA reviews.
- The previous Charcoal Studio visual direction may be replaced in the preview. Preserve interactive food preparation, the working basket and ordering logic, verified menu facts, and British English with GBP. Implement an option without another design approval only if independent review finds a clear winner. Where design taste decides, present the alternatives.
- Record and verify a clean, pushed baseline before redesign. Work only on `burger-builder`. Do not inspect or change other branches. Use the dedicated Cloudflare Pages preview at https://erhanburger-preview.pages.dev, connected to the `burger-builder` branch. Do not use Netlify. Use free preview methods and spend £0 externally. The three-round limit still applies.

## Permanent Master Agent completion rule

- Break the assignment into phases, delegate specialised work, review the results and have defects corrected. Move directly to the next authorised phase without waiting for routine approval or a new command.
- Complete technical and independent visual checks, exercise the customer flow in a real browser, push the reviewed work to `burger-builder`, and verify the Cloudflare Pages release. Keep the live site and all other branches outside the work.
- End a turn before completion only when progress genuinely requires the user's intervention, such as a missing source, permission, or paid action, or when a technical runtime or usage limit prevents further work. Record completed work, pending work and the concrete blocker in project memory before stopping.
