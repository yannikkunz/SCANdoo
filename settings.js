var html5QrcodeScanner;

//Load saved settings
document.getElementById("webhookURL").value = localStorage.getItem("webhookURL");
document.getElementById("oid").value = localStorage.getItem("oid");
document.getElementById("eid").value = localStorage.getItem("eid");

document.getElementById("QrCodeActivated").checked = (localStorage.getItem("QrCodeActivated") === "true");
document.getElementById("autoCheckinActivated").checked = (localStorage.getItem("autoCheckinActivated") === "true");
document.getElementById("autoBadgePrintActivated").checked = (localStorage.getItem("autoBadgePrintActivated") === "true");

// Edit Settings
document.getElementById("edit-settings").addEventListener("click", function (e) {
  document.getElementById("edit-settings").disabled = true;

  document.getElementById("webhookURL").disabled = false;
  document.getElementById("oid").disabled = false;
  document.getElementById("eid").disabled = false;

  document.getElementById("submit-settings").disabled = false;
  document.getElementById("submit-settings").style.display = "block";
});

// Save settings
document.getElementById("submit-settings").addEventListener("click", function (e) {
  document.getElementById("edit-settings").disabled = false;

  localStorage.setItem("webhookURL", document.getElementById("webhookURL").value);
  document.getElementById("webhookURL").disabled = true;

  localStorage.setItem("oid", document.getElementById("oid").value);
  document.getElementById("oid").disabled = true;

  localStorage.setItem("eid", document.getElementById("eid").value);
  document.getElementById("eid").disabled = true;

  document.getElementById("submit-settings").disabled = true;
  document.getElementById("submit-settings").style.display = "none";
});

// Edit Settings
document.getElementById("scan-settings").addEventListener("click", function (e) {
  document.getElementById("scanner-container").classList.remove("d-none");
  html5QrcodeScanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
  html5QrcodeScanner.render(onScanSuccess);
});

function onScanSuccess(qrCodeMessage) {

  console.log(qrCodeMessage);

  var obj = JSON.parse(qrCodeMessage);
  localStorage.setItem("webhookURL", obj.webhookURL);
  document.getElementById("webhookURL").value = obj.webhookURL;

  localStorage.setItem("oid", obj.oid);
  document.getElementById("oid").value = obj.oid;

  localStorage.setItem("eid", obj.eid);
  document.getElementById("eid").value = obj.eid;

  document.getElementById("scanner-container").classList.add("d-none");
  html5QrcodeScanner.clear();
}

// Activate QR Code Scanner
document
  .getElementById("QrCodeActivated")
  .addEventListener("click", function (e) {
    localStorage.setItem("QrCodeActivated", this.checked);
  });

// Activate Auto Checkin
document
  .getElementById("autoCheckinActivated")
  .addEventListener("click", function (e) {
    localStorage.setItem("autoCheckinActivated", this.checked);
  });

// Activate Auto Badge Print
document
  .getElementById("autoBadgePrintActivated")
  .addEventListener("click", function (e) {
    localStorage.setItem("autoBadgePrintActivated", this.checked);
  });
