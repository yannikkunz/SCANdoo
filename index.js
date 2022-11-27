// QR Code Scanner
function onScanSuccess(qrCodeMessage) {
  // Get last 8 chars of the scanned input so we can scan ticket hashs & checkin links
  processTicketHash("getInfo", qrCodeMessage.slice(-8));
}

function onScanError(errorMessage) {
  //handle scan error
}


  if (localStorage.getItem("QrCodeActivated") === "true") {
    console.log("Activate QR Code Scanner");
    html5QrcodeScanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
    });
    html5QrcodeScanner.render(onScanSuccess, onScanError);
  }


// Request to make scenario to get information 
function processTicketHash(requestType, ticketHash) {
  console.log("ProcessTicketHash - Type: " + requestType +", Hash: " + ticketHash );
  if (ticketHash.length == 8) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var obj = JSON.parse(this.responseText);
        processTicketResponse(obj);
      } else if (this.readyState == 4 && this.status == 400) {
        showFailedTicketInfo();
      }
      updateStatistics();
    };
    xmlhttp.open("GET", localStorage.getItem("webhookURL") + "?type=" + requestType + "&hash=" + ticketHash, true);
    console.log("Send request: " + localStorage.getItem("webhookURL") + "?type=" + requestType + "&hash=" + ticketHash);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.send();
  } else {
    clearAttendeeData();
  }
}

// Update the current numbers of the statistics
function updateStatistics() {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText);
      localStorage.setItem("remainingTicketCount", Number(obj.allAttendees) - Number(obj.checkedInAttendees));
      localStorage.setItem("checkedInCount", Number(obj.checkedInAttendees));
      localStorage.setItem("ticketCount", Number(obj.allAttendees));
    }
  };

  xmlhttp.open(
    "GET",
    "https://hook.doo.integromat.celonis.com/qz6prrg36wf78qbwvuo7bqhpsrd0v1wt?eid=" +
    localStorage.getItem("eid"),
    false
  );
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.send();
}

function clearAttendeeData() {
  document.getElementById("checkmark").src =
    "https://doo-product-consulting-uploads.s3.eu-central-1.amazonaws.com/Scandoo/logo-blue-transparent.png";
  document.getElementById("name").innerHTML = "";
  document.getElementById("event").innerHTML = "";
  document.getElementById("ticketCategory").innerHTML = "";

  document.getElementById("printBadge").disabled = true;
  document.getElementById("checkinBtn").disabled = true;
}

function processTicketResponse(obj) {
  document.getElementById("check-in__info-text").classList.remove("red-text");
  document.getElementById("name").innerHTML = obj.firstName + " " + obj.lastName;
  document.getElementById("event").innerHTML = obj.event;
  document.getElementById("ticketCategory").innerHTML = obj.ticketCategory;
  document.getElementById("booking-id").innerHTML = obj.bookingNumber;
  document.getElementById("entries").innerHTML = obj.entries.replace(/\s/g, "<br>");
  document.getElementById("checkmark").src =
    "https://doo-product-consulting-uploads.s3.eu-central-1.amazonaws.com/Scandoo/logo-blue-transparent.png";

  // Activate Check-in
  if (obj.checkinAvailable === "true" && obj.checkedIn === "false") {
    document.getElementById("checkinBtn").disabled = false;
  } else {
    document.getElementById("checkinBtn").disabled = true;
    document.getElementById("check-in__info-text").innerHTML =
      "Check-in nicht mehr verfügbar";
    document.getElementById("check-in__info-text").classList.add("red-text");
  }

  // Activate Badge printing
  if (obj.printBadge === "true") {
    document.getElementById("printBadge").disabled = false;
    document.getElementById("badge-url").href = "https://yannikkunz.github.io/SCANdoo/badges/" + obj.ticketHash + ".pdf";
  }
}

function showFailedTicketInfo() {
  document.getElementById("name").innerHTML = "Teilnehmer nicht gefunden";
  document.getElementById("name").classList.add("red-text");
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
  printJS({
    printable: url,
    type: "pdf",
  });
}

// Ticket Search
function openSearch() {
  document.getElementById("myOverlay").style.display = "block";
}

function closeSearch() {
  document.getElementById("myOverlay").style.display = "none";
}

function searchTicket() {
  processTicketHash("getInfo", document.getElementById("searchTicketInput").value);
  closeSearch();
  document.getElementById("searchTicketInput").value = "";
}
