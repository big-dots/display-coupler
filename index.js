"use strict";

var Macros = {
  'programmable': require('macros/lib/programmable'),
  'twinkle': require('macros/lib/twinkle'),
  'solid-color': require('macros/lib/solid-color'),
  'unsupported': require('macros/lib/unsupported'),
  'marquee': require('macros/lib/marquee'),
  'text': require('macros/lib/text')
};

class DisplayCoupler {
  constructor(db) {
    this.db = db;
  }

  connect(displayKey, callbacks) {
    this.db.ref(`displays/${displayKey}/`).on('value', (snapshot) => {
      var displayData = snapshot.val(),
          options = {
            config: displayData.macroConfig || {},
            dimensions: {
              width: displayData.width,
              height: displayData.height
            },
            db: this.db,
            callbacks: {
              onPixelChange: (y, x, hex) => {
                callbacks.onPixelChange(y, x, hex, displayData);
              }
            }
          };

      if(displayData.macro === "programmable") {
        options.config.matrix = displayData.matrix;
      }

      if(this.activateMacro) {
        this.activateMacro.stop();
      }

      var Macro = Macros[displayData.macro] || Macros.unsupported;

      this.activateMacro = new Macro(options);

      this.activateMacro.start();
    });
  }
}

module.exports = DisplayCoupler;
