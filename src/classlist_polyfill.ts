(function () {
  if (
    typeof window.Element === "undefined" ||
    "classList" in document.documentElement
  ) {
    return;
  }

  var prototype = Array.prototype,
    push = prototype.push,
    splice = prototype.splice,
    join = prototype.join;

  class DOMTokenList {
    el: Element;
    [index: number]: string;
    length: number;

    constructor(el: Element) {
      this.el = el;
      // The className needs to be trimmed and split on whitespace
      // to retrieve a list of classes.
      let classes = el.className.replace(/^\s+|\s+$/g, "").split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        push.call(this, classes[i]);
      }
      this.length = classes.length;
    }

    add(token) {
      if (this.contains(token)) return;
      push.call(this, token);
      this.length += 1;
      this.el.className = this.toString();
    }

    contains(token) {
      return this.el.className.indexOf(token) != -1;
    }

    item(index) {
      return this[index] || null;
    }

    remove(token) {
      if (!this.contains(token)) return;
      for (var i = 0; i < this.length; i++) {
        if (this[i] == token) break;
      }
      splice.call(this, i, 1);
      this.length -= 1;
      this.el.className = this.toString();
    }

    toString() {
      return join.call(this, " ");
    }

    toggle(token) {
      let containsToken: boolean = this.contains(token);
      if (!containsToken) {
        this.add(token);
      } else {
        this.remove(token);
      }

      return containsToken;
    }
  }

  window.DOMTokenList = DOMTokenList as any;

  function defineElementGetter(obj, prop, getter) {
    if (Object.defineProperty) {
      Object.defineProperty(obj, prop, {
        get: getter,
      });
    } else {
      obj.__defineGetter__(prop, getter);
    }
  }

  defineElementGetter(HTMLElement.prototype, "classList", function () {
    return new DOMTokenList(this);
  });
})();
