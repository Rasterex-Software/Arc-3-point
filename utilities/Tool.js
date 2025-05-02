let ids = 0; // Global variable to keep track of the tool IDs
export default class Tool {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.id = ids++;
  }
}
