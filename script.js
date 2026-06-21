// server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Replicate } = require('replicate');

const app = express();

// Render হোস্টিং বা লোকালহোস্টের পোর্ট ম্যানেজমেন্ট
const PORT = process.env.PORT || 5000;

// Cloudflare থেকে আসা সমস্ত রিকোয়েস্ট নিরাপদভাবে রিসিভ করার জন্য CORS সেটিংস
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ফাইল আপলোড মেমোরিতে হ্যান্ডেল করার জন্য Multer
const upload = multer({ storage: multer.memoryStorage() });

// ⚠️ এখানে সরাসরি আপনার Replicate API Token-টি বসানো হয়েছে
// টোকেনটি সরাসরি নিচে বসিয়ে দিলে Render বা লোকালহোস্ট—সব জায়গায় কোনো এরর ছাড়াই রান করবে
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || "এখানে_আপনার_REPLICATE_API_TOKEN_বসাবেন";

const replicate = new Replicate({
  auth: REPLICATE_TOKEN,
});

// সার্ভার লাইভ আছে কিনা ব্রাউজারে চেক করার রুট
app.get('/', (req, res) => {
  res.send('MotionAI Core Engine is Running Successfully!');
});

// প্রধান ভিডিও জেনারেশন এপিআই (API Endpoint)
app.post('/api/generate-video', upload.single('image'), async (req, res) => {
  try {
    // ১. টোকেন চেক করা (টোকেন খালি থাকলে যেন Unexpected End of JSON না হয়ে স্পষ্ট এরর দেখায়)
    if (!REPLICATE_TOKEN || REPLICATE_TOKEN.includes("এখানে_আপনার_REPLICATE_API_TOKEN_বসাবেন")) {
      console.error("Error: Replicate API Token is missing!");
      return res.status(401).json({ error: 'সার্ভারে Replicate API Token বসানো হয়নি। অনুগ্রহ করে আপনার server.js ফাইলে টোকেনটি বসান।' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload an image file.' });
    }

    const motionStrength = req.body.motionStrength || 5;
    
    // ছবিকে Base64 এ রূপান্তর
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log('AI Generation Started on Replicate...');

    // Stable Video Diffusion (SVD) মডেল রান করা
    const model = "stability-ai/stable-video-diffusion:3f0457140d9bc364733b246a7163b54af45e2a17f01fa28af1d121e4b36c77cb";
    const input = {
      input_image: base64Image,
      motion_bucket_id: parseInt(motionStrength) * 12,
      video_length: "14_frames_with_svd" 
    };

    // Replicate AI সার্ভার থেকে রেসপন্স নেওয়া
    const output = await replicate.run(model, { input });

    console.log('AI Generation Success!');

    // জেনারেট হওয়া আসল ভিডিওর URL ফ্রন্টএন্ডে পাঠানো
    if (output && (output[0] || output)) {
       return res.json({ videoUrl: output[0] || output });
    } else {
       throw new Error("Replicate did not return any video URL.");
    }

  } catch (error) {
    console.error('Detailed Server Error:', error.message);
    // ফ্রন্টএন্ড যাতে ফাঁকা রেসপন্স পেয়ে ক্র্যাশ না করে, তাই স্পষ্ট এরর মেসেজ পাঠানো হচ্ছে
    res.status(500).json({ error: `AI Video generation failed: ${error.message}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
