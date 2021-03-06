// colorPickr bindings //

/*jshint
  jquery:true
*/
/*global Shiny,Pickr */

// each picker instance will be stored by key/pair
Shiny.InputBinding.prototype.store = [];
Shiny.InputBinding.prototype.updateStore = function(el, instance) {
  this.store[el.id] = instance;
};

var pickrColorBinding = new Shiny.InputBinding();
$.extend(pickrColorBinding, {
  find: function(scope) {
    return $(scope).find(".pickr-color");
  },
  getId: function(el) {
    return $(el).attr("id");
  },
  getValue: function(el) {
    return this.store[el.id]
      .getColor()
      .toHEXA()
      .toString(0);
  },
  setValue: function(el, value) {
    this.store[el.id].setColor(value);
  },
  subscribe: function(el, callback) {
    this.store[el.id].on("init", function(color, instance) {
      callback();
    });
    var event = this.store[el.id].options.update;
    var hideOnSave = this.store[el.id].options.hideOnSave;
    if (event == "change") {
      this.store[el.id].on(event, function(color, source, instance) {
        callback();
      });
    } else {
      this.store[el.id].on(event, function(color, instance) {
        if ((hideOnSave === true) & (event != "changestop")) {
          instance.hide();
        }
        callback();
      });
    }
  },
  unsubscribe: function(el) {
    $(el).off(".pickrColorBinding");
  },
  receiveMessage: function(el, data) {
    if (data.hasOwnProperty("value")) {
      this.store[el.id].setColor(data.value);
    }
    if (data.hasOwnProperty("action")) {
      if (data.action == "enable") {
        this.store[el.id].enable();
      }
      if (data.action == "disable") {
        this.store[el.id].disable();
      }
      if (data.action == "show") {
        this.store[el.id].show();
      }
      if (data.action == "hide") {
        this.store[el.id].hide();
      }
    }
  },
  getState: function(el) {},
  initialize: function initialize(el) {
    var config = $(el)
      .parent()
      .find('script[data-for="' + el.id + '"]');
    config = JSON.parse(config.html());
    var options = config.options;

    options.el = el;
    options.appClass = "pickr-color";
    var pickr = new Pickr(options);
    var root = pickr.getRoot();
    if (config.hasOwnProperty("width")) {
      root.app.style.width = config.width;
    }
    if (options.useAsButton === false) {
      root.button.parentNode.style.display = "inline";
      root.button.id = el.id;
      root.button.classList.add("pickr-color");
      if (config.inline) {
        root.button.style.display = "none";
      }
    } else {
      el.value = options.default;
      el.style.backgroundColor = options.default;
      el.style.color = getCorrectTextColor(options.default);
      if (config.update == "changestop") {
        pickr.on(config.update, function(source, instance) {
          var color = instance.getColor();
          el.value = color.toHEXA().toString(0);
          el.style.backgroundColor = color.toHEXA().toString(0);
          el.style.color = getCorrectTextColor(color.toHEXA().toString(0));
        });
      } else {
        pickr.on(config.update, function(color) {
          el.value = color.toHEXA().toString(0);
          el.style.backgroundColor = color.toHEXA().toString(0);
          el.style.color = getCorrectTextColor(color.toHEXA().toString(0));
        });
      }
    }
    
    pickr.options.update = config.update;
    pickr.options.hideOnSave = config.hideOnSave;
    this.updateStore(el, pickr);
  }
});
Shiny.inputBindings.register(pickrColorBinding, "shinyWidgets.colorPickr");

// By David Halford : https://codepen.io/davidhalford/pen/ywEva
function getCorrectTextColor(hex) {
  var threshold = 130;

  function hexToR(h) {
    return parseInt(cutHex(h).substring(0, 2), 16);
  }
  function hexToG(h) {
    return parseInt(cutHex(h).substring(2, 4), 16);
  }
  function hexToB(h) {
    return parseInt(cutHex(h).substring(4, 6), 16);
  }
  function cutHex(h) {
    return h.charAt(0) == "#" ? h.substring(1, 7) : h;
  }

  var hRed = hexToR(hex);
  var hGreen = hexToG(hex);
  var hBlue = hexToB(hex);

  var cBrightness = (hRed * 299 + hGreen * 587 + hBlue * 114) / 1000;
  if (cBrightness > threshold) {
    return "#000000";
  } else {
    return "#ffffff";
  }
}

