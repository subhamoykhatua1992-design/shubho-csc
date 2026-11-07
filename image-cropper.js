
/* =====================================
   SHUBHO CSC - PROFESSIONAL IMAGE CROPPER
===================================== */

const imageInput = document.getElementById("imageInput");
const cropImage = document.getElementById("cropImage");
const imageInfo = document.getElementById("imageInfo");
const emptyMessage = document.getElementById("emptyMessage");

/* SHOW IMAGE INFORMATION */

function showImageInfo(file, image) {

    const fileSize = (file.size / 1024).toFixed(2);

    imageInfo.innerHTML = `
        <strong>Image Name:</strong> ${file.name}<br>
        <strong>File Size:</strong> ${fileSize} KB<br>
        <strong>Image Width:</strong> ${image.naturalWidth} px<br>
        <strong>Image Height:</strong> ${image.naturalHeight} px
    `;

    imageInfo.style.display = "block";
}

let cropper = null;
let selectedPhotoMode = "passport";
let uploadedImageURL = null;
let horizontalScale = 1;

let customWidthPixels = 600;
let customHeightPixels = 600;
/* PHOTO ADJUSTMENT VARIABLES */

const brightnessInput = document.getElementById("brightness");
const contrastInput = document.getElementById("contrast");
const saturationInput = document.getElementById("saturation");
const grayscaleInput = document.getElementById("grayscale");



/* =====================================
   APPLY ADJUSTMENTS + BACKGROUND
===================================== */

function applyPhotoAdjustments(canvas) {

    const outputCanvas = document.createElement("canvas");

    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;

    const ctx = outputCanvas.getContext("2d");

    /* BACKGROUND COLOUR */

    ctx.fillStyle = selectedBackgroundColor || "#ffffff";

    ctx.fillRect(
        0,
        0,
        outputCanvas.width,
        outputCanvas.height
    );

    /* PHOTO ADJUSTMENTS */

    ctx.filter = `
        brightness(${brightnessInput.value}%)
        contrast(${contrastInput.value}%)
        saturate(${saturationInput.value}%)
        grayscale(${grayscaleInput.value}%)
    `;

    ctx.drawImage(canvas, 0, 0);

    ctx.filter = "none";

    return outputCanvas;
}
/* =====================================
   PHOTO ADJUSTMENT SYSTEM
===================================== */
function updatePhotoAdjustments() {

    const brightness = brightnessInput.value;
    const contrast = contrastInput.value;
    const saturation = saturationInput.value;
    const grayscale = grayscaleInput.value;

    const filterValue = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        grayscale(${grayscale}%)
    `;

    document.querySelectorAll(
        ".cropper-container .cropper-canvas img, .cropper-container .cropper-view-box img"
    ).forEach(function(image) {
        image.style.filter = filterValue;
    });
}

/* SLIDER EVENTS */

brightnessInput.addEventListener("input", updatePhotoAdjustments);
contrastInput.addEventListener("input", updatePhotoAdjustments);
saturationInput.addEventListener("input", updatePhotoAdjustments);
grayscaleInput.addEventListener("input", updatePhotoAdjustments);

/* RESET ADJUSTMENTS */

document.getElementById("resetAdjustments").addEventListener("click", function() {

    brightnessInput.value = 100;
    contrastInput.value = 100;
    saturationInput.value = 100;
    grayscaleInput.value = 0;

    updatePhotoAdjustments();

});/* RESET ALL SETTINGS */

document.getElementById("resetAll").addEventListener("click", function() {

    if (cropper) {
        cropper.reset();
        horizontalScale = 1;
    }

    selectedPhotoMode = "passport";
    if (cropper) {
    cropper.setAspectRatio(35 / 45);
}

    brightnessInput.value = 100;
    contrastInput.value = 100;
    saturationInput.value = 100;
    grayscaleInput.value = 0;

    selectedBackgroundColor = "#ffffff";

    document.getElementById("customBackground").value = "#ffffff";

    document.querySelectorAll(".bg-color").forEach(function(btn) {
        btn.style.outline = "none";
    });

    updatePhotoAdjustments();

    document.getElementById("a4Preview").innerHTML = "";

});
/* =================================
   FRONT AND BACK SIDE EDITOR
================================= */

let activeEditorSide = "front";

const editorCanvas = document.querySelector(".editor-canvas");

const editorImages = {
    front: null,
    back: null
};
const editorTextLayers = {
    front: [],
    back: []
};

/* SHOW SELECTED SIDE */

function renderEditorSide() {

    const imageURL = editorImages[activeEditorSide];
    editorZoom = editorSideZoom[activeEditorSide];

if (typeof editorImageSize !== "undefined") {
    editorImageSize.value = editorZoom * 100;
    editorImageSizeValue.textContent =
        Math.round(editorZoom * 100) + "%";
}

    if (imageURL) {
        editorCanvas.innerHTML = `
            <img
                src="${imageURL}"
                alt="${activeEditorSide} side"
                style="max-width:100%;max-height:450px;object-fit:contain;"
            >
        `;
    } else {
        editorCanvas.innerHTML = `
            <p>${activeEditorSide.toUpperCase()} Side - Upload Image</p>
        `;
    }
}

/* FRONT TAB */

document.getElementById("frontTab").addEventListener("click", function() {

    activeEditorSide = "front";

    this.style.background = "#0879d9";
    document.getElementById("backTab").style.background = "#293548";

   

});

/* BACK TAB */

document.getElementById("backTab").addEventListener("click", function() {

    activeEditorSide = "back";

    this.style.background = "#0879d9";
    document.getElementById("frontTab").style.background = "#293548";

   

});

/* IMAGE UPLOAD HANDLER */

function handleSideUpload(inputId, side) {

    document.getElementById(inputId).addEventListener("change", function() {

        const file = this.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            this.value = "";
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("Image must be smaller than 10 MB.");
            this.value = "";
            return;
        }

        if (editorImages[side]) {
            URL.revokeObjectURL(editorImages[side]);
        }

        editorImages[side] = URL.createObjectURL(file);

        activeEditorSide = side;

        document.getElementById("frontTab").style.background =
            side === "front" ? "#0879d9" : "#293548";

        document.getElementById("backTab").style.background =
            side === "back" ? "#0879d9" : "#293548";

        renderEditorSide();

    });

}

/* CONNECT UPLOAD BUTTONS */

handleSideUpload("frontImageUpload", "front");
handleSideUpload("backImageUpload", "back");

/* INITIAL DISPLAY */

renderEditorSide();
/* =================================
   EDITOR MOVE TOOL
================================= */

let editorMoveEnabled = false;

document.getElementById("editorMove")
.addEventListener("click", function() {

    editorMoveEnabled = !editorMoveEnabled;

    if (editorMoveEnabled) {

        this.style.background = "#159447";
        this.textContent = "✋ Move ON";

        editorCanvas.style.cursor = "grab";

    } else {

        this.style.background = "#293548";
        this.textContent = "🖱️ Move";

        editorCanvas.style.cursor = "default";

    }

});
/* =================================
   DRAG IMAGE WITH MOUSE
================================= */

let isDraggingEditorImage = false;
let editorStartX = 0;
let editorStartY = 0;
let editorImageX = 0;
let editorImageY = 0;

editorCanvas.addEventListener("mousedown", function(event) {

    if (!editorMoveEnabled) return;
    if (event.target.tagName !== "IMG") return;

    isDraggingEditorImage = true;

    editorStartX = event.clientX;
    editorStartY = event.clientY;

    editorImageX = Number(event.target.dataset.x || 0);
    editorImageY = Number(event.target.dataset.y || 0);

    editorCanvas.style.cursor = "grabbing";

});

document.addEventListener("mousemove", function(event) {

    if (!isDraggingEditorImage) return;

    const img = editorCanvas.querySelector("img");

    if (!img) return;

    const moveX = event.clientX - editorStartX;
    const moveY = event.clientY - editorStartY;

    img.dataset.x = editorImageX + moveX;
    img.dataset.y = editorImageY + moveY;

   img.style.transform =
    `translate(${img.dataset.x}px, ${img.dataset.y}px) scale(${editorZoom})`;

});

document.addEventListener("mouseup", function() {

    isDraggingEditorImage = false;

    editorCanvas.style.cursor =
        editorMoveEnabled ? "grab" : "default";

});
/* =================================
   EDITOR ZOOM SYSTEM
================================= */

let editorZoom = 1;
const editorSideZoom = {
    front: 1,
    back: 1
};

function updateEditorZoom() {

    const img = editorCanvas.querySelector("img");

    if (!img) return;

    const x = Number(img.dataset.x || 0);
    const y = Number(img.dataset.y || 0);

    img.style.transform =
        `translate(${x}px, ${y}px) scale(${editorZoom})`;
}

/* ZOOM IN */

document.getElementById("editorZoomIn")
.addEventListener("click", function() {

    if (!editorCanvas.querySelector("img")) {
        alert("Please upload an image first.");
        return;
    }

    editorZoom = Math.min(editorZoom + 0.1, 3);

    updateEditorZoom();

});

/* ZOOM OUT */

document.getElementById("editorZoomOut")
.addEventListener("click", function() {

    if (!editorCanvas.querySelector("img")) {
        alert("Please upload an image first.");
        return;
    }

    editorZoom = Math.max(editorZoom - 0.1, 0.2);

    updateEditorZoom();

});

/* RESET EDITOR */

document.getElementById("editorReset")
.addEventListener("click", function() {

    editorZoom = 1;
    editorSideZoom[activeEditorSide] = 1;

if (editorImageSize) {
    editorImageSize.value = 100;
    editorImageSizeValue.textContent = "100%";
}

    const img = editorCanvas.querySelector("img");

    if (img) {
        img.dataset.x = 0;
        img.dataset.y = 0;
        updateEditorZoom();
    }

});
/* =====================================
   ID CARD FRONT & BACK A4 SHEET
===================================== */

document.getElementById("createIdCardA4")
.addEventListener("click", function() {

    if (!editorImages.front || !editorImages.back) {
        alert("Please upload both Front and Back images first.");
        return;
    }

    const a4Canvas = document.createElement("canvas");

    a4Canvas.width = 1240;
    a4Canvas.height = 1754;

    const ctx = a4Canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 1240, 1754);

    function loadImage(url) {
        return new Promise(function(resolve, reject) {

            const img = new Image();

            img.onload = function() {
                resolve(img);
            };

            img.onerror = reject;
            img.src = url;

        });
    }

    Promise.all([
        loadImage(editorImages.front),
        loadImage(editorImages.back)
    ])
    .then(function(images) {

        const cardWidth = 650;
        const cardHeight = 410;

        function drawCard(img, y, label) {

            const scale = Math.min(
                cardWidth / img.width,
                cardHeight / img.height
            );

            const width = img.width * scale;
            const height = img.height * scale;

            const x = (1240 - width) / 2;

            ctx.fillStyle = "#222222";
            ctx.font = "bold 30px Arial";
            ctx.textAlign = "center";

            ctx.fillText(label, 620, y - 35);

            ctx.drawImage(
                img,
                x,
                y,
                width,
                height
            );

            ctx.strokeStyle = "#555555";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

        }

        drawCard(images[0], 300, "FRONT SIDE");
        drawCard(images[1], 1000, "BACK SIDE");

        const imageURL = a4Canvas.toDataURL("image/png");

        const preview = document.getElementById("idCardA4Preview");

        preview.innerHTML = `
            <h3>ID Card A4 Print Preview</h3>

            <img src="${imageURL}" alt="ID Card A4 Sheet">

            <p>Front Side + Back Side</p>

            <button id="downloadIdCardA4">
                Download A4 Sheet
            </button>

            <button id="printIdCardA4">
                Print A4 Sheet
            </button>
        `;

        document.getElementById("downloadIdCardA4")
        .addEventListener("click", function() {

            const link = document.createElement("a");
            link.download = "Shubho-CSC-ID-Card-A4.png";
            link.href = imageURL;
            link.click();

        });

        document.getElementById("printIdCardA4")
        .addEventListener("click", function() {

            const printWindow = window.open("", "_blank");

            if (!printWindow) {
                alert("Please allow pop-ups to print.");
                return;
            }

            printWindow.document.write(`
                <html>
                <head>
                    <title>ID Card A4 Print</title>
                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 0;
                        }

                        body {
                            margin: 0;
                        }

                        img {
                            width: 210mm;
                            height: 297mm;
                            display: block;
                        }
                    </style>
                </head>
                <body>
                    <img src="${imageURL}" onload="window.print();">
                </body>
                </html>
            `);

            printWindow.document.close();

        });

    })
    .catch(function() {
        alert("Unable to load Front or Back image.");
    });

});

/* IMAGE UPLOAD */

imageInput.addEventListener("change", function (event) {

    const file = event.target.files[0];

    if (!file) return;
    // MAX FILE SIZE: 10 MB

if (file.size > 10 * 1024 * 1024) {
    alert("Please upload an image smaller than 10 MB.");
    imageInput.value = "";
    return;
}

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
    }

    if (uploadedImageURL) {
        URL.revokeObjectURL(uploadedImageURL);
    }

    uploadedImageURL = URL.createObjectURL(file);

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    horizontalScale = 1;

    cropImage.onload = function () {
        emptyMessage.style.display = "none";
        showImageInfo(file, cropImage);

        cropper = new Cropper(cropImage, {
            viewMode: 1,
            dragMode: "crop",
            autoCropArea: 0.85,
            responsive: true,
            background: false,
            movable: true,
            zoomable: true,
            rotatable: true,
            scalable: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            guides: true,
            center: true,
            highlight: true
        });

    };

    cropImage.src = uploadedImageURL;

});

/* PHOTO SIZE SETTINGS */

document.getElementById("freeCrop").addEventListener("click", function () {

    if (!cropper) return alert("Please upload an image first.");

    cropper.setAspectRatio(NaN);
    selectedPhotoMode = "free";

});

document.getElementById("passportCrop").addEventListener("click", function () {

    if (!cropper) return alert("Please upload an image first.");

    cropper.setAspectRatio(35 / 45);
    selectedPhotoMode = "passport";
    if (cropper) {
    cropper.setAspectRatio(35 / 45);
}

});

document.getElementById("twoInchCrop").addEventListener("click", function () {

    if (!cropper) return alert("Please upload an image first.");

    cropper.setAspectRatio(1);
    selectedPhotoMode = "2x2";

});

/* ZOOM */

document.getElementById("zoomIn").addEventListener("click", function () {
    if (cropper) cropper.zoom(0.1);
});

document.getElementById("zoomOut").addEventListener("click", function () {
    if (cropper) cropper.zoom(-0.1);
});

/* ROTATE */

document.getElementById("rotateLeft").addEventListener("click", function () {
    if (cropper) cropper.rotate(-90);
});

document.getElementById("rotateRight").addEventListener("click", function () {
    if (cropper) cropper.rotate(90);
});

/* RESET */

document.getElementById("resetCrop").addEventListener("click", function () {

    if (!cropper) return alert("Please upload an image first.");

    cropper.reset();
    horizontalScale = 1;

});

/* FLIP */

document.getElementById("flipHorizontal").addEventListener("click", function () {

    if (!cropper) return alert("Please upload an image first.");

    horizontalScale *= -1;
    cropper.scaleX(horizontalScale);

});

/* GET CROPPED CANVAS */

function getPhotoCanvas() {

    if (!cropper) {
        alert("Please upload an image first.");
        return null;
    }

    if (selectedPhotoMode === "passport") {
        return cropper.getCroppedCanvas({
            width: 413,
            height: 531,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"
        });
    }

    if (selectedPhotoMode === "2x2") {
        return cropper.getCroppedCanvas({
            width: 600,
            height: 600,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"
        });
    }

    if (selectedPhotoMode === "custom") {
        return cropper.getCroppedCanvas({
            width: customWidthPixels,
            height: customHeightPixels,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"
        });
    }

    return cropper.getCroppedCanvas({
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"
    });
}

/* DOWNLOAD JPG / PNG */

function downloadCroppedImage(format) {

    const canvas = getPhotoCanvas();
    if (!canvas) return;

const adjustedCanvas = applyPhotoAdjustments(canvas);

    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";

    const link = document.createElement("a");

    link.download = "Shubho-CSC-Cropped-Photo." + format;
    if (format === "jpg") {

    const jpgCanvas = document.createElement("canvas");

    jpgCanvas.width = adjustedCanvas.width;
jpgCanvas.height = adjustedCanvas.height;

    const ctx = jpgCanvas.getContext("2d");

    ctx.fillStyle = selectedBackgroundColor || "#ffffff";
ctx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);

    ctx.drawImage(adjustedCanvas, 0, 0);

    link.href = jpgCanvas.toDataURL("image/jpeg", 0.95);

} else {

    link.href = adjustedCanvas.toDataURL("image/png");

}

    link.click();

}

document.getElementById("downloadJPG").addEventListener("click", function () {
    downloadCroppedImage("jpg");
});

document.getElementById("downloadPNG").addEventListener("click", function () {
    downloadCroppedImage("png");
});

/* =====================================
   A4 PHOTO PRINT LAYOUT
===================================== */

document.getElementById("a4Layout").addEventListener("click", function () {
if (
    selectedPhotoMode === "free" ||
    selectedPhotoMode === "custom"
) {
    alert("A4 Photo Sheet তৈরি করতে Passport অথবা 2×2 Inch নির্বাচন করুন।");
    return;
}
    const photoCanvas = getPhotoCanvas();
    const adjustedPhotoCanvas = applyPhotoAdjustments(photoCanvas);

    if (!photoCanvas) return;

    const preview = document.getElementById("a4Preview");

    // A4 at approximately 150 DPI
    const a4Canvas = document.createElement("canvas");

    a4Canvas.width = 1240;
    a4Canvas.height = 1754;

    const ctx = a4Canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, a4Canvas.width, a4Canvas.height);

    const printDPI = 150;

    const photoWidth = Math.round(
        selectedPhotoMode === "2x2"
            ? 2 * printDPI
            : (35 / 25.4) * printDPI
    );

    const photoHeight = Math.round(
        selectedPhotoMode === "2x2"
            ? 2 * printDPI
            : (45 / 25.4) * printDPI
    );

    const marginX = 120;
    const marginY = 100;
    const gapX = 25;
    const gapY = 25;

    const columns = Math.floor(
        (a4Canvas.width - 2 * marginX + gapX) /
        (photoWidth + gapX)
    );

    const rows = Math.floor(
        (a4Canvas.height - 2 * marginY + gapY) /
        (photoHeight + gapY)
    );

    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < columns; col++) {

            const x = marginX + col * (photoWidth + gapX);
            const y = marginY + row * (photoHeight + gapY);

            ctx.drawImage(
    adjustedPhotoCanvas,
    x,
    y,
    photoWidth,
    photoHeight
);

            ctx.strokeStyle = "#cccccc";
            ctx.lineWidth = 1;
            ctx.strokeRect(x, y, photoWidth, photoHeight);

        }

    }

    const imageURL = a4Canvas.toDataURL("image/png");

    preview.innerHTML = `
        <h3 style="text-align:center;margin:20px 0;color:#064b9b;">
            A4 Photo Print Preview
        </h3>

        <img
            src="${imageURL}"
            style="width:100%;max-width:650px;display:block;margin:auto;border:1px solid #ddd;"
            alt="A4 Photo Sheet"
        >

        <p style="text-align:center;margin:10px;">
            Photo Size: ${selectedPhotoMode === "2x2" ? "2 × 2 Inch" : "35 × 45 mm"}
        </p>

        <div style="text-align:center;margin:20px;">
            <button id="downloadA4"
                style="background:#159447;color:white;border:0;padding:12px 25px;border-radius:7px;cursor:pointer;">
                Download A4 Sheet
            </button>

            <button id="printA4"
                style="background:#0879d9;color:white;border:0;padding:12px 25px;border-radius:7px;cursor:pointer;">
                Print A4 Sheet
            </button>
        </div>
    `;

    document.getElementById("downloadA4").addEventListener("click", function () {

        const link = document.createElement("a");
        link.download = "Shubho-CSC-A4-Photo-Sheet.png";
        link.href = imageURL;
        link.click();

    });

    document.getElementById("printA4").addEventListener("click", function () {

        const printWindow = window.open("", "_blank");

        if (!printWindow) {
            alert("Please allow pop-ups to print.");
            return;
        }

        printWindow.document.write(`
            <html>
            <head>
                <title>A4 Photo Sheet</title>
                <style>
                    @page { size: A4 portrait; margin: 0; }
                    body { margin: 0; }
                    img { width: 210mm; height: 297mm; display: block; }
                </style>
            </head>
            <body>
                <img src="${imageURL}" onload="window.print();">
            </body>
            </html>
        `);

        printWindow.document.close();

    });

});

/* CLEAR IMAGE */

document.getElementById("clearImage").addEventListener("click", function () {

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    if (uploadedImageURL) {
        URL.revokeObjectURL(uploadedImageURL);
        uploadedImageURL = null;
    }

    cropImage.removeAttribute("src");
    emptyMessage.style.display = "block";
    imageInput.value = "";

    imageInfo.innerHTML = "";
    imageInfo.style.display = "none";

    document.getElementById("a4Preview").innerHTML = "";

    selectedPhotoMode = "passport";
    horizontalScale = 1;

});/* =====================================
   BACKGROUND COLOUR SELECTION
===================================== */

let selectedBackgroundColor = "#ffffff";

document.querySelectorAll(".bg-color").forEach(function(button) {

    button.addEventListener("click", function() {

        selectedBackgroundColor = button.dataset.color;

        document.querySelectorAll(".bg-color").forEach(function(btn) {
            btn.style.outline = "none";
        });

        button.style.outline = "3px solid #e5a000";

    });

});

document.getElementById("customBackground").addEventListener("input", function() {

    selectedBackgroundColor = this.value;

});/* =====================================
/* =====================================
   CUSTOM PHOTO SIZE WITH UNIT CONVERSION
===================================== */

document.getElementById("customSizeBtn").addEventListener("click", function() {

    const widthValue = Number(document.getElementById("customWidth").value);
    const heightValue = Number(document.getElementById("customHeight").value);

    const unit = document.getElementById("sizeUnit").value;

    if (
        !Number.isFinite(widthValue) ||
        !Number.isFinite(heightValue) ||
        widthValue <= 0 ||
        heightValue <= 0
    ) {
        alert("Please enter valid Width and Height.");
        return;
    }

    const dpi = Number(document.getElementById("photoDPI").value);

const width = convertToPixels(widthValue, unit, dpi);
const height = convertToPixels(heightValue, unit, dpi);

    if (
        width < 1 || height < 1 ||
        width > 10000 || height > 10000
    ) {
        alert("Photo size must be between 1 and 10000 pixels.");
        return;
    }
    customWidthPixels = width;
customHeightPixels = height;

    if (!cropper) {
        alert("Please upload your photo first.");
        return;
    }

    cropper.setAspectRatio(width / height);

    selectedPhotoMode = "custom";

    alert(
        "Custom Photo Size Applied: " +
        width + " × " + height + " Pixels (" + dpi + " DPI)"
    );

});
   /* =====================================
   PHOTO SIZE UNIT CONVERSION
===================================== */

function convertToPixels(value, unit, dpi = 300) {

    if (unit === "px") {
        return Math.round(value);
    }

    if (unit === "inch") {
        return Math.round(value * dpi);
    }

    if (unit === "cm") {
        return Math.round((value / 2.54) * dpi);
    }

    if (unit === "mm") {
        return Math.round((value / 25.4) * dpi);
    }

    return 0;
}/* =================================
   PROFESSIONAL TEXT TOOL
================================= */

document.getElementById("editorAddText")
.addEventListener("click", function() {

    const canvas = editorCanvas;
    const image = canvas.querySelector("img");

    if (!image) {
        alert("Please upload an image first.");
        return;
    }

    const textValue = prompt("আপনার লেখা লিখুন:");

    if (!textValue) return;

    const textLayer = document.createElement("div");

    textLayer.className = "editor-text-layer";
    textLayer.textContent = textValue;

    textLayer.style.position = "absolute";
    textLayer.style.left = "50%";
    textLayer.style.top = "50%";
    textLayer.style.transform = "translate(-50%, -50%)";
    textLayer.style.color = "#ff0000";
    textLayer.style.fontSize = "28px";
    textLayer.style.fontWeight = "bold";
    textLayer.style.cursor = "move";
    textLayer.style.zIndex = "10";

    canvas.style.position = "relative";
    canvas.appendChild(textLayer);
    editorTextLayers[activeEditorSide].push(textLayer);

});
/* =================================
   TEXT PROPERTY CONTROLS
================================= */

const editorTextColor = document.getElementById("editorTextColor");
const editorFontSize = document.getElementById("editorFontSize");
const editorFontWeight = document.getElementById("editorFontWeight");

/* TEXT COLOR */

editorTextColor.addEventListener("input", function() {

    const selectedText = editorCanvas.querySelector(".editor-text-layer");

    if (selectedText) {
        selectedText.style.color = this.value;
    }

});

/* FONT SIZE */

editorFontSize.addEventListener("input", function() {

    const selectedText = editorCanvas.querySelector(".editor-text-layer");

    if (selectedText) {
        selectedText.style.fontSize = this.value + "px";
    }

});

/* FONT WEIGHT */

editorFontWeight.addEventListener("change", function() {

    const selectedText = editorCanvas.querySelector(".editor-text-layer");

    if (selectedText) {
        selectedText.style.fontWeight = this.value;
    }

});/* =================================
   DRAG TEXT LAYER
================================= */

let selectedTextLayer = null;
let isDraggingText = false;
let textStartX = 0;
let textStartY = 0;
let textOriginalX = 0;
let textOriginalY = 0;

editorCanvas.addEventListener("mousedown", function(event) {

    if (!event.target.classList.contains("editor-text-layer")) {
        return;
    }

    selectedTextLayer = event.target;
    editorCanvas.querySelectorAll(".editor-text-layer")
.forEach(function(text) {
    text.classList.remove("selected");
});

selectedTextLayer.classList.add("selected");
    isDraggingText = true;

    const rect = selectedTextLayer.getBoundingClientRect();

    textStartX = event.clientX;
    textStartY = event.clientY;

    textOriginalX = Number(selectedTextLayer.dataset.x || 0);
    textOriginalY = Number(selectedTextLayer.dataset.y || 0);

});

document.addEventListener("mousemove", function(event) {

    if (!isDraggingText || !selectedTextLayer) return;

    const moveX = event.clientX - textStartX;
    const moveY = event.clientY - textStartY;

    selectedTextLayer.dataset.x = textOriginalX + moveX;
    selectedTextLayer.dataset.y = textOriginalY + moveY;

    selectedTextLayer.style.transform =
        `translate(${textOriginalX + moveX}px, ${textOriginalY + moveY}px)`;

});

document.addEventListener("mouseup", function() {

    isDraggingText = false;

});/* =================================
   TEXT DELETE SYSTEM
================================= */

/* DELETE SELECTED TEXT */

document.getElementById("editorDeleteText")
.addEventListener("click", function() {

    if (!selectedTextLayer) {
        alert("Please select a text first.");
        return;
    }

    selectedTextLayer.remove();
    selectedTextLayer = null;

});

/* CLEAR ALL TEXT */

document.getElementById("editorClearText")
.addEventListener("click", function() {

    if (!confirm("আপনি কি সব লেখা মুছে ফেলতে চান?")) {
        return;
    }

    editorCanvas.querySelectorAll(".editor-text-layer")
    .forEach(function(text) {
        text.remove();
    });

    selectedTextLayer = null;

});/* =================================
   EDITOR BACKGROUND COLOR TOOL
================================= */

const editorBackgroundColor =
    document.getElementById("editorBackgroundColor");

document.getElementById("editorBackgroundBtn")
.addEventListener("click", function() {

    editorBackgroundColor.click();

});

editorBackgroundColor.addEventListener("input", function() {

    editorCanvas.style.backgroundColor = this.value;

});/* =================================
   EDITOR IMAGE RESIZE SYSTEM
================================= */

const editorImageSize =
    document.getElementById("editorImageSize");

const editorImageSizeValue =
    document.getElementById("editorImageSizeValue");

document.getElementById("editorResizeBtn")
.addEventListener("click", function() {

    if (!editorCanvas.querySelector("img")) {
        alert("Please upload an image first.");
        return;
    }

    editorImageSize.focus();

});

editorImageSize.addEventListener("input", function() {

    const img = editorCanvas.querySelector("img");

    if (!img) return;

    const size = Number(this.value);

    editorZoom = size / 100;
    editorSideZoom[activeEditorSide] = editorZoom;

    editorImageSizeValue.textContent = size + "%";

    updateEditorZoom();

});
renderEditorSide();