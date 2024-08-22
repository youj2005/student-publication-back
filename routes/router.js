import express, { response } from 'express';
const router = express.Router();
import admin from 'firebase-admin';
import { TopicClassificationPipeline, BiasClassificationPipeline } from '../classifier.js';
import { getDatabase, ref, set } from "firebase/database";
import app from '../firebase-config.js'

admin.initializeApp({
  credential: admin.credential.cert({
    "type": "service_account",
    "project_id": "lower-case",
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/gm, "\n"),
    "client_email": "firebase-adminsdk-28vkl@lower-case.iam.gserviceaccount.com",
    "client_id": "116863521377041415151",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-28vkl%40lower-case.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
  ),
})

const articlesRef = admin.firestore().collection("articles");

BiasClassificationPipeline.getInstance()
TopicClassificationPipeline.getInstance()
const topics = ['Politics', 'Sports', 'Arts and Culture', 'Science & Technology', 'Health', 'Business & Finance', 'World', 'Crime', 'Lifestyle']

router.post('/addarticle', async (req, res) => {
  try {
    admin.auth().verifyIdToken(req.body.idToken).then(async (decodedToken) => {
      const BiasClassifier = await BiasClassificationPipeline.getInstance();
      const TopicClassifier = await TopicClassificationPipeline.getInstance();
      let topic_response = await TopicClassifier(req.body.title, topics);
      let bias_response = await BiasClassifier(req.body.content);
      console.log(topic_response);
      console.log(bias_response);
      if (bias_response[0].label != 'NEUTRAL') {
        res.status(400).send({
          message: "Unfortunately, our AI detected this article to be biased so we cannot accept it. Please try again with a different article.",
          data: {},
          error: {},
        });
        return;
      }
      const docID = articlesRef.doc().id;
      console.log(docID)
      const articleModel = {
        title: req.body.title,
        content: req.body.content,
        topic: topic_response.labels[0],
        author: req.body.author,
        email: req.body.email,
        image: req.body.image,
      };
      await articlesRef
        .doc(docID)
        .set(articleModel, { merge: true })
        .then((value) => {
          console.log(value);
          const viewDatabase = getDatabase(app);
          set(ref(viewDatabase, 'views/' + docID), {
            count: 0,
          });
          // return response to users
          res.status(200).send({
            message: "Article added successfully to: " + topic_response.labels[0] + "!",
            data: docID,
            error: {},
          });
        });
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

export default router;