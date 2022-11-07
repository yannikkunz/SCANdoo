
function onScanSuccess(qrCodeMessage) {
  document.getElementById("ticket-hash__input").value = qrCodeMessage.slice(-8);
}
function onScanError(errorMessage) {
  //handle scan error
}

function openQrScanner() {
  if (document.getElementById("qr-checkbox").checked) {
    html5QrcodeScanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });
    html5QrcodeScanner.render(onScanSuccess, onScanError);
  } else {
    html5QrcodeScanner.clear();
  }
}

function docReady(fn) {
  // see if DOM is already available
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function getTicketInfo(ticketHash) {
  if (ticketHash.length == 8) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var obj = JSON.parse(this.responseText);
        if (obj.status === "success") {
          showTicketInfo(obj);
        } else {
          showFailedTicketInfo(obj);
        }
      }
    };
    xmlhttp.open(
      "GET",
      "https://hook.doo.integromat.celonis.com/un70t4or2i0yncuipi5qj6g80av1uej1?type=getinfo&hash=" +
        ticketHash,
      true
    );
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
  } else {
    document.getElementById("name").innerHTML = "";
    document.getElementById("event").innerHTML = "";
    document.getElementById("ticketCategory").innerHTML = "";

    document.getElementById("printBadge").disabled = true;
    document.getElementById("checkinBtn").disabled = false;
  }
}

function showTicketInfo(obj) {
  document.getElementById("check-in__info-text").classList.remove("red-text");
  document.getElementById("name").innerHTML =
    obj.firstName + " " + obj.lastName;
  document.getElementById("event").innerHTML = obj.event;
  document.getElementById("ticketCategory").innerHTML = obj.ticketCategory;
  document.getElementById("booking-id").innerHTML = obj.bookingNumber;
  document.getElementById("entries").innerHTML = obj.entries.replace(
    /\s/g,
    "<br>"
  );
  document.getElementById("checkmark").src =
    "https://doo-product-consulting-uploads.s3.eu-central-1.amazonaws.com/Scandoo/logo-blue-transparent.png";
  if (obj.checkinAvailable === "true") {
    document.getElementById("checkinBtn").disabled = false;
  } else {
    document.getElementById("checkinBtn").disabled = true;
    document.getElementById("check-in__info-text").innerHTML =
      "Check-in nicht mehr verfügbar";
    document.getElementById("check-in__info-text").classList.add("red-text");
  }

  if (obj.badgeURL.includes("http")) {
    document.getElementById("checkinBtn").disabled = true;
    document.getElementById("printBadge").disabled = false;
    document.getElementById("badge-url").setAttribute("href", obj.badgeURL);
  }
}

function showFailedTicketInfo(obj) {
  document.getElementById("name").innerHTML = "Teilnehmer nicht gefunden";
  document.getElementById("name").classList.add("red-text");
}

function checkInTicket() {
  var ticketHash = document.getElementById("ticket-hash__input").value;
  if (ticketHash.length == 8) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var obj = JSON.parse(this.responseText);
        if (obj.status === "checkin successful") {
          processSuccessfulCheckIn(obj);
        } else {
          processFailedCheckIn(obj);
        }
      }
    };
    xmlhttp.open(
      "GET",
      "https://hook.doo.integromat.celonis.com/un70t4or2i0yncuipi5qj6g80av1uej1?type=checkin&hash=" +
        ticketHash,
      true
    );
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
  }
}

function processSuccessfulCheckIn(obj) {
  document.getElementById("checkmark").src =
    "https://doo-product-consulting-uploads.s3.eu-central-1.amazonaws.com/Scandoo/checked.png";
  document.getElementById("checkinBtn").disabled = true;
}

function processFailedCheckIn(obj) {
  document.getElementById("checkmark").src =
    "https://doo-product-consulting-uploads.s3.eu-central-1.amazonaws.com/Scandoo/cancel.png";
}

function printBadge() {
  var url = document.getElementById("badge-url").getAttribute("href");
  var iframe = this._printIframe;
  if (!this._printIframe) {
    iframe = this._printIframe = document.createElement("iframe");
    document.body.appendChild(iframe);

    iframe.style.display = "none";
    iframe.onload = function () {
      setTimeout(function () {
        iframe.focus();
        iframe.contentWindow.print();
      }, 1);
    };
  }

  iframe.src = url;
}
