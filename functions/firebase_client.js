const admin = require("firebase-admin")

admin.initializeApp({
    credential: admin.credential.cert(
        require("./fullwet-stats-firebase-adminsdk-sjo96-7d75cdc8de.json")
    ),
})

exports.db = admin.firestore()

// exports.storage = admin.storage()
