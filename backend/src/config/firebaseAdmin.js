const { initializeApp, cert } = require("firebase-admin/app");

const serviceAccount = require("../../firebase-service-account.json");

const firebaseApp = initializeApp({
  credential: cert(serviceAccount),
});

module.exports = firebaseApp;