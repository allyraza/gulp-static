/* eslint-disable */
/**
 * The scope is used as a central point to get resources from, add modules etc.
 * It is shared between all modules.
 *
 * @constructor
 * @param {Application} application
 *      The application reference
 */
/* global Utils */
function Scope(application) {
  /**
   * The application.
   *
   * @property application
   * @type Application
   */
  this.application = application;

  /**
   * Contains references to all module event emitters.
   *
   * @property eventEmitters
   * @type Array
   */
  this.eventEmitters = [];

  var scope = this;
  var data = application.config.data;

  if ("object" === typeof data) {
    for (var attr in data) {
      if (data.hasOwnProperty(attr)) {
        scope[attr] = data[attr];
      }
    }
  }
}

/**
 * Adds (register and start) all modules in the given context scope.
 *
 * @method addModules
 * @param {Node} ctx
 *      The context node
 * @return {Object}
 *      A collection containing the registered modules
 */
Scope.prototype.addModules = function(ctx) {
  var modules = {},
    application = this.application;

  if (Utils.isNode(ctx)) {
    // register modules
    modules = application.registerModules(ctx);

    // start modules
    application.start(modules);
  }

  return modules;
};

/**
 * Removes a module by module instances.
 * This stops and unregisters a module through a module instance.
 *
 * @method removeModules
 * @param {any} modules
 *      A collection of module to remove | Node context to look for registered modules in.
 * @return {Scope}
 */
Scope.prototype.removeModules = function(modules) {
  var application = this.application;

  if (Utils.isNode(modules)) {
    // get modules
    var tmpModules = {};

    var nodes = Utils.getModuleNodes(modules);
    nodes.forEach(function(ctx) {
      // check for instance
      if (ctx.hasAttribute('data-module-id')) {
        var id = ctx.getAttribute('data-module-id');
        var module = this.getModuleById(id);

        if (module) {
          tmpModules[id] = module;
        }
      }
    }.bind(this));

    modules = tmpModules;
  }

  if (Utils.isObject(modules)) {
    // stop modules – let the module clean itself
    application.stop(modules);

    // unregister modules – clean up the application
    application.unregisterModules(modules);
  }

  return this;
};

/**
 * Gets the appropriate module for the given ID.
 *
 * @method getModuleById
 * @param {int} id
 *      The module ID
 * @return {Module}
 *      The appropriate module
 */
Scope.prototype.getModuleById = function(id) {
  return this.application.getModuleById(id);
};

/**
 * Gets the application config.
 *
 * @method getConfig
 * @return {Object}
 *      The configuration object
 */
Scope.prototype.getConfig = function() {
  return this.application.config;
};

/**
 * Gets an application config param.
 *
 * @method getConfigParam
 * @param {String} name
 *      The param name
 * @return {any}
 *      The appropriate configuration param
 */
Scope.prototype.getConfigParam = function(name) {
  var config = this.application.config;

  if (config[name] !== undefined) {
    return config[name];
  } else {
    throw Error('The config param ' + name + ' does not exist');
  }
};

/**
 * Adds an event emitter instance.
 *
 * @method addEventEmitter
 * @param {EventEmitter} eventEmitter
 *      The event emitter
 * @return {Scope}
 */
Scope.prototype.addEventEmitter = function(eventEmitter) {
  this.eventEmitters.push(eventEmitter);
  return this;
};

/**
 * Removes an event emitter instance.
 *
 * @method addEventEmitter
 * @param {EventEmitter} eventEmitter
 *      The event emitter
 * @return {Scope}
 */
Scope.prototype.removeEventEmitter = function(eventEmitter) {
  var eventEmitters = this.eventEmitters;
  for (var i = 0, len = eventEmitters.length; i < len; i++) {
    if (eventEmitters[i] === eventEmitter) {
      eventEmitters.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Dispatches the event with the given arguments to the attached event emitters.
 *
 * @method dispatch
 * @param {Mixed} ...
 * @return {Scope}
 */
Scope.prototype.dispatch = function() {
  var eventEmitters = this.eventEmitters;

  for (var i = 0, len = eventEmitters.length; i < len; i++) {
    var eventEmitter = eventEmitters[i];
    if (eventEmitter !== undefined) {
      eventEmitter.handle.apply(eventEmitter, arguments);
    }
  }

  return this;
};

export default Scope;
