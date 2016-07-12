if (!Array.prototype.includes) {
  Array.prototype.includes = function(searchElement, fromIndex) {
      return Array.prototype.indexOf.call(this, searchElement, fromIndex) !== -1;
  };
}
