let menu = document.getElementById("menu"),
  nav = document.getElementById("main-nav");

menu.addEventListener("click", function (e) {
  this.classList.toggle("is-open");
  nav.classList.toggle("is-open");
});