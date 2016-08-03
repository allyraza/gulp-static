/* eslint-disable */
import Module from './Module';

/**
 * Utility functions.
 */
export default Utils = {
  /**
   * Capitalizes the first letter of the given string.
   *
   * @method capitalize
   * @param {String} str
   *      The original string
   * @return {String}
   *      The capitalized string
   */
  capitalize: function(str) {
    return str.substr(0, 1).toUpperCase().concat(str.substr(1));
  },

  /**
   * Camelizes the given string.
   *
   * @method camelize
   * @param {String} str
   *      The original string
   * @return {String}
   *      The camelized string
   */
  camelize: function(str) {
    return str.replace(/(\-[A-Za-z])/g, function($1) {
      return $1.toUpperCase().replace('-', '');
    });
  },

  /**
   * Check whether the given object is a string.
   *
   * @method isString
   * @param {Object} obj
   *      The object to check
   * @return {Boolean}
   */
  isString: function(obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
  },

  /**
   * Check whether the given param is an object.
   *
   * @method isObject
   * @param {Object} obj
   *      The object to check
   * @return {Boolean}
   */
  isObject: function(obj) {
    var type = typeof obj;
    return !!obj && (type === 'object' || type === 'function') && !Array.isArray(obj);
  },

  /**
   * Check whether the given param is a function.
   *
   * @method isFunction
   * @param {Object} obj
   *      The object to check
   * @return {Boolean}
   */
  isFunction: function(obj) {
    var type = typeof obj;
    return !!obj && type === 'function';
  },

  /**
   * Check whether the given param is a valid node.
   *
   * @method isNode
   * @param {Node} node
   *      The node to check
   * @return {Boolean}
   */
  isNode: function(node) {
    if (!node || !node.nodeType) {
      return false;
    }

    return node.nodeType === 1 || node.nodeType === 9;
  },

  /**
   * Check whether the element matches the given selector.
   *
   * @method matches
   * @param {Element} el
   *      The element to check
   * @param {String} selector
   *        The selector to check against
   * @return {Boolean}
   */
  matches: function(el, selector) {
    var p = Element.prototype;
    var f = p.matches || p.webkitMatchesSelector || p.mozMatchesSelector || p.msMatchesSelector || function(s) {
      return [].slice.call(document.querySelectorAll(s)).indexOf(this) !== -1;
    };
    return f.call(el, selector);
  },

  /**
   * Extends an object with the given objects.
   *
   * @method extend
   * @param {Object} obj
   *      The object to extend
   * @param {Object} ...
   * @return {Object} the extended object
   */
  extend: function(obj) {
    if (!Utils.isObject(obj)) {
      return obj;
    }
    var source, prop;
    for (var i = 1, length = arguments.length; i < length; i++) {
      source = arguments[i];

      for (prop in source) {
        if (source.hasOwnProperty(prop)) {
          obj[prop] = source[prop];
        }
      }
    }
    return obj;
  },

  /**
   * Get the element from a given node.
   *
   * @method getElement
   * @param {Node} node
   *      The node to check
   * @return {Element}
   */
  getElement: function(node) {
    if (!this.isNode(node)) {
      return null;
    }

    if (node.nodeType === 9 && node.documentElement) {
      return node.documentElement;
    } else {
      return node;
    }
  },

  /**
   * Get the module nodes.
   *
   * @method getModuleNodes
   * @param {Node} ctx
   *      The ctx to check
   * @return {Array}
   */
  getModuleNodes: function(ctx) {
    var nodes = [].slice.call(ctx.querySelectorAll('[data-module]'));

    // check context itself
    if (this.matches(ctx, '[data-module]')) {
      nodes.unshift(ctx);
    }

    return nodes;
  },

  /**
   * Creates a module class given a class specification.
   *
   * @method Component
   * @param {object} spec Class specification.
   * @return {function} Module constructor function
   */
  Component: function(spec) {
    // validate params
    if (!spec || !Utils.isObject(spec)) {
      throw Error('Your module spec is not an object. Usage: TT.Component({ … })');
    }

    var Constructor = function(ctx, sandbox) {
      Module.call(this, ctx, sandbox);
    };

    var proto = Constructor.prototype = Object.create(Module.prototype);
    proto.constructor = Constructor;

    // apply statics
    if (spec.hasOwnProperty('statics')) {
      Utils.extend(Constructor, spec.statics);
    }

    var reservedKeys = [
      'statics'
    ];

    // mixin spec properties to module prototype
    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      // check for reserved keys
      if (reservedKeys.indexOf(name) !== -1) {
        continue;
      }

      var property = spec[name];
      proto[name] = property;
    }

    return Constructor;
  },

  /**
   * Creates a decorator given a decorator specification.
   *
   * @method Decorator
   * @param {object} spec Decorator specification.
   * @return {function} Decorator function
   */
  Decorator: function(spec) {
    // validate params
    if (!spec || !Utils.isObject(spec)) {
      throw Error('Your decorator spec is not an object. Usage: TT.Decorator({ … })');
    }

    return function(orig) {
      var parent = {},
        name;

      // save references to original super properties
      for (name in orig) {
        if (Utils.isFunction(orig[name])) {
          parent[name] = orig[name].bind(orig);
        }
      }

      // override original properties and provide _parent property
      for (name in spec) {
        if (spec.hasOwnProperty(name)) {
          if (Utils.isFunction(spec[name])) {
            orig[name] = (function(name, fn) {
              return function() {
                this._parent = parent;
                return fn.apply(this, arguments);
              };
            }(name, spec[name]));
          } else {
            // simple property
            orig[name] = spec[name];
          }
        }
      }
    };
  },

  cache: {},

  tmpl: function(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      Utils.cache[str] = Utils.cache[str] ||
      Utils.tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      new Function("obj",
        "var p=[],print=function(){p.push.apply(p,arguments);};" +

        // Introduce the data as local variables using with(){}
        "with(obj){p.push('" +

        // Convert the template into pure JavaScript
        str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'") + "');}return p.join('');");

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  }
};
