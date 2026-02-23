import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import JSZip from "jszip";
import type { SiteData, SlideData } from "@/lib/types";
import { siteRowToData } from "@/lib/types";
import fs from "fs";
import path from "path";

/*
  GET /api/download/[siteId]
  Premium kullanıcılar için offline HTML + CSS + görseller içeren ZIP oluşturur.
  Canlı siteyle birebir aynı HTML/CSS/JS yapısını kullanır.
*/

// Escape user content for safe HTML interpolation
function esc(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function songBadgeHTML(songTitle?: string, songArtist?: string): string {
  if (!songTitle || !songArtist) return "";
  return `
      <div class="song-badge">
        <div class="equalizer">
          <span></span><span></span><span></span>
        </div>
        <div class="song-info">
          <span class="song-title">${esc(songTitle)}</span>
          <span class="artist">${esc(songArtist)}</span>
        </div>
      </div>`;
}

function generateSlideHTML(slide: SlideData, index: number, site: SiteData, urlToLocalMap: Record<string, string>): string {
  const gradient = `linear-gradient(135deg, ${slide.gradient.from}, ${slide.gradient.to})`;
  const isFirst = index === 0;
  const activeClass = isFirst ? " active" : "";
  const songTitle = site.musicTrack?.title;
  const songArtist = site.musicTrack?.artist;
  const badge = songBadgeHTML(songTitle, songArtist);

  switch (slide.type) {
    case "cover":
      return `
    <section class="slide${activeClass}" style="background:${esc(gradient)}">
      ${badge}
      <div class="content">
        <h1 class="animate-up">${esc(site.recipientName)}...</h1>
        <p class="animate-up delay-1">${esc(slide.description || "")}</p>
        <div class="tap-hint" id="tap-hint">Başlamak için dokun ❤️</div>
      </div>
    </section>`;

    case "photo": {
      const localUrl = slide.imageUrl ? urlToLocalMap[slide.imageUrl] || slide.imageUrl : "";
      return `
    <section class="slide${activeClass}" style="background:${esc(gradient)}">
      ${badge}
      <div class="content">
        <div class="photo-frame animate-pop">
          ${localUrl ? `<img src="${esc(localUrl)}" alt="${esc(slide.heading)}">` : ""}
        </div>
        <h2 class="animate-up">${esc(slide.heading)}</h2>
        ${slide.description ? `<p class="animate-up delay-1">${esc(slide.description)}</p>` : ""}
      </div>
    </section>`;
    }

    case "collage": {
      const imgs = (slide.collageUrls ?? [])
        .map((url: string, i: number) => {
          const localUrl = urlToLocalMap[url] || url;
          return `<img src="${esc(localUrl)}" class="c-img c-${i + 1} animate-pop delay-${i + 1}" alt="Kolaj ${i + 1}">`;
        })
        .join("\n          ");
      return `
    <section class="slide${activeClass}" style="background:${esc(gradient)}">
      ${badge}
      <div class="content">
        <div class="collage">
          ${imgs}
        </div>
        <h2 class="animate-up">${esc(slide.heading)}</h2>
        ${slide.description ? `<p class="animate-up delay-1">${esc(slide.description)}</p>` : ""}
      </div>
    </section>`;
    }

    case "text":
      return `
    <section class="slide slide-text${activeClass}" style="background:${esc(gradient)}">
      ${badge}
      <div class="content">
        <div class="text-content">
          <h2 class="animate-up">${esc(slide.heading)}</h2>
          ${slide.description ? `<p class="animate-up delay-1">${esc(slide.description)}</p>` : ""}
        </div>
      </div>
    </section>`;

    case "finale": {
      const localUrl = slide.imageUrl ? urlToLocalMap[slide.imageUrl] || slide.imageUrl : "";
      return `
    <section class="slide slide-finale${activeClass}" style="background:${esc(gradient)}">
      ${badge}
      <div class="content">
        ${localUrl ? `
        <div class="photo-frame animate-pop">
          <img src="${esc(localUrl)}" alt="Final">
          ${slide.handPointerText ? `<div class="hand-pointer">${esc(slide.handPointerText)}</div>` : ""}
        </div>` : ""}
        <h1 class="animate-up delay-1">${esc(slide.heading)}</h1>
        ${slide.description ? `<p class="animate-up delay-2">${esc(slide.description)}</p>` : ""}
        <button class="replay-btn" onclick="replay()">Başa Dön ↺</button>
      </div>
      <canvas class="confetti-canvas" id="confetti-canvas"></canvas>
    </section>`;
    }

    default:
      return "";
  }
}

function generateProgressBarHTML(totalSlides: number): string {
  const bars = Array.from({ length: totalSlides }, (_, i) => {
    const slideNum = i + 1;
    const width = slideNum === 1 ? "50%" : "0%";
    return `      <div class="progress-bar-wrapper">
        <div class="progress-bar${slideNum < 1 ? " completed" : ""}" style="width:${width}"></div>
      </div>`;
  });
  return `    <div class="progress-container">\n${bars.join("\n")}\n    </div>`;
}

function generateOfflineHTML(site: SiteData, urlToLocalMap: Record<string, string>): string {
  const slidesHTML = site.slides
    .map((slide, index) => generateSlideHTML(slide, index, site, urlToLocalMap))
    .join("\n");

  const musicUrl = site.musicTrack?.fileUrl || "";
  const musicTag = musicUrl
    ? `<audio id="bg-music" src="${esc(musicUrl)}" loop preload="auto"></audio>`
    : "";

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${esc(site.title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
  <style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;overflow:hidden;background:#000}</style>
</head>
<body>
  <div class="template-container" id="container">
${generateProgressBarHTML(site.slides.length)}
    <div class="slides-container">
${slidesHTML}
    </div>
    <div class="navigation-hint">Devam etmek için tıkla &rarr;</div>
  </div>
  ${musicTag}
  <script src="script.js"><\/script>
</body>
</html>`;
}

function generateOfflineJS(totalSlides: number, hasMusic: boolean): string {
  return `(function() {
  var current = 1;
  var total = ${totalSlides};
  var isFirstTap = true;
  var touchStartX = 0;

  var container = document.getElementById('container');
  var slides = document.querySelectorAll('.slide');
  var barWrappers = document.querySelectorAll('.progress-bar-wrapper');
  var tapHint = document.getElementById('tap-hint');
  ${hasMusic ? `var audio = document.getElementById('bg-music');` : ""}

  function updateProgress() {
    barWrappers.forEach(function(wrapper, i) {
      var bar = wrapper.querySelector('.progress-bar');
      var slideNum = i + 1;
      if (slideNum < current) {
        bar.style.width = '100%';
        bar.classList.add('completed');
      } else if (slideNum === current) {
        bar.style.width = '50%';
        bar.classList.remove('completed');
      } else {
        bar.style.width = '0%';
        bar.classList.remove('completed');
      }
    });
  }

  function showSlide(n) {
    if (n < 1 || n > total) return;
    slides.forEach(function(slide) { slide.classList.remove('active'); });
    slides[n - 1].classList.add('active');
    current = n;
    updateProgress();

    // Confetti on finale
    var canvas = slides[n - 1].querySelector('.confetti-canvas');
    if (canvas) { launchConfetti(canvas); }
  }

  // Click handler
  container.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;

    if (isFirstTap && current === 1) {
      isFirstTap = false;
      if (tapHint) tapHint.style.display = 'none';
      ${hasMusic ? `try { window.audioStarted = true; audio.play(); } catch(err) {}` : ""}
      return;
    }

    var x = e.clientX / window.innerWidth;
    if (x < 0.2) { showSlide(current - 1); }
    else { showSlide(current + 1); }
  });

  // Touch/Swipe handler
  container.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  container.addEventListener('touchend', function(e) {
    var diff = e.changedTouches[0].screenX - touchStartX;
    if (isFirstTap && current === 1) {
      isFirstTap = false;
      if (tapHint) tapHint.style.display = 'none';
      ${hasMusic ? `try { window.audioStarted = true; audio.play(); } catch(err) {}` : ""}
      return;
    }
    if (diff < -50) showSlide(current + 1);
    if (diff > 50) showSlide(current - 1);
  }, { passive: true });

  // Keyboard handler
  document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') {
      e.preventDefault();
      if (isFirstTap && current === 1) {
        isFirstTap = false;
        if (tapHint) tapHint.style.display = 'none';
        ${hasMusic ? `try { window.audioStarted = true; audio.play(); } catch(err) {}` : ""}
        return;
      }
      showSlide(current + 1);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showSlide(current - 1);
    }
  });

  // Replay
  window.replay = function() {
    isFirstTap = true;
    if (tapHint) tapHint.style.display = '';
    showSlide(1);
    ${hasMusic ? `
    if (window.audioStarted) {
      try {
        audio.currentTime = 0;
        audio.play();
      } catch(err) {}
    }
    ` : ""}
  };

  // Simple confetti
  function launchConfetti(canvas) {
    var ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var particles = [];
    var colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6eb4','#a855f7'];
    for (var i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10
      });
    }
    var frames = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(function(p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;
        p.vy += 0.05;
      });
      frames++;
      if (frames < 180) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
  }

  // Initial progress
  updateProgress();
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

  // Read the real template.css from the project
  let cssContent: string;
  try {
    const cssPath = path.join(process.cwd(), "src", "styles", "template.css");
    cssContent = fs.readFileSync(cssPath, "utf-8");
    // Remove .template-container scoping for standalone use
    cssContent = cssContent.replace(/\.template-container\s+/g, ".template-container ");
  } catch {
    // Fallback: use inline
    cssContent = "/* CSS yüklenemedi */";
  }

  const hasMusic = !!(site.musicTrack?.fileUrl);
  const zip = new JSZip();

  // URL extraction for ZIP physical download
  const uniqueUrls = new Set<string>();
  for (const slide of site.slides) {
    if (slide.imageUrl && slide.imageUrl.trim() !== "") {
      uniqueUrls.add(slide.imageUrl);
    }
    if (slide.collageUrls) {
      for (const curl of slide.collageUrls) {
        if (curl && curl.trim() !== "") {
          uniqueUrls.add(curl);
        }
      }
    }
  }

  // Download logic & Map Population
  const urlToLocalMap: Record<string, string> = {};
  if (uniqueUrls.size > 0) {
    const imagesFolder = zip.folder("images");

    // Fetch all in parallel
    const downloadPromises = Array.from(uniqueUrls).map(async (url, index) => {
      try {
        // SSRF Protection: Only allow valid https URLs
        if (!url.startsWith("https://")) {
          console.warn(`Skipping non-https or invalid URL: ${url}`);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();

        // Attempt to guess extension from URL or content-type
        let ext = "jpg";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("png")) ext = "png";
        else if (contentType && contentType.includes("gif")) ext = "gif";
        else if (contentType && contentType.includes("webp")) ext = "webp";
        else if (url.toLowerCase().endsWith(".png")) ext = "png";
        else if (url.toLowerCase().endsWith(".gif")) ext = "gif";
        else if (url.toLowerCase().endsWith(".webp")) ext = "webp";

        const filename = `img_${index + 1}.${ext}`;

        if (imagesFolder) {
          imagesFolder.file(filename, arrayBuffer);
          urlToLocalMap[url] = `images/${filename}`;
        }
      } catch (err) {
        console.error("Image download error for ZIP:", err);
      }
    });

    await Promise.allSettled(downloadPromises);
  }

  zip.file("index.html", generateOfflineHTML(site, urlToLocalMap));
  zip.file("styles.css", cssContent);
  zip.file("script.js", generateOfflineJS(site.slides.length, hasMusic));

  const zipBuffer = await zip.generateAsync({ type: "uint8array" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${site.slug}-offline.zip"`,
    },
  });
}

