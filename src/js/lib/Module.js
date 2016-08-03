/* eslint-disable */
import EventEmitter from './EventEmitter';

/**
 * Base class for the different modules.
 *
 * @constructor
 * @param {Node} ctx
 *      The context node
 * @param {Scope} scope
 *      The scope to get the resources from
 */
/* global EventEmitter */
function Module(ctx, scope) {
  /**
   * Contains the context node.
   *
   * @property ctx
   * @type Node
   */
  this.ctx = ctx;

  /**
   * The scope to get the resources from.
   *
   * @property scope
   * @type Scope
   */
  this.scope = scope;

  /**
   * The emitter.
   *
   * @property events
   * @type EventEmitter
   */
  this.events = new EventEmitter(scope);
}

/**
 * Template method to start the module.
 *
 * @method start
 * @param {Function} resolve
 *      The resolve promise function
 * @param {Function} reject
 *      The reject promise function
 */
/*jshint unused: true */
Module.prototype.start = function(resolve) {
  resolve();
};

/**
 * Template method to stop the module.
 *
 * @method stop
 */
Module.prototype.stop = function() {
  this.events.off().disconnect();
};

export default Module;
