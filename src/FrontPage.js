import {useEffect, useState} from "react"
import {getCountFromServer, collection, getDoc, doc, getDocs, query, orderBy, limit} from 'firebase/firestore'
import {db} from "./firebase/Firebase"
import Loading from "./Loading"

const FrontPage = () => {
    const [raceCount, setRaceCount] = useState(null)
    const [circuitCount, setCircuitCount] = useState(null)
    const [driverCount, setDriverCount] = useState(null)
    const [constructorCount, setConstructorCount] = useState(null)
    const [lastRace, setLastRace] = useState(null)

    useEffect(() => {
        const loadData = async () => {
            const circuit_snap = await getCountFromServer(collection(db, "circuits"))
            setCircuitCount(circuit_snap.data().count)

            const driver_snap = await getCountFromServer(collection(db, "drivers"))
            setDriverCount(driver_snap.data().count)

            const constructor_snap = await getCountFromServer(collection(db, "constructors"))
            setConstructorCount(constructor_snap.data().count)

            let year = new Date().getFullYear()

            let last_race_snap = await getDocs(query(collection(db, "years", String(year), "races"), orderBy('round', 'desc'), limit(1)))

            while (last_race_snap.size === 0) {
                year--
                last_race_snap = await getDocs(query(collection(db, "years", String(year), "races"), orderBy('round', 'desc'), limit(1)))
            }

            for (let d of last_race_snap.docs) {
                setLastRace(`${d.data().season} ${d.data().name}`)
            }

            const race_count_doc = await getDoc(doc(db, "stats", "races"))
            setRaceCount(race_count_doc.data().race_count)

        }

        loadData()
    }, [])

    return <div>
        <p><b>Last race added</b>: {lastRace || <Loading/>}</p>
        <p><b>Number of races in database</b>: {raceCount || <Loading/>}</p>
        <p><b>Number of drivers in database</b>: {driverCount || <Loading/>}</p>
        <p><b>Number of constructors in database</b>: {constructorCount || <Loading/>}</p>
        <p><b>Number of circuits in database</b>: {circuitCount || <Loading/>}</p>
    </div>
}

export default FrontPage