const tap = require('tap-only')
const siftDate = require('.')
const sift = require('sift')

sift.use(siftDate)

const dates = [
    '1999-01-01',
    '2015-01-01',
    '2017-01-15',
    '2017-01-20',
    '2017-01-30',
].map((x) => new Date(x))

tap('Date', (t) => {
    const compare = new Date('2000-01-01')
    t.equals(sift({$older: compare}, dates).length, 1, `1 $older ${compare}`)
    t.equals(sift({$newer: compare}, dates).length, 4, `4 $newer ${compare}`)
    t.end()
})

tap('String', (t) => {
    const compare = '5 years'
    t.equals(sift({$older: compare}, dates).length, 1, `1 $older ${compare}`)
    t.equals(sift({$newer: compare}, dates).length, 4, `4 $newer ${compare}`)
    t.end()
})

// console.log(sift({$older: '-1 day'}, dates))
// console.log(sift({$older: new Date('2013-01-01')}, dates))
// console.log(sift({$newer: new Date('2013-01-01')}, dates))
