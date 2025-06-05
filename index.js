const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Load your Firebase service account
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

app.post('/send', async (req, res) => {
    const { token, tokens, title, body } = req.body;

    try {
        // ✅ Send to multiple tokens
        if (tokens && Array.isArray(tokens) && tokens.length > 0) {
            const multicastMessage = {
                notification: { title, body },
                tokens: tokens,
            };

            const response = await admin.messaging().sendMulticast(multicastMessage);
            res.status(200).send({ success: true, response });

        // ✅ Fallback: single token
        } else if (token) {
            const singleMessage = {
                notification: { title, body },
                token: token,
            };

            const response = await admin.messaging().send(singleMessage);
            res.status(200).send({ success: true, response });

        } else {
            res.status(400).send({ success: false, error: 'Missing token(s)' });
        }

    } catch (error) {
        console.error('❌ Error sending notification:', error);
        res.status(500).send({ success: false, error: error.message });
    }
});
// app.post('/send', async (req, res) => {
//     const { token, title, body } = req.body;

//     const message = {
//         notification: {
//             title,
//             body,
//         },
//         token,
//     };

//     try {
//         const response = await admin.messaging().send(message);
//         res.status(200).send({ success: true, response });
//     } catch (error) {
//         res.status(500).send({ success: false, error });
//     }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
