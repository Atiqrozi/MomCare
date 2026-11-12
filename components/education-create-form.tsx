"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, Heading2, Heading3, ImagePlus, Italic, Link2, List, ListOrdered, Eye, PenLine } from "lucide-react";
import { BrowserApiError, browserApi } from "@/lib/browser-api";
import { EducationArticleBody } from "./education-article-body";

type UploadedImage = { name: string; mimeType: string; url: string; fileId: string };
export type EducationDraft = { _id: string; title: string; slug?: string; summary: string; body: string; category: string; sourceTitle?: string; sourceUrl?: string; sourceVersion?: string };

function safeWebUrl(value: string | null) {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch { return ""; }
}

function htmlToMarkdown(html: string) {
  const root = document.createElement("div");
  root.innerHTML = html;
  const convert = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (!(node instanceof HTMLElement)) return "";
    const children = Array.from(node.childNodes).map(convert).join("");
    switch (node.tagName) {
      case "BR": return "\n";
      case "IMG": {
        const src = safeWebUrl(node.getAttribute("src"));
        const width = Number.parseInt(node.style.width, 10);
        const size = Number.isFinite(width) ? `|${Math.min(100, Math.max(20, width))}%` : "";
        return src ? `![${(node.getAttribute("alt") ?? "Gambar edukasi").replace(/[\]]/g, "")}${size}](${src})` : "";
      }
      case "A": {
        const href = safeWebUrl(node.getAttribute("href"));
        return href ? `[${children}](${href})` : children;
      }
      case "B": case "STRONG": return `**${children}**`;
      case "I": case "EM": return `*${children}*`;
      case "H1": return `# ${children.trim()}\n\n`;
      case "H2": return `## ${children.trim()}\n\n`;
      case "H3": return `### ${children.trim()}\n\n`;
      case "P": case "DIV": return `${children.trim()}\n\n`;
      case "UL": return `${Array.from(node.children).map((item) => `- ${Array.from(item.childNodes).map(convert).join("").trim()}`).join("\n")}\n\n`;
      case "OL": return `${Array.from(node.children).map((item, index) => `${index + 1}. ${Array.from(item.childNodes).map(convert).join("").trim()}`).join("\n")}\n\n`;
      case "LI": return children;
      case "BLOCKQUOTE": return `${children.trim().split("\n").map((line) => `> ${line}`).join("\n")}\n\n`;
      default: return children;
    }
  };
  return Array.from(root.childNodes).map(convert).join("").replace(/\n{3,}/g, "\n\n").trim();
}

function markdownToEditorHtml(markdown: string) {
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
  const inline = (value: string) => {
    const pattern = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)|\*\*(.+?)\*\*|\*(.+?)\*/g;
    let html = "", cursor = 0, match: RegExpExecArray | null;
    while ((match = pattern.exec(value))) {
      html += escape(value.slice(cursor, match.index));
      if (match[1] !== undefined) {
        const size = match[1].match(/\|(\d{1,3})%$/);
        const alt = size ? match[1].slice(0, size.index) : match[1];
        const width = size ? Math.min(100, Math.max(20, Number(size[1]))) : 100;
        html += `<img src="${escape(match[2])}" alt="${escape(alt)}" style="width:${width}%;max-width:100%;height:auto">`;
      } else if (match[3] !== undefined) html += `<a href="${escape(match[4])}">${escape(match[3])}</a>`;
      else if (match[5] !== undefined) html += `<strong>${escape(match[5])}</strong>`;
      else html += `<em>${escape(match[6])}</em>`;
      cursor = pattern.lastIndex;
    }
    return html + escape(value.slice(cursor));
  };
  const lines = markdown.replace(/\r/g, "").split("\n");
  const blocks: string[] = [];
  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    const unordered = line.match(/^\s*[-*]\s+(.*)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (!line.trim()) { index++; continue; }
    if (heading) { blocks.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`); index++; continue; }
    if (unordered || ordered) {
      const type = unordered ? "ul" : "ol";
      const entries: string[] = [];
      while (index < lines.length) {
        const item = lines[index].match(type === "ul" ? /^\s*[-*]\s+(.*)$/ : /^\s*\d+[.)]\s+(.*)$/);
        if (!item) break;
        entries.push(`<li>${inline(item[1])}</li>`);
        index++;
      }
      blocks.push(`<${type}>${entries.join("")}</${type}>`);
      continue;
    }
    if (/^>\s?/.test(line)) { blocks.push(`<blockquote>${inline(line.replace(/^>\s?/, ""))}</blockquote>`); index++; continue; }
    blocks.push(`<p>${inline(line)}</p>`);
    index++;
  }
  return blocks.join("");
}

export function EducationCreateForm({ initialData, onCancel }: { initialData?: EducationDraft; onCancel?: () => void }) {
  const router = useRouter();
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [bodyMarkdown, setBodyMarkdown] = useState("");
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState(100);

  useEffect(() => {
    if (!initialData || !editorRef.current) return;
    editorRef.current.innerHTML = markdownToEditorHtml(initialData.body);
    setBodyMarkdown(initialData.body);
  }, [initialData]);

  function refreshMarkdown() {
    setBodyMarkdown(editorRef.current ? htmlToMarkdown(editorRef.current.innerHTML) : "");
  }

  function command(name: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(name, false, value);
    refreshMarkdown();
  }

  function resizeSelectedImage(size: number) {
    const nextSize = Math.min(100, Math.max(20, size));
    if (!selectedImage || !editorRef.current?.contains(selectedImage)) return;
    selectedImage.style.width = `${nextSize}%`;
    selectedImage.style.maxWidth = "100%";
    selectedImage.style.height = "auto";
    setImageSize(nextSize);
    refreshMarkdown();
  }

  async function uploadImage(file?: File) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { setError("Pilih gambar JPG, PNG, WEBP, atau GIF."); return; }
    if (file.size > 1_000_000) { setError("Ukuran gambar maksimal 1 MB."); return; }
    setUploading(true);
    setError("");
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Gambar gagal dibaca."));
        reader.readAsDataURL(file);
      });
      const image = await browserApi<UploadedImage>("/education/images", {
        method: "POST",
        body: JSON.stringify({ name: file.name, mimeType: file.type, dataUrl }),
      });
      editorRef.current?.focus();
      document.execCommand("insertImage", false, image.url);
      const insertedImages = editorRef.current?.querySelectorAll<HTMLImageElement>("img") ?? [];
      const inserted = insertedImages[insertedImages.length - 1];
      if (inserted) {
        inserted.alt = file.name.replace(/\.[^.]+$/, "");
        inserted.style.width = "70%";
        inserted.style.maxWidth = "100%";
        inserted.style.height = "auto";
        setSelectedImage(inserted);
        setImageSize(70);
      }
      refreshMarkdown();
    } catch (cause) {
      setError(cause instanceof BrowserApiError && cause.status === 401
        ? "Sesi masuk sudah kedaluwarsa. Isi artikel tetap terbuka. Masuk kembali di tab lain, lalu coba unggah gambar lagi."
        : cause instanceof Error ? cause.message : "Gambar gagal diunggah.");
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (uploading || pending) return;
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const body = editorRef.current ? htmlToMarkdown(editorRef.current.innerHTML) : bodyMarkdown;
    if (!body) { setError("Tulis isi materi terlebih dahulu."); return; }
    if (body.length > 20_000) { setError("Isi materi maksimal 20.000 karakter."); return; }
    const slug = String(form.get("slug") ?? "").trim() || title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setPending(true);
    setError("");
    try {
      await browserApi(initialData ? `/education/${encodeURIComponent(initialData._id)}` : "/education", {
        method: initialData ? "PATCH" : "POST",
        body: JSON.stringify({
          title,
          ...(!initialData ? { slug } : {}),
          summary: form.get("summary"),
          body,
          category: form.get("category"),
          sourceTitle: form.get("sourceTitle"),
          sourceUrl: form.get("sourceUrl") || undefined,
          sourceVersion: form.get("sourceVersion") || undefined,
        }),
      });
      if (onCancel) onCancel();
      else router.push("/dashboard/edukasi");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof BrowserApiError && cause.status === 401
        ? "Sesi masuk sudah kedaluwarsa. Perubahan Anda masih ada di editor. Masuk kembali di tab lain, lalu tekan Simpan perubahan lagi."
        : cause instanceof Error ? cause.message : "Draf materi gagal dibuat.");
    } finally {
      setPending(false);
    }
  }

  const toolbar = [
    { label: "Tebal", icon: Bold, action: () => command("bold") },
    { label: "Miring", icon: Italic, action: () => command("italic") },
    { label: "Subjudul", icon: Heading2, action: () => command("formatBlock", "<h2>") },
    { label: "Subjudul kecil", icon: Heading3, action: () => command("formatBlock", "<h3>") },
    { label: "Daftar bullet", icon: List, action: () => command("insertUnorderedList") },
    { label: "Daftar nomor", icon: ListOrdered, action: () => command("insertOrderedList") },
    { label: "Tautan", icon: Link2, action: () => { const url = window.prompt("Masukkan URL tautan"); if (url && safeWebUrl(url)) command("createLink", url); else if (url) setError("Tautan harus menggunakan http atau https."); } },
  ];

  return <form onSubmit={submit} className="space-y-6">
    <section className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 md:grid-cols-2">
      <Field name="title" label="Judul artikel" required maxLength={200} placeholder="Contoh: Mengenali tanda bahaya kehamilan" defaultValue={initialData?.title} />
      <Field name="slug" label={initialData ? "Tautan artikel (tetap)" : "Tautan artikel (opsional)"} maxLength={200} placeholder="Dibuat otomatis dari judul" defaultValue={initialData?.slug} readOnly={!!initialData} />
      <Field name="category" label="Kategori" required maxLength={100} placeholder="Kehamilan, nutrisi, persalinan…" defaultValue={initialData?.category} />
      <Field name="summary" label="Ringkasan" required maxLength={500} placeholder="Ringkasan singkat untuk daftar materi" defaultValue={initialData?.summary} />
      <Field name="sourceTitle" label="Sumber / referensi" required maxLength={200} placeholder="Nama panduan atau sumber klinis" defaultValue={initialData?.sourceTitle} />
      <Field name="sourceVersion" label="Versi sumber" maxLength={100} placeholder="Contoh: edisi 2026" defaultValue={initialData?.sourceVersion} />
      <Field name="sourceUrl" label="URL sumber (opsional)" type="url" maxLength={1000} placeholder="https://…" defaultValue={initialData?.sourceUrl} />
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap gap-1">{toolbar.map(({ label, icon: Icon, action }) => <button key={label} type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={action} className="grid size-9 place-items-center rounded-lg border border-transparent text-slate-600 hover:border-slate-200 hover:bg-white"><Icon className="size-4" /></button>)}
          <button type="button" title="Tambahkan gambar" aria-label="Tambahkan gambar" disabled={uploading} onMouseDown={(event) => event.preventDefault()} onClick={() => imageInputRef.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-transparent px-3 text-xs font-bold text-teal-800 hover:border-slate-200 hover:bg-white disabled:opacity-50"><ImagePlus className="size-4" />{uploading ? "Mengunggah…" : "Gambar"}</button>
          <input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={(event) => void uploadImage(event.target.files?.[0])} />
        </div>
        <button type="button" onClick={() => { refreshMarkdown(); setPreview((value) => !value); }} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700">{preview ? <PenLine className="size-4" /> : <Eye className="size-4" />}{preview ? "Kembali menulis" : "Pratinjau"}</button>
      </div>
      {!preview && selectedImage && editorRef.current?.contains(selectedImage) && <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-white px-4 py-3"><span className="text-xs font-bold text-slate-600">Ukuran gambar</span><input aria-label="Ukuran gambar" type="range" min={20} max={100} step={5} value={imageSize} onChange={(event) => resizeSelectedImage(Number(event.target.value))} className="w-40 accent-teal-700" /><span className="w-10 text-xs text-slate-500">{imageSize}%</span>{[25, 50, 75, 100].map((size) => <button key={size} type="button" onClick={() => resizeSelectedImage(size)} className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600">{size}%</button>)}</div>}
      {preview ? <div className="min-h-80 p-5"><EducationArticleBody body={bodyMarkdown} /></div> : <div ref={editorRef} contentEditable suppressContentEditableWarning role="textbox" aria-label="Isi artikel edukasi" aria-multiline="true" onClick={(event) => { const target = event.target; if (target instanceof HTMLImageElement) { setSelectedImage(target); const width = Number.parseInt(target.style.width, 10); setImageSize(Number.isFinite(width) ? width : 100); } else setSelectedImage(null); }} onInput={refreshMarkdown} onPaste={(event) => { event.preventDefault(); const text = event.clipboardData.getData("text/plain"); document.execCommand("insertText", false, text); refreshMarkdown(); }} className="min-h-80 whitespace-pre-wrap p-5 text-sm leading-7 text-slate-700 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_img]:cursor-pointer [&_img]:rounded-xl [&_img:hover]:outline [&_img:hover]:outline-2 [&_img:hover]:outline-teal-500" data-placeholder="Mulai tulis artikel edukasi di sini…" />}
    </section>
    <p className="text-xs text-slate-500">Teks artikel maksimal 20.000 karakter. Gambar JPG, PNG, WEBP, atau GIF maksimal 1 MB akan disimpan di ImageKit.</p>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Materi disimpan sebagai draf dan perlu ditinjau klinis sebelum diterbitkan.</p><div className="flex gap-2"><button disabled={pending || uploading} className="rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Saving..." : initialData ? "Simpan perubahan" : "Simpan draf"}</button>{initialData && onCancel && <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Batal</button>}</div></div>
  </form>;
}

function Field({ name, label, required, maxLength, type = "text", placeholder, defaultValue, readOnly }: { name: string; label: string; required?: boolean; maxLength: number; type?: string; placeholder?: string; defaultValue?: string; readOnly?: boolean }) {
  return <label className="text-sm font-bold text-slate-700">{label}<input name={name} type={type} required={required} maxLength={maxLength} placeholder={placeholder} defaultValue={defaultValue} readOnly={readOnly} className="field mt-2 bg-white read-only:bg-slate-100" /></label>;
}
