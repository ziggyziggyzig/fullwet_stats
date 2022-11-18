const {BigBatch} = require("@qualdesk/firestore-big-batch")
const {db} = require("../firebase_client")

const insert_into_firestore = async () => {
    let drivers = []
    let batch = new BigBatch({firestore:db})
    for (let i = 1950; i <= 2022; i++) {
        let results_file = require(`../../src/data/races/${i}.json`)
        for (let race of results_file.MRData.RaceTable.Races) {
            for (let result of race.Results) {
                let driver = result.Driver
                let i = drivers.findIndex(o => o.id === driver.driverId)
                if (i === -1) {
                    await batch.set(db.collection('drivers').doc(driver.driverId), {
                        id:driver.driverId,
                        fullname:`${driver.givenName} ${driver.familyName}`,
                        givenname:driver.givenName,
                        familyname:driver.familyName,
                        birthdate:driver.dateOfBirth,
                        nationality:driver.nationality,
                        permanentnumber:parseInt(driver.permanentNumber,10)||null,
                        code:driver.code||null
                    }, {merge:true})
                    drivers.push({
                        id:driver.driverId,
                        fullname:`${driver.givenName} ${driver.familyName}`,
                        givenname:driver.givenName,
                        familyname:driver.familyName,
                        birthdate:driver.dateOfBirth,
                        nationality:driver.nationality,
                        permanentnumber:parseInt(driver.permanentNumber,10)||null,
                        code:driver.code||null
                    })
                }
            }
        }
    }
    await batch.commit()
    console.log(drivers[10],drivers[drivers.length-1])
    return true
}

insert_into_firestore()