const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../firebase_client")

const insert_into_firestore = async () => {
    let races = []
    let batch = new BigBatch({firestore:db})
    for (let i = 1950; i <= 2022; i++) {
        let results_file = require(`../../src/data/races/${i}.json`)
        let halfpoints_file=require(`../../src/data/races/half_points.json`)
        for (let race of results_file.MRData.RaceTable.Races) {
            let i = races.findIndex(o => o.season === parseInt(race.season,10)&&o.round===parseInt(race.round,10))
            if (i === -1) {
                let multiplier=1
                for (let r of halfpoints_file.races) {
                    if (r.year===parseInt(race.season,10) && (r.race===parseInt(race.round,10))) {
                        multiplier=0.5
                    }
                }
                await batch.set(db.collection('years').doc(race.season).collection('races').doc(race.round), {
                    season: parseInt(race.season,10),
                    round: parseInt(race.round,10),
                    name: race.raceName,
                    date: race.date,
                    circuit:race.Circuit.circuitId,
                    multiplier: multiplier
                }, {merge:true})
                races.push({
                    season: parseInt(race.season,10),
                    round: parseInt(race.round,10),
                    name: race.raceName,
                    date: race.date,
                    circuit:race.Circuit.circuitId,
                    multiplier:multiplier
                })
            }
        }
    }
    await batch.commit()
    return true
}

insert_into_firestore()