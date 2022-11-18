import {initializeApp} from "firebase/app"
import {getFirestore} from "firebase/firestore"

const app = initializeApp(require(`./FirebaseConfig.json`))

const db = getFirestore(app)

export {db}
