var audio;
var lastScan;
var scanInput = '';
var scanActive = false;

function activateAudio() {
  audio = new Audio("assets/beep-104060.mp3");
  audio.play();
  document.getElementById("activateAudio").style.display = "none";
}

// Scanner Input
/*document.addEventListener('textInput', function (e){
  if(e.data.length >= 8){
      console.log('IR scan textInput', e.data);
      audio.play();

      var ticketHash = e.data.slice(-8)
    
      // Get last 8 chars of the scanned input so we can scan ticket hashs & checkin links
      if (lastScan != ticketHash) {
        processTicketHash(ticketHash, "ticket", false);
        lastScan = ticketHash;
      }
      e.preventDefault();
  }
});*/

document.addEventListener("keydown", function (e) {
  const textInput = e.key || String.fromCharCode(e.keyCode);
  const targetName = e.target.localName;
  if (textInput === "!") {
    scanActive = true;
  } else if (textInput === "?") {
    scanActive = false;
    console.log("New Scan: " + scanInput)

    var ticketHash = scanInput.slice(-8);

    if (localStorage.getItem("autoCheckinActivated") === "true") {
      processTicketHash(ticketHash, "ticket", true);
    } else {
      processTicketHash(ticketHash, "ticket", false);
    }

    scanInput = "";

  } else if (scanActive && textInput && textInput.length === 1 && targetName !== 'input') {
    scanInput = scanInput + textInput;
  }
});

// QR Code Scanner
function onScanSuccess(qrCodeMessage) {
  try {
    audio.play();
  } catch {
    console.log("Audio not activated");
  };

  var ticketHash = qrCodeMessage.slice(-8);

  // Get last 8 chars of the scanned input so we can scan ticket hashs & checkin links
  if (lastScan != ticketHash) {
    if (localStorage.getItem("autoCheckinActivated") === "true") {
      processTicketHash(ticketHash, "ticket", true);
    } else {
      processTicketHash(ticketHash, "ticket", false);
    }
    lastScan = ticketHash;
  }
}

function onScanError(errorMessage) {
  //handle scan error
}

if (localStorage.getItem("QrCodeActivated") === "true") {
  console.log("Activate QR Code Scanner");
  document.getElementById("reader-container").classList.remove("d-none");
  html5QrcodeScanner = new Html5QrcodeScanner("reader", {
    fps: 10,
    qrbox: 150,
    aspectRatio: 1,
  });
  html5QrcodeScanner.render(onScanSuccess, onScanError);
}

// Request to make scenario to get information
function processTicketHash(ticketHash, request, checkin) {

  console.log("ProcessTicketHash - Hash: " + ticketHash + " - Checkin: " + checkin);


  if (request === "ticket") {
    console.time();

    document.getElementById("loader-container").style.display = "block";
    document.getElementById("ticketHash").innerHTML = ticketHash;
    localStorage.setItem("ticketHash", ticketHash);
  }

  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var obj = JSON.parse(this.responseText)
      if (obj.request === "ticket") {
        processTicketResponse(obj);
      }

    } else if (this.readyState == 4 && this.status == 400) {
      showFailedTicketInfo();
    }
  };

  xmlhttp.open("GET", localStorage.getItem("webhookURL") + "?hash=" + ticketHash + "&request=" + request + "&checkin=" + checkin, true);
  console.log("Send request: " + localStorage.getItem("webhookURL") + "?hash=" + ticketHash + "&request=" + request + "&checkin=" + checkin);
  xmlhttp.setRequestHeader("Content-type", "application/json");
  xmlhttp.send();
}

function showFailedTicketInfo() {
  document.getElementById("warning-text-container").classList.remove("d-none");
  document.getElementById("warning-text").innerHTML = "Teilnehmer nicht gefunden";

  document.getElementById("event").innerHTML = "";
  document.getElementById("ticketCategory").innerHTML = "";
  document.getElementById("booking-id").innerHTML = "";
  document.getElementById("entries").innerHTML = "";

  document.getElementById("ticketCategory").innerHTML = "";
  document.getElementById("valid_from").innerHTML = "";
  document.getElementById("valid_till").innerHTML = "";
  document.getElementById("max_entries").innerHTML = "";

  document.getElementById("printBadge").disabled = true;
  document.getElementById("checkinBtn").disabled = true;

  console.timeEnd();
  document.getElementById("loader-container").style.display = "none";
}

function processTicketResponse(obj) {

  document.getElementById("warning-text").innerHTML = "";
  document.getElementById("warning-text-container").classList.add("d-none");

  // Display attendee info
  document.getElementById("name").innerHTML = obj.firstName + " " + obj.lastName;
  document.getElementById("event").innerHTML = obj.event;
  document.getElementById("booking-id").innerHTML = obj.bookingNumber;


  var formattedEntries;
  document.getElementById("entries").innerHTML = "";
  Object.keys(obj.entries).forEach(key => {
    var newNode = document.createElement('span');
    newNode.innerHTML = convertDate(obj.entries[key]) + "<br>";
    document.getElementById("entries").appendChild(newNode);
  })

  document.getElementById("ticketCategory").innerHTML = obj.ticketCategory;
  document.getElementById("valid_from").innerHTML = convertDate(obj.validFrom);
  document.getElementById("valid_till").innerHTML = convertDate(obj.validTill);
  document.getElementById("max_entries").innerHTML = obj.maxEntries;

  document.getElementById("check-in__info-text").classList.remove("text--red");

  //Check-in Button
  if (!obj.checkinRequested && obj.checkinAvailable) {
    document.getElementById("checkinBtn").disabled = false;
    document.getElementById("check-in__info-text").innerHTML = "Entwertet das Ticket";
    document.getElementById("check-in__info-text").classList.remove("text--red");
  } else {
    document.getElementById("checkinBtn").disabled = true;
    document.getElementById("check-in__info-text").innerHTML = "Check-in nicht verf??gbar";
    document.getElementById("check-in__info-text").classList.add("text--red");
  }

  // Checkin Background
  if (obj.checkinRequested && obj.checkinAvailable) {
    document.getElementById("check-in__header").classList.remove("background--red");
    document.getElementById("check-in__header").classList.add("background--green");
  } else if (obj.checkinRequested && !obj.checkinAvailable) {
    document.getElementById("check-in__header").classList.add("background--red");
    document.getElementById("check-in__header").classList.remove("background--green");
  } else {
    document.getElementById("check-in__header").classList.remove("background--red");
    document.getElementById("check-in__header").classList.remove("background--green");
  }

  //Badge printing
  if (obj.printBadge) {
    document.getElementById("printBadge").disabled = false;
    document.getElementById("badge-url").href = obj.badgeUrl;

    if (localStorage.getItem("autoBadgePrintActivated") === "true" && obj.printCount == 0) {
      printBadge(obj.ticketHash);
    }
  }

  // Terminate timer and loader
  console.timeEnd();
  document.getElementById("loader-container").style.display = "none";
}

function convertDate(date) {
  var dt = new Date(date);
  return dt.toLocaleString();
}

function printBadge(ticketHash) {
  var url = document.getElementById("badge-url").getAttribute("href");
  printJS({ printable: url, type: "image" });
  processTicketHash(ticketHash, 'badge', false);
}

// Ticket Search
function openSearch() {
  document.getElementById("myOverlay").style.display = "block";
}

function closeSearch() {
  document.getElementById("myOverlay").style.display = "none";
}

function searchTicket() {
  document.getElementById("myOverlay").style.display = "none";
  if (localStorage.getItem("autoCheckinActivated") === "true") {
    processTicketHash(document.getElementById("searchTicketInput").value, "ticket", true);
  } else {
    processTicketHash(document.getElementById("searchTicketInput").value, "ticket", false);
  }

  document.getElementById("searchTicketInput").value = "";
}
