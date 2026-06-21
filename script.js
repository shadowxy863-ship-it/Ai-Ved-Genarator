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

    // AI Simulation Generation Logic
    generateBtn.addEventListener("click", () => {
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

        let progress = 0;
        generateBtn.disabled = true;
        generateBtn.style.opacity = "0.5";

        // Progress Counter Render Animation
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 2;
            if(progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Show Generated Dummy Premium Stock Video
                videoLoader.classList.add("hidden");
                videoWrapper.classList.remove("hidden");
                generateBtn.disabled = false;
                generateBtn.style.opacity = "1";
                
                // Injecting high-quality placeholder video link for simulation
                generatedVideo.src = "https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-32124-large.mp4";
                generatedVideo.play();
            }
            progressText.textContent = `${progress}%`;
        }, 250);
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
