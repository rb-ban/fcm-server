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
    projectId: serviceAccount.project_id,
});

app.post('/send', async (req, res) => {
  const { token, tokens, title, body } = req.body;

  console.log('📥 Incoming request body:', req.body);

  if (!title || !body) {
    return res.status(400).send({ success: false, error: 'Title and body are required' });
  }

  try {
    // 🔹 Handle multiple tokens
    const validTokens = (tokens || []).filter(t => typeof t === 'string' && t.trim().length > 0);
    if (validTokens.length > 0) {
      const multicastMessage = {
        tokens: validTokens,
        message: { title, body } ,
      };

      const response = await admin.messaging().sendEachForMulticast(multicastMessage);
      return res.status(200).send({ success: true, response });
    }

    // 🔹 Handle single token
    if (token && typeof token === 'string' && token.trim().length > 0) {
      const singleMessage = {
        notification: { title, body },
        token: token,
      };

      const response = await admin.messaging().send(singleMessage);
      return res.status(200).send({ success: true, response });
    }

    return res.status(400).send({ success: false, error: 'No valid token(s) provided' });
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return res.status(500).send({ success: false, error: error.message });
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


// const express = require('express');
// const admin = require('firebase-admin');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // Load your Firebase service account
// const serviceAccount = require('./serviceAccountKey.json');

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

// app.post('/send', async (req, res) => {
//     const { token, tokens, title, body } = req.body;

//     try {
//         // ✅ Send to multiple tokens
//         if (tokens && Array.isArray(tokens) && tokens.length > 0) {
//             const multicastMessage = {
//                 notification: { title, body },
//                 tokens: tokens,
//             };

//             const response = await admin.messaging().sendMulticast(multicastMessage);
//             res.status(200).send({ success: true, response });

//         // ✅ Fallback: single token
//         } else if (token) {
//             const singleMessage = {
//                 notification: { title, body },
//                 token: token,
//             };

//             const response = await admin.messaging().send(singleMessage);
//             res.status(200).send({ success: true, response });

//         } else {
//             res.status(400).send({ success: false, error: 'Missing token(s)' });
//         }

//     } catch (error) {
//         console.error('❌ Error sending notification:', error);
//         res.status(500).send({ success: false, error: error.message });
//     }
// });
// // app.post('/send', async (req, res) => {
// //     const { token, title, body } = req.body;

// //     const message = {
// //         notification: {
// //             title,
// //             body,
// //         },
// //         token,
// //     };

// //     try {
// //         const response = await admin.messaging().send(message);
// //         res.status(200).send({ success: true, response });
// //     } catch (error) {
// //         res.status(500).send({ success: false, error });
// //     }
// // });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
