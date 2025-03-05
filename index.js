require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Together = require('together-ai');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage });

const client = new Together({
    apiKey: process.env['TOGETHER_API_KEY']
});

const prompt = "For the provided invoice return the following attributes in a json. Only provide the JSON and no other text. Directly start with the JSON. The attributes and their names in the JSON are as follows: Invoice number: inv_no , Invoice date: inv_date, Customer name (bill to): cust_name, billing address: bill_address, , total (final total) : total, tax (amount, not percentage, can be GST, VAT, IGST, CGST, SGST) : tax (if not mentioned then 0), Due date: due_date, items List with name 'items' containing item name: item_name, quantity : qty, unit price: unit_price, quantity : qty, email, contact number . If anything is not available then write 'NaN' in front of it. Provide dates is DD-MM-YYYY format. In invoice number only provide numbers and no text. Provide all values in quatotation marks. Do not add tax or discount as items. Close the JSON with }";

app.post('/extract-text', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const filePath = file.path;
        const finalImageUrl = `data:image/jpeg;base64,${encodeImage(filePath)}`;
        console.log(filePath)

        const chatCompletion = await client.chat.completions.create({
            messages: [
                {
                    "role": "user",
                    "content": [
                        { "type": "text", "text": prompt },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": finalImageUrl,
                            },
                        },
                    ],
                }
            ],
            model: "meta-llama/Llama-Vision-Free",
            temperature: 0.3,
        });

        let op = await chatCompletion.choices[0].message.content;
        op = JSON.parse(op);
        console.log(op);

        if (op.inv_no === "") {
            op.inv_no = "INV-Default-0001";
        }

        res.status(200).send(op);
    } catch (error) {
        console.error("Error extracting text:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post('/preprocess', (req, res) => {
    try {
        let curr = {
            inv_no: req.body.inv_no || "NaN",
            inv_date: req.body.inv_date || "NaN",
            cust_name: req.body.cust_name || "NaN",
            bill_address: req.body.bill_address || "NaN",
            total: req.body.total || "NaN",
            tax: req.body.tax || "NaN",
            due_date: req.body.due_date || "NaN",
            items: req.body.items || []
        };

        console.log("Processed Invoice Data:", curr);
        res.status(200).json({ message: "Invoice data received successfully" });
    } catch (error) {
        console.error("Error processing invoice data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(process.env.PORT || 3001, () => {
    console.log("Server is running on port 3001.");
});

function encodeImage(imagePath) {
    const imageFile = fs.readFileSync(imagePath);
    return Buffer.from(imageFile).toString("base64");
}

function isRemoteFile(filePath) {
    return filePath.startsWith("http://") || filePath.startsWith("https://");
}