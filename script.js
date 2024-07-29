let canvas = document.getElementById('imageCanvas');
let ctx = canvas.getContext('2d');
let originalImage = new Image();
let resizedImage = new Image();
let imageLoaded = false;
let resizeMessage = document.getElementById('resizeMessage');
let lastClick = { x: null, y: null };

document.getElementById('imageLoader').addEventListener('change', handleImage, false);

let intensitySlider = document.getElementById('intensitySlider');
let intensityInput = document.getElementById('intensityInput');
let maxDistSlider = document.getElementById('maxDistSlider');
let maxDistInput = document.getElementById('maxDistInput');
let warpMagSlider = document.getElementById('warpMagSlider');
let warpMagInput = document.getElementById('warpMagInput');
let aspectRatioSlider = document.getElementById('aspectRatioSlider');
let aspectRatioInput = document.getElementById('aspectRatioInput');

// Sync sliders and input fields
intensitySlider.addEventListener('input', function() {
    intensityInput.value = intensitySlider.value;
    reapplyLastClick();
});

intensityInput.addEventListener('input', function() {
    let value = parseInt(intensityInput.value);
    if (value > parseInt(intensitySlider.max)) {
        intensitySlider.max = value;
    }
    intensitySlider.value = value;
    reapplyLastClick();
});

maxDistSlider.addEventListener('input', function() {
    maxDistInput.value = maxDistSlider.value;
    reapplyLastClick();
});

maxDistInput.addEventListener('input', function() {
    let value = parseInt(maxDistInput.value);
    if (value > parseInt(maxDistSlider.max)) {
        maxDistSlider.max = value;
    }
    maxDistSlider.value = value;
    reapplyLastClick();
});

warpMagSlider.addEventListener('input', function() {
    warpMagInput.value = warpMagSlider.value;
    reapplyLastClick();
});

warpMagInput.addEventListener('input', function() {
    let value = parseInt(warpMagInput.value);
    if (value > parseInt(warpMagSlider.max)) {
        warpMagSlider.max = value;
    }
    warpMagSlider.value = value;
    reapplyLastClick();
});

aspectRatioSlider.addEventListener('input', function() {
    aspectRatioInput.value = aspectRatioSlider.value;
    reapplyLastClick();
});

aspectRatioInput.addEventListener('input', function() {
    let value = parseFloat(aspectRatioInput.value);
    if (value > parseFloat(aspectRatioSlider.max)) {
        aspectRatioSlider.max = value;
    } else if (value < parseFloat(aspectRatioSlider.min)) {
        aspectRatioSlider.min = value;
    }
    aspectRatioSlider.value = value;
    reapplyLastClick();
});

canvas.addEventListener('click', function(event) {
    if (imageLoaded) {
        let rect = canvas.getBoundingClientRect();
        lastClick.x = event.clientX - rect.left;
        lastClick.y = event.clientY - rect.top;
        reapplyLastClick();
    }
});

canvas.addEventListener('touchstart', function(event) {
    if (imageLoaded && event.touches.length === 1) {
        let rect = canvas.getBoundingClientRect();
        lastClick.x = event.touches[0].clientX - rect.left;
        lastClick.y = event.touches[0].clientY - rect.top;
        reapplyLastClick();
    }
});

function reapplyLastClick() {
    if (lastClick.x !== null && lastClick.y !== null) {
        let intensity = -parseFloat(intensitySlider.value);
        let maxDist = parseFloat(maxDistSlider.value);
        let warpMag = parseFloat(warpMagSlider.value);
        let aspectRatio = parseFloat(aspectRatioSlider.value);
        applyWarpEffect(lastClick.x, lastClick.y, intensity, maxDist, warpMag, aspectRatio);
    }
}

function handleImage(e) {
    let reader = new FileReader();
    reader.onload = function(event) {
        originalImage.src = event.target.result;
        originalImage.onload = function() {
            resizeImageToFitWindow();
        };
    };
    reader.readAsDataURL(e.target.files[0]);
}

function resizeImageToFitWindow() {
    const maxWidth = window.innerWidth * 0.9;
    const maxHeight = window.innerHeight * 0.9;
    let width = originalImage.width;
    let height = originalImage.height;
    let resized = false;

    if (width > maxWidth || height > maxHeight) {
        let aspectRatio = width / height;
        if (width > maxWidth) {
            width = maxWidth;
            height = width / aspectRatio;
            resized = true;
        }
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
            resized = true;
        }
    }

    canvas.width = width;
    canvas.height = height;
    resizedImage.width = width;
    resizedImage.height = height;

    let tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    let tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(originalImage, 0, 0, width, height);
    resizedImage.src = tempCanvas.toDataURL();

    resizedImage.onload = function() {
        ctx.drawImage(resizedImage, 0, 0);
        imageLoaded = true;
        simulateClick();
    }

    if (resized) {
        resizeMessage.innerText = `Image resized to ${width.toFixed(0)} x ${height.toFixed(0)}`;
    } else {
        resizeMessage.innerText = '';
    }
}

function simulateClick() {
    let rect = canvas.getBoundingClientRect();
    let x = canvas.width / 2;
    let y = canvas.height / 4;  // Upper middle area
    let event = new MouseEvent('click', {
        clientX: rect.left + x,
        clientY: rect.top + y
    });
    canvas.dispatchEvent(event);
}

function applyWarpEffect(x, y, intensity, maxDist, warpMag, aspectRatio) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(resizedImage, 0, 0);

    let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imgData.data;
    let width = imgData.width;
    let height = imgData.height;

    let newImageData = ctx.createImageData(width, height);
    let newData = newImageData.data;

    for (let i = 0; i < height; i++) {
        for (let j
