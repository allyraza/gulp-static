/* eslint-disable */
/**
 * Responsible for inter-module communication.
 * Classic EventEmitter Api. Heavily inspired by https://github.com/component/emitter
 */
function EventEmitter(scope) {
  /**
   * The listeners.
   *
   * @property listeners
   * @type Object
   */
  this.listeners = {};

  /**
   * The scope instance.
   *
   * @property scope
   * @type Sandbox
   */
  this.scope = scope;

  /**
   * Indicates whether the instance is connected to the scope.
   *
   * @property connected
   * @type Boolean
   */
  this.connected = false;
}

/**
 * Adds a listener for the given event.
 *
 * @method on
 * @param {String} event
 * @param {Function} listener
 * @return {EventEmitter}
 */
EventEmitter.prototype.on = EventEmitter.prototype.addListener = function(event, listener) {
  this.connect();

  (this.listeners['$' + event] = this.listeners['$' + event] || []).push(listener);
  return this;
};

/**
 * Adds a listener that will be invoked a single
 * time and automatically removed afterwards.
 *
 * @method once
 * @param {String} event
 * @param {Function} listener
 * @return {EventEmitter}
 */
EventEmitter.prototype.once = function(event, listener) {
  this.connect();

  function on() {
    this.off(event, on);
    listener.apply(this, arguments);
  }

  on.listener = listener;
  this.on(event, on);
  return this;
};

/**
 * Remove the given listener for the given event or all
 * registered listeners.
 *
 * @method off
 * @param {String} event
 * @param {Function} listener
 * @return {EventEmitter}
 */
EventEmitter.prototype.off = EventEmitter.prototype.removeListener = EventEmitter.prototype.removeAllListeners = function(event, listener) {
  // all
  if (arguments.length === 0) {
    this.listeners = {};
    return this;
  }

  // specific event
  var listeners = this.listeners['$' + event];
  if (!listeners) {
    return this;
  }

  // remove all listeners
  if (arguments.length === 1) {
    delete this.listeners['$' + event];
    return this;
  }

  // remove specific listener
  var cb;
  for (var i = 0, len = listeners.length; i < len; i++) {
    cb = listeners[i];
    if (cb === listener || cb.listener === listener) {
      listeners.splice(i, 1);
      break;
    }
  }

  return this;
};

/**
 * Dispatches event to the scope.
 *
 * @method emit
 * @param {Mixed} ...
 * @return {EventEmitter}
 */
EventEmitter.prototype.emit = function() {
  this.connect();

  // dispatches event to the scope
  this.scope.dispatch.apply(this.scope, arguments);

  return this;
};

/**
 * Handles dispatched event from scope.
 *
 * @method handle
 * @param {String} event
 * @param {Mixed} ...
 * @return {EventEmitter}
 */
EventEmitter.prototype.handle = function(event) {
  var args = [].slice.call(arguments, 1),
    listeners = this.listeners['$' + event];

  if (listeners) {
    listeners = listeners.slice(0);
    for (var i = 0, len = listeners.length; i < len; ++i) {
      listeners[i].apply(this, args);
    }
  }

  return this;
};


/**
 * Return array of listeners for the given event.
 *
 * @method listeners
 * @param {String} event
 * @return {Array}
 */
EventEmitter.prototype.listeners = function(event) {
  return this.listeners['$' + event] || [];
};

/**
 * Check if this event emitter has listeners.
 *
 * @method hasListeners
 * @param {String} event
 * @return {Boolean}
 */
EventEmitter.prototype.hasListeners = function(event) {
  return !!this.listeners(event).length;
};

/**
 * Connect instance to the scope.
 *
 * @method connect
 * @return {EventEmitter}
 */
EventEmitter.prototype.connect = function() {
  if (!this.connected) {
    this.scope.addEventEmitter(this);
    this.connected = true;
  }

  return this;
};

/**
 * Disconnect instance from the scope.
 *
 * @method disconnect
 * @return {EventEmitter}
 */
EventEmitter.prototype.disconnect = function() {
  if (this.connected) {
    this.scope.removeEventEmitter(this);
    this.connected = false;
  }

  return this;
};

export default EventEmitter;
