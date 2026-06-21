// script.js
document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const dropZone = document.getElementById("dropZone");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const uploadContent = document.getElementById("uploadContent");
    const promptContainer = document.getElementById("promptContainer");
    const textPrompt = document.getElementById("textPrompt");
    const clearPromptBtn = document.getElementById("clearPromptBtn");
    
    const generateBtn = document.getElementById("generateBtn");
    const outputBox = document.getElementById("outputBox");
    const videoLoader = document.getElementById("videoLoader");
    const videoWrapper = document.getElementById("videoWrapper");
    const progressText = document.getElementById("progressText");
    const generatedVideo = document.getElementById("generatedVideo");
    const remixBtn = document.getElementById("remixBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    const motionStrength = document.getElementById("motionStrength");
    const motionValue = document.getElementById("motionValue");

    let selectedFile = null;

    motionStrength.addEventListener("input", (e) => {
        motionValue.textContent = e.target.value;
    });

    setupToggleButtons(".tag");
    setupToggleButtons(".ratio-btn");

    function setupToggleButtons(selector) {
        document.querySelectorAll(selector).forEach(btn => {
            btn.addEventListener("click", function() {
                document.querySelectorAll(selector).forEach(b => b.classList.remove("active"));
                this.classList.add("active");
            });
        });
    }

    // Drag and Drop Logic
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
        }, false);
    });

    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if(files.length) handleImageFile(files[0]);
    });

    imageInput.addEventListener('change', function() {
        if(this.files.length) handleImageFile(this.files[0]);
    });

    function handleImageFile(file) {
        if(!file.type.startsWith('image/')) {
            alert('Please upload a valid image file!');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            previewImage.src = reader.result;
            previewImage.classList.remove('hidden');
            uploadContent.classList.add('hidden');
            promptContainer.classList.remove("hidden");
        }
    }

    clearPromptBtn.addEventListener("click", () => {
        textPrompt.value = "";
    });

    // চূড়ান্ত অনলাইন API কানেকশন লজিক
    generateBtn.addEventListener("click", async () => {
        if(!selectedFile) {
            alert("Please upload an image first!");
            return;
        }

        dropZone.classList.add("hidden");
        promptContainer.classList.add("hidden");
        outputBox.classList.remove("hidden");
        videoLoader.classList.remove("hidden");
        videoWrapper.classList.add("hidden");

        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.5";

        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 95) {
                progress += Math.floor(Math.random() * 3) + 1;
                progressText.textContent = `${progress}%`;
            }
        }, 1200);

        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('motionStrength', motionStrength.value);
        formData.append('prompt', textPrompt.value);

        try {
            // ⚠️ অত্যন্ত গুরুত্বপূর্ণ: 'YOUR_RENDER_BACKEND_URL' এর জায়গায় আপনার Render থেকে পাওয়া আসল লাইভ URL-টি বসাবেন।
            // উদাহরণস্বরূপ: 'https://motion-ai-backend.onrender.com'
            const RENDER_URL = 'YOUR_RENDER_BACKEND_URL'; 
            
            const response = await fetch(`${RENDER_URL}/api/generate-video`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.videoUrl) {
                clearInterval(progressInterval);
                progressText.textContent = "100%";

                videoLoader.classList.add("hidden");
                videoWrapper.classList.remove("hidden");
                
                generatedVideo.src = data.videoUrl;
                generatedVideo.play();
            } else {
                throw new Error(data.error || 'AI Server returned an error.');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error(error);
            alert("ভিডিও তৈরি করা যায়নি। এরর মেসেজ: " + error.message);
            
            outputBox.classList.add("hidden");
            dropZone.classList.remove("hidden");
            promptContainer.classList.remove("hidden");
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
        }
    });

    remixBtn.addEventListener("click", () => {
        outputBox.classList.add("hidden");
        dropZone.classList.remove("hidden");
        promptContainer.classList.remove("hidden");
    });

    downloadBtn.addEventListener("click", () => {
        if(generatedVideo.src) {
            const a = document.createElement('a');
            a.href = generatedVideo.src;
            a.download = 'motionai-video.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
});
