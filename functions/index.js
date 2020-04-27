const functions = require("firebase-functions");
const app = require("express")();
const cors= require("cors");
app.use(cors());
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentOnScream,
  likeOnScream,
  unlikeOnScream,
  deleteScream
} = require("./handlers/screams");
const {
  register,
  login,
  uploadImage,
  addUserDetails,
  getUserDetails,
  getUserHandleDetails,
  markNotificationsRead,
  passwordReset
} = require("./handlers/users");
const { db } = require("./util/admin");
const { FBAuth } = require("./util/fbAuth");
// User routes
app.post("/signup", register);
app.post("/login", login);
app.post("/passwordReset", passwordReset);
app.post("/user/image", FBAuth, uploadImage);
app.post("/user", FBAuth, addUserDetails);
app.get("/user", FBAuth, getUserDetails);
app.get("/user/:handle", getUserHandleDetails);
app.post("/notifications", FBAuth, markNotificationsRead);
// Scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
app.get("/scream/:screamId", getScream);
app.post("/scream/:screamId/comment", FBAuth, commentOnScream);
app.delete("/scream/:screamId/delete", FBAuth, deleteScream);
app.get("/scream/:screamId/like", FBAuth, likeOnScream);
app.get("/scream/:screamId/unlike", FBAuth, unlikeOnScream);
exports.api = functions.region("asia-east2").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => console.error(err));
  });
exports.deleteNotificationOnUnLike = functions
  .region("asia-east2")
  .firestore.document("likes/{id}")
  .onDelete(snapshot => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
      });
  });
exports.createNotificationOnComment = functions
  .region("asia-east2")
  .firestore.document("comments/{id}")
  .onCreate(snapshot => {
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });
exports.onUserImageChange = functions
  .region("asia-east2")
  .firestore.document("users/{userId}")
  .onUpdate(change => {
    console.log("change", change.before.data());
    console.log("change", change.after.data());
    if (change.before.data().imageUrl !== change.after.data()) {
      console.log("image has changed");

      const batch = db.batch();
      return db
        .collection("screams")
        .where("userHandle", "==", change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    }else return true;
  });

exports.onScreamDelete = functions
  .region("asia-east2")
  .firestore.document("screams/{screamId}")
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection("comments")
      .where("screamId", "==", screamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection("likes")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/likes/${doc.id}`));
        });
        return db
          .collection("notifications")
          .where("screamId", "==", screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(error => {
        console.err(error);
      });
  });
