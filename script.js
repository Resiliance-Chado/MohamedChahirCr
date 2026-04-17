function calculer() {
  let distance = document.getElementById("distance").value;
  let temps = document.getElementById("temps").value;

  let allure = temps / distance;

  document.getElementById("resultat").innerHTML =
    "Allure : " + allure.toFixed(2) + " min/km";
}
