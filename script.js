const fileInput = document.getElementById("fileInput");
const fileListDiv = document.getElementById("fileList");
const outputDiv = document.getElementById("output");
const dropArea = document.getElementById("dropArea");
let filesArray = [];

// Hariç tutulacak dosya uzantıları (geniş bir havuz)
const excludedExtensions = [
  // Görsel dosyalar
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".webp",
  ".tiff",
  ".tif",
  ".svg",
  ".ico",
  ".heic",
  ".heif",
  // Ses ve video dosyaları
  ".mp3",
  ".wav",
  ".ogg",
  ".flac",
  ".aac",
  ".mp4",
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  // Belge ve ofis dosyaları
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".odt",
  ".ods",
  ".odp",
  // Arşiv dosyaları
  ".zip",
  ".rar",
  ".tar",
  ".gz",
  ".7z",
  ".bz2",
  // Sistem ve geçici dosyalar
  ".ds_store",
  ".gitignore",
  ".gitattributes",
  ".lock",
  ".tmp",
  ".temp",
  ".bak",
  ".swp",
  ".swo",
  ".cache",
  // İkili ve çalıştırılabilir dosyalar
  ".exe",
  ".dll",
  ".so",
  ".dylib",
  ".bin",
  ".o",
  ".obj",
  ".class",
  // Diğer gereksiz dosyalar
  ".db",
  ".sqlite",
  ".db3",
  ".iso",
  ".img",
  ".torrent",
];

// Dosya inputu ile dosya seçildiğinde
fileInput.addEventListener("change", (event) => {
  const files = event.target.files;
  filesArray = filterFiles(files);
  updateFileList();
});

// Sürükle ve bırak alanı etkinleştir
dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropArea.classList.add("drag-over");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("drag-over");
});

dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  dropArea.classList.remove("drag-over");

  const files = event.dataTransfer.files;
  filesArray = filterFiles(files);
  updateFileList();
});

// Dosyaları filtreleme fonksiyonu
function filterFiles(files) {
  return Array.from(files).filter((file) => {
    // Dosya adını al ve küçük harfe çevir
    const fileName = file.name.toLowerCase();

    // Dosya uzantısını al (eğer yoksa boş string döner)
    const fileExtension = fileName.includes(".")
      ? "." + fileName.split(".").pop()
      : "";

    // Dosya adı tam olarak ".ds_store" ise veya uzantı hariç tutulacaklar listesinde ise reddet
    return (
      fileName !== ".ds_store" && !excludedExtensions.includes(fileExtension)
    );
  });
}

// Dosya listesi güncelleme fonksiyonu
function updateFileList() {
  fileListDiv.innerHTML = "";
  if (filesArray.length === 0) {
    fileListDiv.innerHTML = "<p>Geçerli dosya bulunamadı.</p>";
    document.querySelector(".buttons").style.display = "none";
    return;
  }

  filesArray.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item";
    fileItem.innerHTML = `
      <input type="checkbox" id="file-${index}" checked>
      <label for="file-${index}">${file.name}</label>
    `;
    fileListDiv.appendChild(fileItem);
  });
  document.querySelector(".buttons").style.display = "block";
}

// Sürükle ve bırak alanına tıklanıldığında dosya seçme penceresini aç
dropArea.addEventListener("click", () => {
  fileInput.click();
});

function generateCombinedContent() {
  let combinedContent = "";
  let filesProcessed = 0;

  filesArray.forEach((file, index) => {
    const checkbox = document.getElementById(`file-${index}`);
    if (checkbox && checkbox.checked) {
      const reader = new FileReader();
      reader.onload = function (event) {
        combinedContent += `# Dosya: ${file.name}\n${event.target.result}\n\n`;
        filesProcessed++;

        if (
          filesProcessed ===
          document.querySelectorAll(".file-item input:checked").length
        ) {
          outputDiv.innerText = combinedContent || "Henüz bir içerik yok.";
          Prism.highlightAll();
          scrollToCenter(outputDiv);
        }
      };
      reader.readAsText(file);
    }
  });

  if (document.querySelectorAll(".file-item input:checked").length === 0) {
    outputDiv.innerText = "Hiçbir dosya seçilmedi.";
  }
}

// Kod alanını tam ortalayacak şekilde kaydırma
function scrollToCenter(element) {
  const elementTop = element.getBoundingClientRect().top + window.scrollY;
  const elementHeight = element.offsetHeight;
  const windowHeight = window.innerHeight;

  const scrollTo = elementTop - (windowHeight - elementHeight) / 2;

  window.scrollTo({
    top: scrollTo,
    behavior: "smooth",
  });
}

function downloadTextFile() {
  const blob = new Blob([outputDiv.innerText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "combined-content.txt";
  link.click();
}

function toggleSelectAll() {
  const checkboxes = document.querySelectorAll(".file-item input");
  const allChecked = Array.from(checkboxes).every(
    (checkbox) => checkbox.checked
  );
  checkboxes.forEach((checkbox) => {
    checkbox.checked = !allChecked;
  });
}

// Kopyalama işlevi
function copyCode() {
  const range = document.createRange();
  range.selectNode(outputDiv);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  try {
    document.execCommand("copy");

    const copyButton = document.querySelector(".copy-btn");
    copyButton.innerText = "Kopyalandı!";
    setTimeout(() => {
      copyButton.innerText = "Kopyala";
    }, 1500);
  } catch (err) {
    console.log("Kopyalama başarısız!");
  }

  window.getSelection().removeAllRanges();
}
