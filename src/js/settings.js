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
