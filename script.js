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

    // Motion strength input listener
    motionStrength.addEventListener("input", (e) => {
        motionValue.textContent = e.target.value;
    });

    // Handle Active States for Tags & Ratio
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
            alert('Please upload a valid image file format!');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            previewImage.src = reader.result;
            previewImage.classList.remove('hidden');
            uploadContent.classList.add('hidden');
            promptContainer.classList.remove("hidden"); // AI প্রম্পট বক্স দেখাবে
        }
    }

    clearPromptBtn.addEventListener("click", () => {
        textPrompt.value = "";
    });

    // পরিবর্তিত মূল কোড: যা আপনার লোকাল সার্ভারের সাথে ক্লাউডফ্লেয়ারকে জোড়া দেবে
    generateBtn.addEventListener("click", async () => {
        if(!selectedFile) {
            alert("Please upload an image first to activate the AI Core Engine!");
            return;
        }

        // UI চেঞ্জ করে লোডার স্ক্রিন দেখানো
        dropZone.classList.add("hidden");
        promptContainer.classList.add("hidden");
        outputBox.classList.remove("hidden");
        videoLoader.classList.remove("hidden");
        videoWrapper.classList.add("hidden");

        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.5";

        // প্রোগ্রেস বার কাউন্টার অ্যানিমেশন
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 95) {
                progress += Math.floor(Math.random() * 3) + 1;
                progressText.textContent = `${progress}%`;
            }
        }, 1200);

        // ডাটা প্যাক করার জন্য FormData
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('motionStrength', motionStrength.value);
        formData.append('prompt', textPrompt.value);

        try {
            // লোকালহোস্টের আইপি ব্যবহার করে আপনার নিজের পিসির ব্যাকএন্ডে রিকোয়েস্ট পাঠানো হচ্ছে
            const response = await fetch('http://127.0.0.1:5000/api/generate-video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.videoUrl) {
                clearInterval(progressInterval);
                progressText.textContent = "100%";

                videoLoader.classList.add("hidden");
                videoWrapper.classList.remove("hidden");
                
                // AI-এর তৈরি করা আসল ভিডিও প্লেয়ারে সেট করা
                generatedVideo.src = data.videoUrl;
                generatedVideo.play();
            } else {
                throw new Error(data.error || 'AI Server Error. Check your API token or Server terminal.');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error("Error details:", error);
            
            // সুন্দর ও স্পষ্ট এরর মেসেজ যাতে বুঝতে সুবিধা হয় কী করতে হবে
            alert("ভিডিও জেনারেট করা যায়নি!\n\nসম্ভাব্য কারণ ও সমাধান:\n১. নিশ্চিত করুন আপনার কম্পিউটারের টার্মিনালে 'node server.js' সচল আছে।\n২. ব্রাউজারের উপরে তালা (🔒) আইকনে ক্লিক করে 'Insecure Content' অপশনটি 'Allow' করে দিন।");
            
            // ভুল হলে আগের অবস্থায় ব্যাক করা
            outputBox.classList.add("hidden");
            dropZone.classList.remove("hidden");
            promptContainer.classList.remove("hidden");
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
        }
    });

    // Remix Button
    remixBtn.addEventListener("click", () => {
        outputBox.classList.add("hidden");
        dropZone.classList.remove("hidden");
        promptContainer.classList.remove("hidden");
    });

    // Download Video
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
