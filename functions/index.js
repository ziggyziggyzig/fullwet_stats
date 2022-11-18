const functions = require("firebase-functions")
const {fetch_raceresults} = require("./fetch_raceresults")

if (!process.env.FUNCTION_TARGET || process.env.FUNCTION_TARGET === 'fetch_raceresults') {
    exports.fetch_raceresults = functions
        .region("us-central1")
        .runWith({
            timeoutSeconds:360
        })
        .pubsub.schedule("0 4 * * 1")
        .timeZone("Europe/Amsterdam")
        .onRun(async () => {
            return await fetch_raceresults()
        })
}
