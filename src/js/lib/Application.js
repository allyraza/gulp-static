/* eslint-disable */
import Module from './Module';
import Utils from './Utils';
import Scope from './Scope';
import EventEmitter from './EventEmitter';

/**
 * Responsible for application-wide issues such as the creation of modules.
 *
 * @constructor
 * @param {Node} ctx
 *      The context node
 * @param {Object} config
 *      The configuration
 */
/* global Scope, Utils, Module */
function Application(ctx, config) {
  // validate params
  if (!ctx && !config) {
    // both empty
    ctx = document;
    config = {};
  } else if (Utils.isNode(config)) {
    // reverse order of arguments
    var tmpConfig = config;
    config = ctx;
    ctx = tmpConfig;
  } else if (!Utils.isNode(ctx) && !config) {
    // only config is given
    config = ctx;
    ctx = document;
  } else if (Utils.isNode(ctx) && !config) {
    // only ctx is given
    config = {};
  }

  var defaults = {
    namespace: Module
  };

  config = Utils.extend(defaults, config);

  /**
   * The context node.
   *
   * @property ctx
   * @type Node
   */
  this.ctx = Utils.getElement(ctx);

  /**
   * The configuration.
   *
   * @property config
   * @type Object
   */
  this.config = config;

  /**
   * The sandbox to get the resources from.
   * The singleton is shared between all modules.
   *
   * @property scope
   * @typeScope 
   */
  this.scope = new Scope(this);

  /**
   * Contains references to all modules on the page.
   *
   * @property modules
   * @type Object
   */
  this.modules = {};

  /**
   * The next unique module id to use.
   *
   * @property id
   * @type Number
   */
  this.id = 1;
}

/**
 * Register modules within the context
 * Automatically registers all modules within the context,
 * as long as the modules use the naming conventions.
 *
 * @method registerModules
 * @param {Node} ctx
 *      The context node
 * @return {Object}
 *      A collection containing the registered modules
 */
Application.prototype.registerModules = function(ctx) {
  var modules = {};

  ctx = Utils.getElement(ctx) || this.ctx;

  this.scope.dispatch('t.register.start');

  // get module nodes
  var nodes = Utils.getModuleNodes(ctx);
  nodes.forEach(function(ctx) {

    /*
     * A module can have different data attributes.
     * See below for possible values.
     */

    /*
     * @config data-module="{mod-name}"
     *
     * Example: data-module="foo"
     * Indicates that the module Foo should be bound.
     */

    /*
     * @config data-namespace="{namespace}"
     *
     * Example: data-namespace="App.Components"
     * The namespace of the module. Optional.
     */

    /*
     * @config data-decorator="{decorator-name}"
     *
     * Example: data-decorator="bar"
     * Indicates that the module Foo should be decorated with the Bar decorator.
     * Multiple decorators should be comma-separated. Optional.
     */
    var module = this.registerModule(ctx, ctx.getAttribute('data-module'), ctx.getAttribute('data-decorator'), ctx.getAttribute('data-namespace'));

    if (module) {
      modules[module.ctx.getAttribute('data-module-id')] = module;
    }
  }.bind(this));

  this.scope.dispatch('t.register.end');

  return modules;
};

/**
 * Unregisters the modules given by the module instances.
 *
 * @method unregisterModules
 * @param {Object} modules
 *      A collection containing the modules to unregister
 */
Application.prototype.unregisterModules = function(modules) {
  modules = modules || this.modules;

  this.scope.dispatch('t.unregister.start');

  // unregister the given modules
  for (var id in modules) {
    if (this.modules.hasOwnProperty(id)) {
      if (Utils.isNode(this.modules[id].ctx)) {
        this.modules[id].ctx.removeAttribute('data-module-id');
      }
      delete this.modules[id];
    }
  }

  this.scope.dispatch('t.unregister.end');
};

/**
 * Starts (intializes) the registered modules.
 *
 * @method start
 * @param {Object} modules
 *      A collection of modules to start
 * @return {Promise}
 *      The synchronize Promise
 */
Application.prototype.start = function(modules) {
  modules = modules || this.modules;

  var promises = [];

  this.scope.dispatch('t.start');

  // start the modules
  for (var id in modules) {
    if (modules.hasOwnProperty(id)) {
      var promise = (function(id) {
        return new Promise(function(resolve, reject) {
          modules[id].start(resolve, reject);
        });
      }(id));

      promises.push(promise);
    }
  }

  // synchronize modules
  var all = Promise.all(promises);
  all.then(function() {
    this.scope.dispatch('t.sync');
  }.bind(this)).catch(function(err) {
    throw err;
  });

  return all;
};

/**
 * Stops the registered modules.
 *
 * @method stop
 * @param {Object} modules
 *      A collection of modules to stop
 */
Application.prototype.stop = function(modules) {
  modules = modules || this.modules;

  this.scope.dispatch('t.stop');

  // stop the modules
  for (var id in modules) {
    if (modules.hasOwnProperty(id)) {
      modules[id].stop();
    }
  }
};

/**
 * Registers a module.
 *
 * @method registerModule
 * @param {Node} ctx
 *      The context node
 * @param {String} mod
 *      The module name. It must match the class name of the module
 * @param {Array} decorators
 *      A list of decorator names. Each entry must match a class name of a decorator
 * @param {String} namespace
 *      The module namespace
 * @return {Module}
 *      The reference to the registered module
 */
Application.prototype.registerModule = function(ctx, mod, decorators, namespace) {
  var modules = this.modules;

  // validate params
  if (ctx.hasAttribute('data-module-id')) {
    return null; // prevent from registering twice
  }

  mod = Utils.capitalize(Utils.camelize(mod));

  if (Utils.isString(decorators)) {
    if (window[decorators]) {
      // decorators param is the namespace
      namespace = window[decorators];
      decorators = null;
    } else {
      // convert string to array
      decorators = decorators.split(',');
    }
  } else if (!Array.isArray(decorators) && Utils.isObject(decorators)) {
    // decorators is the namespace object
    namespace = decorators;
    decorators = null;
  }

  decorators = decorators || [];
  decorators = decorators.map(function(decorator) {
    return Utils.capitalize(Utils.camelize(decorator.trim()));
  });

  namespace = namespace || this.config.namespace;

  if (namespace[mod]) {
    // assign the module a unique id
    var id = this.id++;
    ctx.setAttribute('data-module-id', id);

    // instantiate module
    modules[id] = new namespace[mod](ctx, this.scope);

    // decorate it
    for (var i = 0, len = decorators.length; i < len; i++) {
      var decorator = decorators[i];

      if (namespace[mod][decorator]) {
        namespace[mod][decorator](modules[id]);
      }
    }

    return modules[id];
  }

  this.scope.dispatch('t.missing', ctx, mod, decorators, namespace);

  return null;
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
Application.prototype.getModuleById = function(id) {
  if (this.modules[id]) {
    return this.modules[id];
  } else {
    throw Error('The module with the id ' + id +
      ' does not exist');
  }
};

export default Application;
