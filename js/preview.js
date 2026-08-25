(function (global) {
  const PDF_SRC =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  const PDF_WORKER =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  let pdfLoading = null;

  function loadPdfJs() {
    if (global.pdfjsLib) return Promise.resolve(global.pdfjsLib);
    if (pdfLoading) return pdfLoading;
    pdfLoading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PDF_SRC;
      s.async = true;
      s.onload = () => {
        global.pdfjsLib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
        resolve(global.pdfjsLib);
      };
      s.onerror = () => reject(new Error("pdf.js failed"));
      document.head.appendChild(s);
    });
    return pdfLoading;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("read failed"));
      reader.readAsDataURL(file);
    });
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(reader.error || new Error("read failed"));
      reader.readAsText(file);
    });
  }

  function compressImage(file, maxEdge, quality) {
    maxEdge = maxEdge || 1600;
    quality = quality || 0.82;
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        const scale = Math.min(1, maxEdge / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        const mime =
          file.type === "image/png" || file.type === "image/webp"
            ? file.type
            : "image/jpeg";
        try {
          resolve(canvas.toDataURL(mime, quality));
        } catch {
          readFileAsDataUrl(file).then(resolve).catch(() => resolve(""));
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        readFileAsDataUrl(file).then(resolve).catch(() => resolve(""));
      };
      img.src = url;
    });
  }

  function captureVideoPoster(dataUrl) {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      const done = (value) => {
        video.removeAttribute("src");
        video.load();
        resolve(value || "");
      };
      video.onloadeddata = () => {
        try {
          video.currentTime = Math.min(0.4, (video.duration || 1) / 8 || 0);
        } catch {
          paint();
        }
      };
      video.onseeked = paint;
      video.onerror = () => done("");
      function paint() {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
          done(canvas.toDataURL("image/jpeg", 0.72));
        } catch {
          done("");
        }
      }
      setTimeout(() => done(""), 4000);
      video.src = dataUrl;
    });
  }

  async function renderPdfPage(dataUrl) {
    const lib = await loadPdfJs();
    const pdf = await lib.getDocument({ url: dataUrl }).promise;
    const page = await pdf.getPage(1);
    const unscaled = page.getViewport({ scale: 1 });
    const scale = Math.min(1.4, 720 / unscaled.width);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({
      canvasContext: canvas.getContext("2d"),
      viewport,
    }).promise;
    return {
      dataUrl: canvas.toDataURL("image/jpeg", 0.82),
      pages: pdf.numPages,
    };
  }

  const TEXT_EXTS = { txt: 1, md: 1, csv: 1, rtf: 1 };

  async function previewDocument(file, dataUrl) {
    const ext = (file.name || "").toLowerCase().split(".").pop();
    if (file.type === "application/pdf" || ext === "pdf") {
      try {
        const rendered = await renderPdfPage(dataUrl);
        return { kind: "pdf", ...rendered };
      } catch {
        return { kind: "none" };
      }
    }
    if (TEXT_EXTS[ext] || (file.type && file.type.startsWith("text/"))) {
      try {
        const text = await readFileAsText(file);
        return { kind: "text", text: text.slice(0, 1200) };
      } catch {
        return { kind: "none" };
      }
    }
    return { kind: "none" };
  }

  global.MybraryPreview = {
    readFileAsDataUrl,
    compressImage,
    captureVideoPoster,
    previewDocument,
    loadPdfJs,
  };
})(window);
