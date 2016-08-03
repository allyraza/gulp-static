/* global jQuery */
import TT from './lib/TT';
import './modules/ControlNumber';
import './modules/ControlCheckbox';


var app = new TT.Application({
  data: {
    activeElements: {},
    counter: 0
  }
});
app.registerModules();
app.start();


/* jQuery stuff */
jQuery(document).ready(function() {
  jQuery('#myModal').modal({ show: true });

  /* Confirmation modal */
  jQuery('.js-select-template').on('change', function() {
    jQuery('#modal-confirm').modal('show');
  });
  
  // confirmed!
  jQuery('.js-confirm').on('click', function() {});
});