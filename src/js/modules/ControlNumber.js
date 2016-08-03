/* global jQuery */
import TT from './../lib/TT';

TT.Module.ControlNumber = TT.Component({
  start: function(resolve) {
    var ctx = jQuery(this.ctx);
    this.input = ctx.find('.control-number__input');

    // register events
    ctx.find('.control-number__incr').on('click', this.onIncr.bind(this));
    ctx.find('.control-number__decr').on('click', this.onDecr.bind(this));

    resolve();
  },

  onIncr: function() {
    var value = parseInt(this.input.val(), 10);
    this.scope.counter += 1;
    this.input.val(value + 1);
  },

  onDecr: function() {
    var value = parseInt(this.input.val(), 10);
    console.log(this.scope.counter);
    console.log(this.scope.activeElements);
    this.input.val(value - 1);
  }
});
