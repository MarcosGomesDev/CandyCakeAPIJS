const geolib = require('geolib')

const {getDistance} = require('geolib')

module.exports = {
    getDistanceInKm(latAtual, lonAtual, latFinal, lonFinal) {
        let distanceInKm = getDistance({latitude: latAtual, longitude: lonAtual}, {latitude: latFinal, lon: lonFinal})
        const finalDistance = (distanceInKm / 1000).toFixed(1)

        return finalDistance
    }
}