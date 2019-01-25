const _CACHE = {}

const ms = {}
ms.second = 1000
ms.minute = 60 * ms.second
ms.hour = 60 * ms.minute
ms.day = 24 * ms.hour
ms.week = 7 * ms.day
ms.month = 4 * ms.week
ms.year = 365 * ms.day

ms.sec = ms.second
ms.min = ms.minute

function parseDuration(str) {
    if (!(str in _CACHE)) {
        var [amount, unit] = str.split(/\s+/)
        unit = unit.replace(/s$/, '')
        if (!(unit in ms)) throw new Error(`No such time unit ${unit}`)
        _CACHE[str] = parseFloat(amount) * ms[unit]
    }
    return _CACHE[str]
}

function ensureTime(val) {
    if (val instanceof Date) val = val.getTime()
    else if (typeof val !== 'number') throw new Error("Can only compare dates against Date or number")
    return val
}

function isDateIsh(val) {
    return (val instanceof Date) || (typeof val === 'number')
}

function parseQuery(query) {
    var now, amount=0
    if (isDateIsh(query)) {
        now = ensureTime(query)
    } else if (typeof query === 'string') {
        now = Date.now() 
        amount = parseDuration(query)
    } else {
        throw new Error("Invalid sift-date query")
    }
    return [now, amount]
}

module.exports = {
    $older: function(query, dt) {
        dt = ensureTime(dt) 
        var [now, amount] = parseQuery(query)
        // console.log({now, dt}, Math.abs(now  dt))
        if (amount === 0) return dt < now
        return Math.abs(now - dt) > amount
    },
    $newer: function(query, dt) {
        dt = ensureTime(dt) 
        var [now, amount] = parseQuery(query)
        // console.log({now, dt}, Math.abs(now - dt))
        if (amount === 0) return dt > now
        return Math.abs(now - dt) < amount
    },
}
