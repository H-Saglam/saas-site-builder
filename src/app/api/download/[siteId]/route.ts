import { NextRequest, NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { getServiceSupabase } from "@/lib/supabase";
import { isSafeUrl } from "@/lib/security";
import JSZip from "jszip";
import type { SiteData } from "@/lib/types";
import { siteRowToData } from "@/lib/mappers";
import fs from "fs";
import path from "path";
import { generateOfflineHTML, generateOfflineJS } from "./templates";

/*
  GET /api/download/[siteId]
  Premium kullanıcılar için offline HTML + CSS + görseller içeren ZIP oluşturur.
  Canlı siteyle birebir aynı HTML/CSS/JS yapısını kullanır.
*/



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
        // SSRF Protection: Validate against allowed domains
        if (!isSafeUrl(url)) {
          console.warn(`Skipping potentially unsafe or external URL: ${url}`);
          return;
        }

        // Prevent redirect-based SSRF by setting redirect: 'error'
        const response = await fetch(url, { redirect: "error" });
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

