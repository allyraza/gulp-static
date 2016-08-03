/* global jQuery */
import TT from './../lib/TT';

TT.Module.ControlCheckbox = TT.Component({
  start: function(resolve) {
    var ctx = jQuery(this.ctx);
    this.input = ctx.find('.control-checkbox__input');
    
    // register events
    this.input.on('click', this.onClick.bind(this));

    resolve();
  },

  onClick: function() {
    var name = this.input.attr("name");
    if (!this.scope.activeElements[name]) {
      this.scope.activeElements[name] = true;
    }
  }
});
