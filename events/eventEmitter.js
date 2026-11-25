const EventEmitter = require("events");

class ActivityEmitter extends EventEmitter {}

const activityEmitter = new ActivityEmitter();

module.exports = activityEmitter;