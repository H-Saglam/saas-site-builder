import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import JSZip from "jszip";
import type { SiteData, SlideData } from "@/lib/types";
import { siteRowToData } from "@/lib/types";

/*
  GET /api/download/[siteId]
  Premium kullanıcılar için offline HTML + CSS + görseller içeren ZIP oluşturur.
*/

function generateOfflineHTML(site: SiteData): string {
  const slidesHTML = site.slides
    .map((slide: SlideData) => {
      const gradient = `linear-gradient(135deg, ${slide.gradient.from}, ${slide.gradient.to})`;

      if (slide.type === "cover") {
        return `
    <div class="slide active" style="background:${gradient}">
      <div class="content">
        <h1 class="heading animate-up">Bu seni anlatan<br>bir hikaye<br><span style="color:#ff6b6b">${site.recipientName}</span> ❤️</h1>
        <p class="description animate-pop">Dokunarak ilerle →</p>
      </div>
    </div>`;
      }

      if (slide.type === "photo") {
        return `
    <div class="slide" style="background:${gradient}">
      <div class="content">
        <h2 class="heading animate-up">${slide.heading}</h2>
        ${slide.imageUrl ? `<img src="${slide.imageUrl}" class="photo animate-pop" alt="">` : ""}
        <p class="description animate-pop">${slide.description}</p>
      </div>
    </div>`;
      }

      if (slide.type === "collage") {
        const imgs = (slide.collageUrls ?? [])
          .map((url: string) => `<img src="${url}" class="collage-img" alt="">`)
          .join("\n          ");
        return `
    <div class="slide" style="background:${gradient}">
      <div class="content">
        <h2 class="heading animate-up">${slide.heading}</h2>
        <div class="collage-container animate-pop">
          ${imgs}
        </div>
        <p class="description animate-pop">${slide.description}</p>
      </div>
    </div>`;
      }

      if (slide.type === "text") {
        return `
    <div class="slide" style="background:${gradient}">
      <div class="content">
        <h2 class="heading animate-up">${slide.heading}</h2>
        <p class="description animate-pop" style="font-size:1.1rem;max-width:90%">${slide.description}</p>
      </div>
    </div>`;
      }

      // finale
      return `
    <div class="slide" style="background:${gradient}">
      <div class="content">
        <h2 class="heading animate-up">${slide.heading}</h2>
        ${slide.imageUrl ? `<img src="${slide.imageUrl}" class="photo animate-pop" alt="">` : ""}
        <p class="description animate-pop">${slide.description}</p>
        ${slide.handPointerText ? `<div class="hand-pointer animate-pop">${slide.handPointerText}</div>` : ""}
        <button class="replay-btn" onclick="replay()">🔄 Tekrar İzle</button>
      </div>
    </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${site.title}</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="container">
    <div class="progress-container">
      ${site.slides.map((_: SlideData, i: number) => `<div class="progress-bar${i === 0 ? " active" : ""}" data-index="${i}"></div>`).join("\n      ")}
    </div>
    ${slidesHTML}
  </div>
  <script src="script.js"><\/script>
</body>
</html>`;
}

function generateOfflineCSS(): string {
  return `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', sans-serif; overflow: hidden; background: #000; }
.container { width: 100vw; height: 100vh; position: relative; overflow: hidden; }
.slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.6s ease; z-index: 1; }
.slide.active { opacity: 1; z-index: 2; }
.content { text-align: center; color: #fff; padding: 20px; }
.heading { font-size: 1.6rem; margin-bottom: 15px; animation: animateUp 0.8s ease forwards; }
.description { font-size: 0.95rem; opacity: 0.9; animation: animatePop 0.6s ease 0.3s both; }
.photo { width: min(280px,80vw); height: min(280px,80vw); object-fit: cover; border-radius: 16px; margin: 15px auto; box-shadow: 0 8px 32px rgba(0,0,0,0.3); animation: animatePop 0.6s ease both; }
.collage-container { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin: 15px auto; }
.collage-img { width: 120px; height: 120px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
.collage-img:nth-child(1) { transform: rotate(-3deg); }
.collage-img:nth-child(2) { transform: rotate(2deg) translateY(-10px); }
.collage-img:nth-child(3) { transform: rotate(-1deg); }
.hand-pointer { font-size: 1.2rem; margin-top: 10px; animation: handBounce 1.5s ease infinite; }
.replay-btn { margin-top: 20px; padding: 12px 24px; border-radius: 50px; border: 2px solid #fff; background: rgba(255,255,255,0.15); color: #fff; font-size: 1rem; cursor: pointer; }
.progress-container { position: fixed; top: 12px; left: 12px; right: 12px; display: flex; gap: 4px; z-index: 100; }
.progress-bar { flex: 1; height: 3px; background: rgba(255,255,255,0.3); border-radius: 4px; overflow: hidden; }
.progress-bar.active { background: rgba(255,255,255,0.9); }
.progress-bar.done { background: rgba(255,255,255,0.9); }
@keyframes animateUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
@keyframes animatePop { from { opacity:0; transform:scale(0.8); } to { opacity:1; transform:scale(1); } }
@keyframes handBounce { 0%,100% { transform:translateX(0); } 50% { transform:translateX(-10px); } }
`;
}

function generateOfflineJS(totalSlides: number): string {
  return `(function(){
  var current = 0;
  var total = ${totalSlides};
  var slides = document.querySelectorAll('.slide');
  var bars = document.querySelectorAll('.progress-bar');

  function go(n) {
    if (n < 0 || n >= total) return;
    slides[current].classList.remove('active');
    bars[current].classList.remove('active');
    bars[current].classList.add('done');
    current = n;
    slides[current].classList.add('active');
    bars[current].classList.add('active');
  }

  document.querySelector('.container').addEventListener('click', function(e) {
    var x = e.clientX / window.innerWidth;
    if (x > 0.2) go(current + 1);
    else go(current - 1);
  });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') go(current + 1);
    if (e.key === 'ArrowLeft') go(current - 1);
  });

  window.replay = function() { go(0); };
})();`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params;
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const supabase = getServiceSupabase();
  const { data: row, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", siteId)
    .eq("user_id", userId)
    .single();

  if (error || !row) {
    return NextResponse.json({ error: "Site bulunamadı" }, { status: 404 });
  }

  // Premium kontrol
  if (row.package_type !== "premium") {
    return NextResponse.json(
      { error: "ZIP indirme sadece Premium paket için geçerlidir" },
      { status: 403 }
    );
  }

  const site = siteRowToData(row);

  // ZIP oluştur
  const zip = new JSZip();
  zip.file("index.html", generateOfflineHTML(site));
  zip.file("styles.css", generateOfflineCSS());
  zip.file("script.js", generateOfflineJS(site.slides.length));

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${site.slug}-offline.zip"`,
    },
  });
}
