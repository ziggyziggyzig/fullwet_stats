const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../firebase_client")

const insert_into_firestore = async () => {
    let results = []
    let batch = new BigBatch({firestore:db})
    for (let i = 1950; i <= 2022; i++) {
        let results_file = require(`../../src/data/races/${i}.json`)
        for (let race of results_file.MRData.RaceTable.Races) {
            for (let result of race.Results) {
                let i = results.findIndex(
                    o => o.season === parseInt(race.season, 10)
                        && o.round === parseInt(race.round, 10)
                        && o.position === parseInt(result.position, 10)
                )
                if (i === -1) {
                    await batch.set(
                        db
                            .collection('years')
                            .doc(race.season)
                            .collection('races')
                            .doc(race.round)
                            .collection('raceresults')
                            .doc(result.position), {
                            year:parseInt(race.season,10),
                            race:parseInt(race.round,10),
                            driver:result.Driver.driverId,
                            constructor:result.Constructor.constructorId,
                            carnumber:parseInt(result.number, 10),
                            points:parseInt(result.points, 10),
                            grid:parseInt(result.grid, 10),
                            laps:parseInt(result.laps, 10),
                            status:result.status,
                            fastestlap_rank:result.FastestLap ? parseInt(result.FastestLap.rank, 10) : null,
                            fastestlap_lap:result.FastestLap ? parseInt(result.FastestLap.lap, 10) : null,
                            fastestlap_time:result.FastestLap ? result.FastestLap.Time.time : null
                        }, {merge:true})
                    results.push({
                        season:parseInt(race.season, 10),
                        round:parseInt(race.round, 10),
                        position:parseInt(result.position, 10),
                        driver:result.Driver.driverId,
                        constructor:result.Constructor.constructorId,
                        carnumber:parseInt(result.number, 10),
                        points:parseInt(result.points, 10),
                        grid:parseInt(result.grid, 10),
                        laps:parseInt(result.laps, 10),
                        status:result.status,
                        fastestlap_rank:result.FastestLap ? parseInt(result.FastestLap.rank, 10) : null,
                        fastestlap_lap:result.FastestLap ? parseInt(result.FastestLap.lap, 10) : null,
                        fastestlap_time:result.FastestLap ? result.FastestLap.Time.time : null
                    })
                }
            }
        }
    }
    batch.commit()
    console.log(results[0], results[results.length - 1])
}

insert_into_firestore()