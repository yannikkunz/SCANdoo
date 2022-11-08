Chart.pluginService.register({
  beforeDraw: function (chart) {
    if (chart.config.options.elements.center) {
      // Get ctx from string
      var ctx = chart.chart.ctx;

      // Get options from the center object in options
      var centerConfig = chart.config.options.elements.center;
      var fontStyle = centerConfig.fontStyle || "Arial";
      var txt = centerConfig.text;
      var color = centerConfig.color || "#000";
      var maxFontSize = centerConfig.maxFontSize || 75;
      var sidePadding = centerConfig.sidePadding || 20;
      var sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2);
      // Start with a base font of 30px
      ctx.font = "30px " + fontStyle;

      // Get the width of the string and also the width of the element minus 10 to give it 5px side padding
      var stringWidth = ctx.measureText(txt).width;
      var elementWidth = chart.innerRadius * 2 - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      var widthRatio = elementWidth / stringWidth;
      var newFontSize = Math.floor(30 * widthRatio);
      var elementHeight = chart.innerRadius * 2;

      // Pick a new font size so it will not be larger than the height of label.
      var fontSizeToUse = Math.min(newFontSize, elementHeight, maxFontSize);
      var minFontSize = centerConfig.minFontSize;
      var lineHeight = centerConfig.lineHeight || 25;
      var wrapText = false;

      if (minFontSize === undefined) {
        minFontSize = 20;
      }

      if (minFontSize && fontSizeToUse < minFontSize) {
        fontSizeToUse = minFontSize;
        wrapText = true;
      }

      // Set font settings to draw it correctly.
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      var centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
      var centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
      ctx.font = fontSizeToUse + "px " + fontStyle;
      ctx.fillStyle = color;

      if (!wrapText) {
        ctx.fillText(txt, centerX, centerY);
        return;
      }

      var words = txt.split(" ");
      var line = "";
      var lines = [];

      // Break words up into multiple lines if necessary
      for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + " ";
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > elementWidth && n > 0) {
          lines.push(line);
          line = words[n] + " ";
        } else {
          line = testLine;
        }
      }

      // Move the center up depending on line height and number of lines
      centerY -= (lines.length / 2) * lineHeight;

      for (var n = 0; n < lines.length; n++) {
        ctx.fillText(lines[n], centerX, centerY);
        centerY += lineHeight;
      }
      //Draw text in center
      ctx.fillText(line, centerX, centerY);
    }
  },
});

var xValues = ["nicht eingecheckt", "eingecheckt"];
var yValues = [0, 0];
var barColors = ["#D3D3D3", "#5ad0bf"];
var eventID = 117922;

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function () {
  if (this.readyState == 4 && this.status == 200) {
    var obj = JSON.parse(this.responseText);
    yValues[0] = Number(obj.allAttendees) - Number(obj.checkedInAttendees);
    yValues[1] = Number(obj.checkedInAttendees);
    document.getElementById("checked-in-attendees").innerHTML = obj.checkedInAttendees;
    document.getElementById("all-attendees").innerHTML = obj.allAttendees;
  }
};

xmlhttp.open(
  "GET",
  "https://hook.doo.integromat.celonis.com/qz6prrg36wf78qbwvuo7bqhpsrd0v1wt?eid=" +
    eventID,
  false
);
xmlhttp.setRequestHeader("Content-type", "application/json");
xmlhttp.send();

new Chart("checked-in-doughnut", {
  type: "doughnut",
  data: {
    labels: xValues,
    datasets: [
      {
        backgroundColor: barColors,
        data: yValues,
      },
    ],
  },
  options: {
    title: {
      display: false,
      text: "Ticket Check-Ins",
    },
    legend: {
      display: false,
    },
    cutoutPercentage: 82,
    elements: {
      center: {
        text:
          Math.round((yValues[1] / (yValues[0] + yValues[1])) * 100) +
          "% eingecheckt",
        color: "#434652", // Default is #000000
        fontStyle: "Open Sans", // Default is Arial
        sidePadding: 20, // Default is 20 (as a percentage)
        minFontSize: 18, // Default is 20 (in px), set to false and text will not wrap.
        lineHeight: 25, // Default is 25 (in px), used for when text wraps
      },
    },
  },
});
