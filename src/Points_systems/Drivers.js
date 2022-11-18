import {useEffect, useState} from "react"

const Drivers = () => {
    const [pointsSystem, setPointsSystem] = useState(null)
    const [pointsSystemId, setPointsSystemId] = useState("2022")
    const [showYear, setShowYear] = useState("2022")
    const [yearResults, setYearResults] = useState(null)
    const [allScores, setAllScores] = useState([])
    const [allDrivers, setAllDrivers] = useState([])
    const [championshipPoints, setChampionshipPoints] = useState([])

    // load points system
    useEffect(() => {
        if (pointsSystemId) {
            let points_file = require('../data/point_systems/drivers.json')
            for (let s of points_file.systems) {
                if (s.id === pointsSystemId) setPointsSystem(s)
            }
        }
    }, [pointsSystemId])

    // load race results
    useEffect(() => {
        if (showYear) {
            let results_file = require(`../data/races/${showYear}.json`)
            if (results_file) {
                setYearResults(results_file.MRData.RaceTable.Races)
            }
        }
    }, [showYear])

    // calculate points
    useEffect(() => {
        if (pointsSystem && yearResults) {
            let scores = []
            let drivers = []

            for (let race of yearResults) {
                let results = race.Results

                for (let position of results) {
                    let points = 0
                    for (let systemposition of pointsSystem.positions) {
                        if (systemposition.position === parseInt(position.position, 10)) points = systemposition.points
                    }

                    let half_points = require('../data/races/half_points.json')
                    for (let h of half_points.races) {
                        if (h.year===parseInt(race.season,10) && (h.race===parseInt(race.round,10))) points=points/2
                    }

                    scores.push({
                        driverid:position.Driver.driverId,
                        driver:position.Driver.givenName + " " + position.Driver.familyName,
                        round:race.round,
                        race:race.raceName,
                        points:Math.round(points*10)/10
                    })
                    if (!drivers.find(o => o.id === position.Driver.driverId)) drivers.push({
                        id:position.Driver.driverId,
                        driver:position.Driver.givenName + " " + position.Driver.familyName
                    })
                }
            }
            setAllScores(scores)
            setAllDrivers(drivers)
        }
    }, [pointsSystem, yearResults])

    // calculate championship points
    useEffect(() => {
        if (pointsSystem && allScores && allScores.length > 0) {
            let championship_points = []
            let threshold
            if (pointsSystem.best_count.all) {
                threshold = pointsSystem.best_count.all
            }
            for (let driver of allDrivers) {
                let total_points = 0
                let driver_scores = allScores.filter(o => o.driverid === driver.id)
                driver_scores.sort((a, b) => b.points - a.points)
                for (let i = 0; i < threshold; i++) {
                    if (driver_scores[i]) {
                        total_points += driver_scores[i].points
                    }
                }
                championship_points.push({
                    driverid:driver.id,
                    driver:driver.driver,
                    points:total_points
                })
            }
            championship_points.sort((a, b) => b.points - a.points)
            setChampionshipPoints(championship_points)
        }
    }, [pointsSystem, allScores,allDrivers])

    const range = (start, stop, step) => Array.from({length:(stop - start) / step + 1}, (_, i) => start + (i * step))

    return <div style={{textAlign:'left'}}>
        championship year: <select onChange={(e) => setShowYear(e.target.value)} defaultValue="2022">
        {range(1950, 2022, 1).map(i => <option key={i}>{i}</option>)}
    </select>&nbsp;
        points system:
        <select onChange={(e) => setPointsSystemId(e.target.value)} defaultValue="2022">
            <option value="1950">1950-1953</option>
            <option value="1991">1991-2002</option>
            <option value="2003">2003-2009</option>
            <option value="2010">2010-2018</option>
            <option value="2022">2022</option>
        </select>
        {championshipPoints && championshipPoints.length > 0 &&
            <ol>
                {championshipPoints.map(p =>
                    <li key={p.driverid}>{p.driver} ({p.points})</li>
                )}
            </ol>
        }
        (fastest laps not yet included)
    </div>
}

export default Drivers