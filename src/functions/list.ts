Array.prototype.removeItemOnce = function(value) {
  var index = this.indexOf(value);
  if (index > -1) {
    this.splice(index, 1);
  }
  return this;
}

Array.prototype.removeItemAll = function(value) {
  var i = 0;
  while (i < this.length) {
    if (this[i] === value) {
      this.splice(i, 1);
    } else {
      ++i;
    }
  }
  return this;
}
