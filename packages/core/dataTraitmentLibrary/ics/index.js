'use strict';
const ics = require('ics-to-json').default;
const ICAL = require('ical.js');

module.exports = {
  icstojson: _icstojson,
  json_to_ics: _jsontoics
};


// --------------------------------------------------------------------------------

function decode_utf8(s) {
  // console.log("in decode",s)
  try {
    return decodeURIComponent(escape(s));
  } catch (e) {
    return s;
  }
}

function _icstojson(icsData) {
  return new Promise((resolve, reject) => {
    try {
      // Parse ICS data with ical.js
      const jcalData = ICAL.parse(icsData);
      const comp = new ICAL.Component(jcalData);

      // Convert to JSON format
      const events = comp.getAllSubcomponents('vevent').map(vevent => {
        const event = new ICAL.Event(vevent);
        return {
          summary: event.summary,
          startDate: event.startDate ? event.startDate.toJSDate() : null,
          endDate: event.endDate ? event.endDate.toJSDate() : null,
          description: event.description,
          location: event.location,
          uid: event.uid
        };
      });

      resolve({ events });
    }catch(e) {
      console.log(e);
      reject(e);
    }
  });
}

function _jsontoics(jsonData, header) {
  return new Promise((resolve, reject) => {
    try {
      // Create ICAL component from JSON data
      const comp = new ICAL.Component(['vcalendar', [], []]);
      comp.updatePropertyWithValue('version', '2.0');
      comp.updatePropertyWithValue('prodid', '-//Semantic Bus//ICS Converter//EN');

      // Add events from JSON data
      if (jsonData.events) {
        jsonData.events.forEach(eventData => {
          const vevent = new ICAL.Component('vevent');
          if (eventData.summary) vevent.updatePropertyWithValue('summary', eventData.summary);
          if (eventData.description) vevent.updatePropertyWithValue('description', eventData.description);
          if (eventData.location) vevent.updatePropertyWithValue('location', eventData.location);
          if (eventData.uid) vevent.updatePropertyWithValue('uid', eventData.uid);
          if (eventData.startDate) {
            const startTime = ICAL.Time.fromJSDate(new Date(eventData.startDate));
            vevent.updatePropertyWithValue('dtstart', startTime);
          }
          if (eventData.endDate) {
            const endTime = ICAL.Time.fromJSDate(new Date(eventData.endDate));
            vevent.updatePropertyWithValue('dtend', endTime);
          }
          comp.addSubcomponent(vevent);
        });
      }

      const resultICS = comp.toString();
      resolve(resultICS);
    }catch(e) {
      console.log(e);
      resolve({
        error: {
          message: 'Unable to parse the data, see https://www.npmjs.com/package/ical.js and https://en.wikipedia.org/wiki/ICalendar',
          libMessage: e.message
        }
      });
    }
  });
}
