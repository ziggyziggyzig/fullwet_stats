const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../firebase_client")

const insert_into_firestore = async () => {
    let tracks = []
    let batch = new BigBatch({firestore:db})
    for (let i = 1950; i <= 2022; i++) {
        let results_file = require(`../../src/data/races/${i}.json`)
        for (let race of results_file.MRData.RaceTable.Races) {
            let circuit = race.Circuit
            let i = tracks.findIndex(o => o.id === circuit.circuitId)
            if (i === -1) {
                await batch.set(db.collection('circuits').doc(circuit.circuitId), {
                    id:circuit.circuitId,
                    name:circuit.circuitName
                }, {merge:true})
            }
        }
    }
    await batch.commit()
    return true
}

insert_into_firestore()