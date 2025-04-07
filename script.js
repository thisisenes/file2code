const fileInput = document.getElementById("fileInput");
const fileListDiv = document.getElementById("fileList");
const outputDiv = document.getElementById("output");
const dropArea = document.getElementById("dropArea");
let filesArray = [];

// Dosya inputu ile dosya seçildiğinde
fileInput.addEventListener("change", (event) => {
  const files = event.target.files;
  filesArray = Array.from(files);
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
  filesArray = Array.from(files);
  updateFileList();
});

// Dosya listesi güncelleme fonksiyonu
function updateFileList() {
  fileListDiv.innerHTML = "";
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
    if (checkbox.checked) {
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

          // Sayfayı otomatik olarak kod alanını ortalayacak şekilde kaydır
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
