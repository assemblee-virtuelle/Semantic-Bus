# sift-date
Sift expressions to check for older/newer dates

[![Build Status](https://travis-ci.org/kba/sift-date.svg?branch=master)](https://travis-ci.org/kba/sift-date)

This extends sift with `$older` and `$newer` to filter `Date` values being
newer/older than a reference `Date` or an amount of time passed relative to
`Date.now`

## Examples

```js
const sift = require('sift')
const siftDate = require('sift-date')
sift.use(siftDate)

sift({$older: new Date('2014-01-01')}, [new Date('2013-01-01'), new Date('2015-01-01')])
sift({$older: '3 years'}, [new Date('2013-01-01'), new Date('2015-01-01')])
sift({$newer: '42 months'}, [new Date('2013-01-01'), new Date('2015-01-01')])
```

## String Notation

The value to `$older`/`$newer` can be either a `Date` or a duration in string notation:

The format of the string notation is `amount unit`.

* `unit` must be one of
  * `second`
  * `minute`
  * `hour`
  * `day`
  * `week`
  * `month`
  * `year`
* Plural-s for `unit` is optional, e.g. `1 year` is the same as `1 years`
* `amount` must be a number
