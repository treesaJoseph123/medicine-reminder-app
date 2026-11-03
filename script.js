
"use strict";

const STORAGE_KEYS = {
    user: "medcareUser",
    medicines: "medcareMedicines"
};

const CHECK_INTERVAL = 15000;

const greeting = document.getElementById("greeting");
const currentDate = document.getElementById("currentDate");
const profileAvatar = document.getElementById("profileAvatar");

const totalMedicines = document.getElementById("totalMedicines");
const takenMedicines = document.getElementById("takenMedicines");
const remainingMedicines = document.getElementById("remainingMedicines");

const medicineList = document.getElementById("medicineList");
const medicineCount = document.getElementById("medicineCount");

const medicineModal = document.getElementById("medicineModal");
const modalTitle = document.getElementById("modalTitle");

const medicineForm = document.getElementById("medicineForm");
const medicineId = document.getElementById("medicineId");
const medicineName = document.getElementById("medicineName");
const medicineDosage = document.getElementById("medicineDosage");
const medicineTime = document.getElementById("medicineTime");
const medicineNotes = document.getElementById("medicineNotes");

const addMedicineButton = document.getElementById("addMedicineButton");
const closeModalButton = document.getElementById("closeModalButton");
const cancelModalButton = document.getElementById("cancelModalButton");
const modalOverlay = document.getElementById("modalOverlay");

const enableNotificationsButton =
    document.getElementById("enableNotifications");

const logoutButton = document.getElementById("logoutButton");

const userName = localStorage.getItem(STORAGE_KEYS.user);

if (!userName) {
    window.location.replace("index.html");
} else {
    greeting.textContent = `Welcome back, ${userName}!`;
    profileAvatar.textContent = userName.charAt(0).toUpperCase();
}


function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function displayCurrentDate() {
    const today = new Date();

    currentDate.textContent = today.toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

displayCurrentDate();


function loadMedicines() {
    try {
        const storedMedicines = localStorage.getItem(
            STORAGE_KEYS.medicines
        );

        if (!storedMedicines) {
            return [];
        }

        const parsedMedicines = JSON.parse(storedMedicines);

        return Array.isArray(parsedMedicines)
            ? parsedMedicines
            : [];

    } catch (error) {
        console.error("Unable to load medicines:", error);
        return [];
    }
}

let medicines = loadMedicines();


function saveMedicines() {
    try {
        localStorage.setItem(
            STORAGE_KEYS.medicines,
            JSON.stringify(medicines)
        );

    } catch (error) {
        console.error("Unable to save medicines:", error);

        alert(
            "Your changes could not be saved. Please check your browser storage."
        );
    }
}


function openModal(medicine = null) {

    medicineForm.reset();

    if (medicine) {

        modalTitle.textContent = "Edit medicine";

        medicineId.value = medicine.id;
        medicineName.value = medicine.name;
        medicineDosage.value = medicine.dosage;
        medicineTime.value = medicine.time;
        medicineNotes.value = medicine.notes || "";

    } else {

        modalTitle.textContent = "Add a medicine";

        medicineId.value = "";
    }

    medicineModal.classList.add("show");
    medicineModal.setAttribute("aria-hidden", "false");

    medicineName.focus();
}


function closeModal() {

    medicineModal.classList.remove("show");
    medicineModal.setAttribute("aria-hidden", "true");

    medicineForm.reset();
    medicineId.value = "";
}


addMedicineButton.addEventListener("click", function () {
    openModal();
});

closeModalButton.addEventListener("click", closeModal);

cancelModalButton.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", closeModal);

document.addEventListener("keydown", function (event) {

    if (
        event.key === "Escape" &&
        medicineModal.classList.contains("show")
    ) {
        closeModal();
    }

});


/* ---------- 7. Add and Edit Medicines ---------- */

medicineForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = medicineName.value.trim();
    const dosage = medicineDosage.value.trim();
    const time = medicineTime.value;
    const notes = medicineNotes.value.trim();

    if (!name || !dosage || !time) {
        alert("Please complete all required fields.");
        return;
    }

    const existingId = medicineId.value;

    if (existingId) {

        const medicineIndex = medicines.findIndex(
            medicine => medicine.id === existingId
        );

        if (medicineIndex !== -1) {

            medicines[medicineIndex] = {
                ...medicines[medicineIndex],
                name,
                dosage,
                time,
                notes
            };

        }

    } else {

        const newMedicine = {
            id: window.crypto?.randomUUID
                ? window.crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`,

            name,
            dosage,
            time,
            notes,

            takenDate: null,
            lastNotifiedDate: null
        };

        medicines.push(newMedicine);
    }

    saveMedicines();

    renderDashboard();

    closeModal();

});


/* ---------- 8. Delete Medicines ---------- */

function deleteMedicine(id) {

    const medicine = medicines.find(
        item => item.id === id
    );

    if (!medicine) {
        return;
    }

    const confirmed = confirm(
        `Are you sure you want to delete ${medicine.name}?`
    );

    if (!confirmed) {
        return;
    }

    medicines = medicines.filter(
        item => item.id !== id
    );

    saveMedicines();

    renderDashboard();
}


/* ---------- 9. Edit Medicines ---------- */

function editMedicine(id) {

    const medicine = medicines.find(
        item => item.id === id
    );

    if (!medicine) {
        return;
    }

    openModal(medicine);
}

function toggleTaken(id) {

    const medicine = medicines.find(
        item => item.id === id
    );

    if (!medicine) {
        return;
    }

    const today = getTodayDate();

    if (medicine.takenDate === today) {

        medicine.takenDate = null;

    } else {

        medicine.takenDate = today;

    }

    saveMedicines();

    renderDashboard();
}


function formatTime(time) {

    if (!time) {
        return "";
    }

    const [hours, minutes] = time.split(":");

    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
}

function createMedicineElement(medicine) {

    const today = getTodayDate();

    const isTaken = medicine.takenDate === today;

    const item = document.createElement("article");

    item.className = "medicine-item";

    const info = document.createElement("div");
    info.className = "medicine-info";

    const avatar = document.createElement("div");
    avatar.className = "medicine-avatar";
    avatar.textContent = "✚";
    avatar.setAttribute("aria-hidden", "true");

    const details = document.createElement("div");
    details.className = "medicine-details";

    const name = document.createElement("h3");
    name.textContent = medicine.name;

    const dosage = document.createElement("p");
    dosage.textContent = medicine.dosage;

    if (medicine.notes) {
        const notes = document.createElement("p");
        notes.textContent = medicine.notes;
        details.appendChild(notes);
    }

    details.appendChild(name);
    details.appendChild(dosage);

    info.appendChild(avatar);
    info.appendChild(details);

    const time = document.createElement("span");
    time.className = "medicine-time";
    time.textContent = formatTime(medicine.time);

    const actions = document.createElement("div");
    actions.className = "medicine-actions";

    const takenButton = document.createElement("button");

    takenButton.type = "button";
    takenButton.className = isTaken
        ? "action-button taken"
        : "action-button";

    takenButton.textContent = isTaken
        ? "✓ Taken"
        : "Mark taken";

    takenButton.setAttribute(
        "aria-label",
        isTaken
            ? `Mark ${medicine.name} as not taken`
            : `Mark ${medicine.name} as taken`
    );

    takenButton.addEventListener("click", function () {
        toggleTaken(medicine.id);
    });

    const editButton = document.createElement("button");

    editButton.type = "button";
    editButton.className = "action-button";
    editButton.textContent = "Edit";

    editButton.addEventListener("click", function () {
        editMedicine(medicine.id);
    });

    const deleteButton = document.createElement("button");

    deleteButton.type = "button";
    deleteButton.className = "action-button delete";
    deleteButton.textContent = "Delete";

    deleteButton.addEventListener("click", function () {
        deleteMedicine(medicine.id);
    });

    actions.appendChild(takenButton);
    actions.appendChild(editButton);
    actions.appendChild(deleteButton);

    item.appendChild(info);
    item.appendChild(time);
    item.appendChild(actions);

    return item;
}


function renderMedicineList() {

    medicineList.replaceChildren();

    const emptyState = document.createElement("div");

    emptyState.className = "empty-state";

    const icon = document.createElement("div");
    icon.className = "empty-icon";
    icon.textContent = "✚";

    const title = document.createElement("h3");
    title.textContent = "No medicines added yet";

    const description = document.createElement("p");
    description.textContent =
        "Add your first medicine to start organizing your schedule.";

    emptyState.appendChild(icon);
    emptyState.appendChild(title);
    emptyState.appendChild(description);

    if (medicines.length === 0) {

        medicineList.appendChild(emptyState);

        medicineCount.textContent = "0 medicines";

        return;
    }

    const sortedMedicines = [...medicines].sort(
        (a, b) => a.time.localeCompare(b.time)
    );

    sortedMedicines.forEach(function (medicine) {

        medicineList.appendChild(
            createMedicineElement(medicine)
        );

    });

    medicineCount.textContent =
        `${medicines.length} ${medicines.length === 1 ? "medicine" : "medicines"}`;
}

function updateSummary() {

    const today = getTodayDate();

    const total = medicines.length;

    const taken = medicines.filter(
        medicine => medicine.takenDate === today
    ).length;

    const remaining = total - taken;

    totalMedicines.textContent = total;

    takenMedicines.textContent = taken;

    remainingMedicines.textContent = remaining;
}


function renderDashboard() {

    updateSummary();

    renderMedicineList();
}


function enableNotifications() {

    if (!("Notification" in window)) {

        alert(
            "Your browser does not support notifications."
        );

        return;
    }

    if (Notification.permission === "granted") {

        alert("Browser notifications are already enabled.");

        checkMedicineReminders();

        return;
    }

    if (Notification.permission === "denied") {

        alert(
            "Notifications are blocked. Please allow them in your browser settings."
        );

        return;
    }

    Notification.requestPermission().then(function (permission) {

        if (permission === "granted") {

            alert("Notifications enabled successfully!");

            checkMedicineReminders();

        } else {

            alert("Notification permission was not granted.");

        }

    });

}


enableNotificationsButton.addEventListener(
    "click",
    enableNotifications
);


function checkMedicineReminders() {

    if (
        !("Notification" in window) ||
        Notification.permission !== "granted"
    ) {
        return;
    }

    const now = new Date();

    const today = getTodayDate();

    const currentTime =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0");

    medicines.forEach(function (medicine) {

        const isAlreadyTaken =
            medicine.takenDate === today;

        const alreadyNotified =
            medicine.lastNotifiedDate === today;

        const isDue =
            medicine.time === currentTime;

        if (
            isDue &&
            !isAlreadyTaken &&
            !alreadyNotified
        ) {

            new Notification("MedCare - Medicine Reminder", {

                body: `Time to take ${medicine.name} (${medicine.dosage}).`,

                tag: `medicine-${medicine.id}`

            });

            medicine.lastNotifiedDate = today;

            saveMedicines();
        }

    });

}


logoutButton.addEventListener("click", function () {

    const confirmed = confirm(
        "Are you sure you want to log out?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem(STORAGE_KEYS.user);

    window.location.href = "index.html";

});


/* ---------- 19. Initialize Application ---------- */

renderDashboard();

if (document.visibilityState === "visible") {
    checkMedicineReminders();
}

setInterval(function () {

    if (document.visibilityState === "visible") {
        checkMedicineReminders();
    }

}, CHECK_INTERVAL);

document.addEventListener("visibilitychange", function () {

    if (document.visibilityState === "visible") {
        checkMedicineReminders();
    }

});
