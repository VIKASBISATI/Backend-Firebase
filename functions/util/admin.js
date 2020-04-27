const admin = require("firebase-admin");
const serviceAccount = require("../socialape-9a698-firebase-adminsdk-alyem-bebd7cc4c6.json");
const { config } = require("../util/config");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://socialape-9a698.firebaseio.com",
  storageBucket: config.storageBucket
});
const db = admin.firestore();

module.exports = { admin, db };
