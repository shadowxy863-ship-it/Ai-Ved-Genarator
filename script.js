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

    // Handle Active States for Tags
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

    // Function to handle Image File upload and show Prompt Input box
    function handleImageFile(file) {
        if(!file.type.startsWith('image/')) {
            alert('Please upload an image file format!');
            return;
        }
        selectedFile = file;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = function() {
            previewImage.src = reader.result;
            previewImage.classList.remove('hidden');
            uploadContent.classList.add('hidden');
            
            // SHOW the premium text prompt box right after image upload success!
            promptContainer.classList.remove("hidden");
        }
    }

    // Clear Text Prompt Button
    clearPromptBtn.addEventListener("click", () => {
        textPrompt.value = "";
    });

    // REAL AI BACKEND CONNECT LOGIC
    generateBtn.addEventListener("click", async () => {
        if(!selectedFile) {
            alert("Pro Tip: Please upload an image first to activate the AI Core Engine!");
            return;
        }

        // Hide input panels, Show rendering box
        dropZone.classList.add("hidden");
        promptContainer.classList.add("hidden"); // hide text prompt during render
        outputBox.classList.remove("hidden");
        videoLoader.classList.remove("hidden");
        videoWrapper.classList.add("hidden");

        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.5";

        // Progress Counter Render Animation (Gives an AI processing feel)
        let progress = 0;
        const progressInterval = setInterval(() => {
            if (progress < 95) {
                progress += Math.floor(Math.random() * 3) + 1;
                progressText.textContent = `${progress}%`;
            }
        }, 1000);

        // Preparing data to send to Node.js server
        const formData = new FormData();
        formData.append('image', selectedFile);
        formData.append('motionStrength', motionStrength.value);
        formData.append('prompt', textPrompt.value);

        try {
            // CRITICAL CHANGE: Using Local IP 127.0.0.1 to prevent Cloudflare HTTPS from blocking local requests
            const response = await fetch('http://127.0.0.1:5000/api/generate-video', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok && data.videoUrl) {
                clearInterval(progressInterval);
                progressText.textContent = "100%";

                // Hide loader, show video player
                videoLoader.classList.add("hidden");
                videoWrapper.classList.remove("hidden");
                
                // Inject real AI generated video source link
                generatedVideo.src = data.videoUrl;
                generatedVideo.play();
            } else {
                throw new Error(data.error || 'AI server failed to return video response.');
            }

        } catch (error) {
            clearInterval(progressInterval);
            console.error("Error details:", error);
            alert("ভিডিও জেনারেট করা যায়নি। নিশ্চিত করুন আপনার কম্পিউটারে 'node server.js' সচল বা রান করা আছে।");
            
            // Revert UI back to original state on error
            outputBox.classList.add("hidden");
            dropZone.classList.remove("hidden");
            promptContainer.classList.remove("hidden");
        } finally {
            generateBtn.disabled = false;
            generateBtn.style.opacity = "1";
        }
    });

    // Remix Button Logic (Reset Workspace)
    remixBtn.addEventListener("click", () => {
        outputBox.classList.add("hidden");
        dropZone.classList.remove("hidden");
        promptContainer.classList.remove("hidden"); // show text prompt back
    });

    // Download Button Trigger
    downloadBtn.addEventListener("click", () => {
        if(generatedVideo.src) {
            const a = document.createElement('a');
            a.href = generatedVideo.src;
            a.download = 'motionai-cinematic-render.mp4';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });
});
