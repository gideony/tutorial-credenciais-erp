const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ensure upload directory exists
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'public/uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

const DATA_FILE = path.join(__dirname, 'data', 'data.json');

// Initialize data if not exists
if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify({ erps: [] }));
}

function getData() {
    return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// API to get ERP list
app.get('/api/erps', (req, res) => {
    res.json(getData().erps);
});

// API to add an ERP
app.post('/api/erps', upload.single('image'), (req, res) => {
    const data = getData();
    const { name, title, message } = req.body;
    let imagePath = null;

    if (req.file) {
        imagePath = 'uploads/' + req.file.filename;
    }

    // Update existing or push new
    const existingIndex = data.erps.findIndex(e => e.name === name);
    const erpData = { name, title, message, image: imagePath };

    if (existingIndex > -1) {
        // Keep old image if not updating
        if (!imagePath && data.erps[existingIndex].image) {
            erpData.image = data.erps[existingIndex].image;
        }
        data.erps[existingIndex] = erpData;
    } else {
        data.erps.push(erpData);
    }

    saveData(data);
    res.json({ success: true, erp: erpData });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});