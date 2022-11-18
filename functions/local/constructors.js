const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../firebase_client")

const insert_into_firestore = async () => {
    let constructors = []
    let batch = new BigBatch({firestore:db})
    for (let i = 1950; i <= 2022; i++) {
        let results_file = require(`../../src/data/races/${i}.json`)
        for (let race of results_file.MRData.RaceTable.Races) {
            for (let result of race.Results) {
                let constructor = result.Constructor
                let i = constructors.findIndex(o => o.id === constructor.constructorId)
                if (i === -1) {
                    await batch.set(db.collection('constructors').doc(constructor.constructorId), {
                        id:constructor.constructorId,
                        name:constructor.name,
                        nationality:constructor.nationality
                    }, {merge:true})
                    constructors.push({
                        id:constructor.constructorId,
                        name:constructor.name,
                        nationality:constructor.nationality
                    })
                }
            }
        }
    }
    await batch.commit()
    console.log(constructors)
    return true
}

insert_into_firestore()