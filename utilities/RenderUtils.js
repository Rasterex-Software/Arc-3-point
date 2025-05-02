class RenderUtils {
  static renderPoints = (ctx, arc, color) => {
    if (arc.startX && arc.startY) {
      RenderUtils.renderPoint(ctx, { x: arc.startX, y: arc.startY }, color);
    }
    if (arc.secondX && arc.secondY) {
      RenderUtils.renderPoint(ctx, { x: arc.secondX, y: arc.secondY }, color);
    }
    if (arc.endX && arc.endY) {
      RenderUtils.renderPoint(ctx, { x: arc.endX, y: arc.endY }, color);
    }
  };
  static renderPoint = (ctx, point, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  static drawInitialArc = (ctx, p1, p2, radiusFactor = 1.2, color) => {
    ctx.save();
    const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (distance === 0) {
      ctx.restore();
      return;
    }
    const radius = radiusFactor * distance;
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const nx = -dy / len;
    const ny = dx / len;

    const chordLength = distance;
    const h = Math.sqrt(
      radius * radius - (chordLength / 2) * (chordLength / 2)
    );
    const centerX = midX + nx * h;
    const centerY = midY + ny * h;

    const startAngle = Math.atan2(p1.y - centerY, p1.x - centerX);
    const endAngle = Math.atan2(p2.y - centerY, p2.x - centerX);

    const normalizeAngle = (angle) => (angle < 0 ? angle + 2 * Math.PI : angle);
    const a1 = normalizeAngle(startAngle);
    const a2 = normalizeAngle(endAngle);
    const diff = (a2 - a1 + 2 * Math.PI) % (2 * Math.PI);
    const anticlockwise = diff > Math.PI;

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.arc(centerX, centerY, radius, a1, a2, anticlockwise);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    this.drawLabelWithBox(ctx, `R${radius.toFixed(3)}`, midX, midY);
    ctx.restore();
  };

  static calculateCircumCircle = (p1, p2, p3) => {
    const x1 = p1.x,
      y1 = p1.y;
    const x2 = p2.x,
      y2 = p2.y;
    const x3 = p3.x,
      y3 = p3.y;

    const A = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;
    if (Math.abs(A) < 1e-10) {
      const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const radius = 1.2 * distance;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      const nx = -dy / len;
      const ny = dx / len;

      // Midpoint of the segment
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;

      const h = Math.sqrt(radius * radius - (distance / 2) * (distance / 2));

      const centerX = midX + nx * h;
      const centerY = midY + ny * h;
      return { center: { x: centerX, y: centerY }, radius };
    }

    const B =
      (x1 * x1 + y1 * y1) * (y3 - y2) +
      (x2 * x2 + y2 * y2) * (y1 - y3) +
      (x3 * x3 + y3 * y3) * (y2 - y1);
    const C =
      (x1 * x1 + y1 * y1) * (x2 - x3) +
      (x2 * x2 + y2 * y2) * (x3 - x1) +
      (x3 * x3 + y3 * y3) * (x1 - x2);
    const D =
      (x1 * x1 + y1 * y1) * (x3 * y2 - x2 * y3) +
      (x2 * x2 + y2 * y2) * (x1 * y3 - x3 * y1) +
      (x3 * x3 + y3 * y3) * (x2 * y1 - x1 * y2);

    const centerX = -B / (2 * A);
    const centerY = -C / (2 * A);
    const radius = Math.sqrt((B * B + C * C - 4 * A * D) / (4 * A * A));

    return { center: { x: centerX, y: centerY }, radius };
  };

  static drawArc = (ctx, p1, p2, p3, color) => {
    ctx.save();
    const circle = this.calculateCircumCircle(p1, p2, p3);
    if (!circle) {
      ctx.restore();
      return;
    }
    const { center, radius } = circle;
    const startAngle = Math.atan2(p1.y - center.y, p1.x - center.x);
    const endAngle = Math.atan2(p2.y - center.y, p2.x - center.x);
    const midAngle = Math.atan2(p3.y - center.y, p3.x - center.x);

    const normalizeAngle = (angle) => (angle < 0 ? angle + 2 * Math.PI : angle);

    const a1 = normalizeAngle(startAngle);
    const a2 = normalizeAngle(endAngle);
    const a3 = normalizeAngle(midAngle);

    const diff12 = (a2 - a1 + 2 * Math.PI) % (2 * Math.PI);
    const diff13 = (a3 - a1 + 2 * Math.PI) % (2 * Math.PI);
    const diff32 = (a2 - a3 + 2 * Math.PI) % (2 * Math.PI);

    let anticlockwise = false;
    if (diff12 < Math.PI) {
      if (diff13 > diff12 || diff32 > diff12) {
        anticlockwise = true;
      }
    } else {
      if (diff13 < diff12 && diff32 < diff12) {
        anticlockwise = false;
      } else {
        anticlockwise = true;
      }
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.arc(center.x, center.y, radius, a1, a2, anticlockwise);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(center.x, center.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(p2.x, p2.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    this.drawLabelWithBox(ctx, `R${radius.toFixed(3)}`, midX, midY);
    ctx.restore();
  };

  static drawLabelWithBox = (ctx, text, x, y) => {
    ctx.font = `${16}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = 16;
    const padding = 4;
    ctx.fillStyle = "white";
    ctx.strokeStyle = "rgb(141, 147, 153)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(
      x - textWidth / 2 - padding,
      y - textHeight / 2 - padding,
      textWidth + 2 * padding,
      textHeight + 2 * padding
    );
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgb(141, 147, 153)";
    ctx.fillText(text, x, y);
  };

  static drawHollowCircle = (ctx, center, radius, color) => {
    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(center.x, center.y, 3, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
  };
}

export default RenderUtils;
