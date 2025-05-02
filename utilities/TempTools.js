import { isPointNear } from "./utils.js"; // Assuming you have a utility function for point proximity
// Placeholder for the tools object
export default class TempTools {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.currentTool = null;
    this.items = []; // Array to store drawn items

    // Store bound event handlers for easy removal
    this.boundMouseDown = null;
    this.boundMouseMove = null;
    this.boundMouseUp = null;
  }

  setTool(tool) {
    // Remove event listeners from previous tool
    if (this.boundMouseDown) {
      this.canvas.removeEventListener("mousedown", this.boundMouseDown);
      this.canvas.removeEventListener("mousemove", this.boundMouseMove);
      this.canvas.removeEventListener("mouseup", this.boundMouseUp);

      // Clear bound handlers
      this.boundMouseDown = null;
      this.boundMouseMove = null;
      this.boundMouseUp = null;
    }

    this.currentTool = tool;

    // Add event listeners for new tool
    if (tool) {
      // Create bound versions of event handlers
      this.boundMouseDown = tool.onMouseDown.bind(tool);
      this.boundMouseMove = tool.onMouseMove.bind(tool);
      this.boundMouseUp = tool.onMouseUp.bind(tool);

      // Attach event listeners
      this.canvas.addEventListener("mousedown", this.boundMouseDown);
      this.canvas.addEventListener("mousemove", this.boundMouseMove);
      this.canvas.addEventListener("mouseup", this.boundMouseUp);
    }
  }

  clear() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addTool(tool) {
    // Make a clean copy of the tool without event listeners before adding to items
    // This way the items array only has tools for display, not interaction
    this.items.push(tool);
  }

  drawAll() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.items.forEach((item) => {
      if (item.isDrawing) return; // Skip drawing if the item is still in drawing mode
      item.redraw?.();
    });
  }

  getSnappingPoint(coordinate) {
    for (const item of this.items) {
      switch (true) {
        case item.customType === "arc3point":
          if (isPointNear({ x: item.startX, y: item.startY }, coordinate)) {
            return { x: item.startX, y: item.startY };
          }
          if (
            item.secondX &&
            item.secondY &&
            isPointNear({ x: item.secondX, y: item.secondY }, coordinate)
          ) {
            return { x: item.secondX, y: item.secondY };
          }
          break;
        default:
          break;
      }
    }
    return null;
  }
}
