const {db} = require("./firebase_client")
const {BigBatch} = require("@qualdesk/firestore-big-batch")
const axios = require("axios")
const {firestore} = require("firebase-admin")

module.exports.fetch_raceresults = () =>
    new Promise(async resolve => {

        let year = new Date().getFullYear()
        let snap = await db.collection('years').doc(String(year)).collection('races').orderBy('round', 'desc').limit(1).get()
        let lastRace = 0
        for (let d of snap.docs) {
            lastRace = d.data().round
        }
        let ergast_data = await axios.get('http://ergast.com/api/f1/current/last/results.json')
        if (parseInt(ergast_data.data.MRData.RaceTable.round, 10) <= lastRace) {
            console.log('no new race results')
            return resolve(true)
        }

        console.log('new race results')

        let race_data = ergast_data.data.MRData.RaceTable.Races[0]

        let batch = new BigBatch({firestore:db})

        await batch.set(db.collection('years').doc(race_data.season).collection('races').doc(race_data.round), {
            season: parseInt(race_data.season,10),
            round: parseInt(race_data.round,10),
            name: race_data.raceName,
            date: race_data.date,
            circuit:race_data.Circuit.circuitId,
            multiplier: 1
        }, {merge:true})

        let circuit = race_data.Circuit
        await batch.set(db.collection('circuits').doc(circuit.circuitId), {
            id:circuit.circuitId,
            name:circuit.circuitName
        }, {merge:true})
        console.log({
            id:circuit.circuitId,
            name:circuit.circuitName
        })

        for (let result of race_data.Results) {
            let driver = result.Driver
            let constructor = result.Constructor
            await batch.set(db.collection('drivers').doc(driver.driverId), {
                id:driver.driverId,
                fullname:`${driver.givenName} ${driver.familyName}`,
                givenname:driver.givenName,
                familyname:driver.familyName,
                birthdate:driver.dateOfBirth,
                nationality:driver.nationality,
                permanentnumber:parseInt(driver.permanentNumber, 10) || null,
                code:driver.code || null
            }, {merge:true})
            console.log({
                id:driver.driverId,
                fullname:`${driver.givenName} ${driver.familyName}`,
                givenname:driver.givenName,
                familyname:driver.familyName,
                birthdate:driver.dateOfBirth,
                nationality:driver.nationality,
                permanentnumber:parseInt(driver.permanentNumber, 10) || null,
                code:driver.code || null
            })
            await batch.set(db.collection('constructors').doc(constructor.constructorId), {
                id:constructor.constructorId,
                name:constructor.name,
                nationality:constructor.nationality
            }, {merge:true})
            console.log({
                id:constructor.constructorId,
                name:constructor.name,
                nationality:constructor.nationality
            })
            await batch.set(
                db
                    .collection('years')
                    .doc(race_data.season)
                    .collection('races')
                    .doc(race_data.round)
                    .collection('raceresults')
                    .doc(result.position), {
                    year:parseInt(race_data.season,10),
                    race:parseInt(race_data.round,10),
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
            console.log({
                year:parseInt(race_data.season,10),
                race:parseInt(race_data.round,10),
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

        await batch.update(db.collection('stats').doc('races'),{race_count:firestore.FieldValue.increment(1)})
        await batch.commit()
        return resolve(true)
    })
