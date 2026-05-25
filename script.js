function addMedicine() {

    let medicineName =
    document.getElementById("medicineName").value;

    let medicineTime =
    document.getElementById("medicineTime").value;

    let list =
    document.getElementById("medicineList");

    let item =
    document.createElement("li");

    item.innerHTML =
    `
     <strong>${medicineName}</strong>
      <br>
      <span class="medicine-time">
    Time: ${medicineTime}
    </span>
    `;

    item.classList.add("medicine-item");

    list.appendChild(item);

    document.getElementById("medicineName").value=""
    document.getElementById("medicineTime").value=""
}