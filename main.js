import TempTools from "./utilities/TempTools.js";
import { getMousePos, resizeCanvas } from "./utilities/utils.js";
import Tool from "./utilities/Tool.js";
import RenderUtils from "./utilities/RenderUtils.js";

// Set up the canvas context
const canvas = document.getElementById("canvas");
const setupCanvas = () => {
  // Initialize canvas size
  resizeCanvas(canvas);
  // Add resize listener to adjust canvas when window size changes
  window.addEventListener("resize", resizeCanvas);
};
setupCanvas();

// Initialize the tools object
// This object will manage the current tool and the items drawn on the canvas
const tools = new TempTools(canvas);

// Add new Arc Tool button
document.getElementById("arcButton").addEventListener("click", () => {
  if (tools.currentTool) {
    // TODO: Add proper prompt later instead of alert
    alert("Please finish the current drawing before selecting a new tool.");
    return;
  }
  const arcTool = new ArcTool3Point(canvas); // Create a new instance of the arc tool
  tools.setTool(arcTool); // Set the arc tool as the current tool
});

class ArcTool3Point extends Tool {
  constructor(canvas) {
    super(canvas);
    this.startX = null;
    this.startY = null;
    this.secondX = null;
    this.secondY = null;
    this.endX = null;
    this.endY = null;
    this.isDrawing = false; // Flag to track if the tool is in drawing mode
    this.customType = "arc3point"; // Custom type for this tool
  }

  onMouseDown(event) {
    event.preventDefault();
    event.stopPropagation();

    const mousePos = getMousePos(this.canvas, event); // Get the mouse position
    // Check for snapping points
    const snapPoint = tools.getSnappingPoint(mousePos);
    if (snapPoint) {
      RenderUtils.drawHollowCircle(
        this.context,
        { x: snapPoint.x, y: snapPoint.y },
        5,
        "rgba(255, 165, 0, 0.7)"
      );
    }
    const adjustedPos = snapPoint || mousePos;

    // First click: set the start point
    if (!this.isDrawing) {
      this.startX = adjustedPos.x;
      this.startY = adjustedPos.y;
      this.isDrawing = true;
      return;
    }

    // Second click: set the second point
    if (this.isDrawing && this.secondX === null) {
      this.secondX = adjustedPos.x;
      this.secondY = adjustedPos.y;
      return;
    }

    // Third click: set the end point and draw the arc
    if (this.isDrawing && this.secondX !== null) {
      this.endX = adjustedPos.x;
      this.endY = adjustedPos.y;

      this.isDrawing = false; // Reset the drawing state
      tools.addTool(this); // Add the finished tool to the tools array
      tools.drawAll();
      tools.setTool(null); // Reset the current tool to null
    }
  }

  onMouseMove(event) {
    const mousePos = getMousePos(this.canvas, event);
    const snapPoint = tools.getSnappingPoint(mousePos);
    tools.drawAll();
    if (snapPoint) {
      RenderUtils.drawHollowCircle(
        this.context,
        { x: snapPoint.x, y: snapPoint.y },
        5,
        "rgba(255, 165, 0, 0.7)"
      );
    }
    const pointColor = "rgb(109, 166, 209)";
    if (this.startX === null) {
      RenderUtils.renderPoint(this.context, mousePos, pointColor);
    }
    if (!this.isDrawing) return; // Only draw if in drawing mode

    const adjustedPos = snapPoint || mousePos;

    // Render the current points
    RenderUtils.renderPoints(this.context, this, pointColor);

    // Draw the appropriate preview based on how many points have been placed
    if (this.startX !== null && this.secondX === null) {
      // First point placed, drawing line/arc to mouse position
      RenderUtils.drawInitialArc(
        this.context,
        { x: this.startX, y: this.startY },
        adjustedPos,
        1.2,
        "rgb(109, 166, 209)"
      );
    } else if (this.startX !== null && this.secondX !== null) {
      // Two points placed, drawing arc through all three points
      RenderUtils.drawArc(
        this.context,
        { x: this.startX, y: this.startY },
        { x: this.secondX, y: this.secondY },
        adjustedPos,
        "rgb(109, 166, 209)"
      );
    }
  }

  onMouseUp(event) {
    // This method is intentionally empty but we keep it for potential future use
  }

  redraw() {
    if (!(this.startX && this.secondX && this.endX)) return; // Check if we have all three points

    // Draw the arc using the three points
    RenderUtils.drawArc(
      this.context,
      { x: this.startX, y: this.startY },
      { x: this.secondX, y: this.secondY },
      { x: this.endX, y: this.endY },
      "rgb(83, 26, 217)"
    );
  }
}
