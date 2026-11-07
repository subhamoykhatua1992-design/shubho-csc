
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ADMIN_UID = "yTGOIVQjdYd4PYaZMEEkazbT63W2";

const serviceForm = document.getElementById("serviceForm");
const serviceIcon = document.getElementById("serviceIcon");
const serviceTitle = document.getElementById("serviceTitle");
const serviceDescription = document.getElementById("serviceDescription");
const serviceList = document.getElementById("serviceList");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formHeading = document.getElementById("formHeading");

let editingServiceId = null;
let isAdmin = false;

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        window.location.href = "admin.html";
        return;
    }

    if (user.uid !== ADMIN_UID) {
        alert("আপনার Admin Access নেই।");
        window.location.href = "admin.html";
        return;
    }

    isAdmin = true;
    await loadServices();

});

async function loadServices() {

    if (!isAdmin) return;

    serviceList.textContent = "পরিষেবা লোড হচ্ছে...";

    try {

        const snapshot = await getDocs(
            collection(db, "services")
        );

        serviceList.innerHTML = "";

        if (snapshot.empty) {
            serviceList.textContent = "এখনও কোনো পরিষেবা যোগ করা হয়নি।";
            return;
        }

        snapshot.forEach((serviceDoc) => {

            const data = serviceDoc.data();

            const item = document.createElement("div");
            item.className = "service-item";

            const heading = document.createElement("h4");
            heading.textContent =
                (data.icon || "💻") + " " + (data.title || "");

            const description = document.createElement("p");
            description.textContent = data.description || "";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";

            editBtn.addEventListener("click", () => {

                editingServiceId = serviceDoc.id;

                serviceIcon.value = data.icon || "";
                serviceTitle.value = data.title || "";
                serviceDescription.value = data.description || "";

                formHeading.textContent = "পরিষেবা পরিবর্তন করুন";
                saveBtn.textContent = "Update Service";
                cancelBtn.style.display = "inline-block";

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            });

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "delete-btn";

            deleteBtn.addEventListener("click", async () => {

                const confirmDelete = confirm(
                    "আপনি কি এই পরিষেবাটি Delete করতে চান?"
                );

                if (!confirmDelete) return;

                try {

                    await deleteDoc(
                        doc(db, "services", serviceDoc.id)
                    );

                    message.textContent = "পরিষেবা Delete হয়েছে।";
                    await loadServices();

                } catch (error) {

                    console.error(error);
                    message.textContent = "Delete করা যায়নি।";

                }

            });

            item.appendChild(heading);
            item.appendChild(description);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);

            serviceList.appendChild(item);

        });

    } catch (error) {

        console.error("Service Loading Error:", error);
        serviceList.textContent = "পরিষেবা লোড করা যাচ্ছে না।";

    }
}

serviceForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!isAdmin) return;

    const serviceData = {
        icon: serviceIcon.value.trim(),
        title: serviceTitle.value.trim(),
        description: serviceDescription.value.trim()
    };

    if (!serviceData.icon || !serviceData.title || !serviceData.description) {
        message.textContent = "সব তথ্য পূরণ করুন।";
        return;
    }

    saveBtn.disabled = true;
    message.textContent = "Saving...";

    try {

        if (editingServiceId) {

            await updateDoc(
                doc(db, "services", editingServiceId),
                serviceData
            );

            message.textContent = "পরিষেবা সফলভাবে Update হয়েছে।";

        } else {

            await addDoc(
                collection(db, "services"),
                {
                    ...serviceData,
                    createdAt: serverTimestamp()
                }
            );

            message.textContent = "নতুন পরিষেবা সফলভাবে যোগ হয়েছে।";

        }

        resetForm();
        await loadServices();

    } catch (error) {

        console.error("Service Save Error:", error);
        message.textContent = "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";

    } finally {

        saveBtn.disabled = false;

    }

});

function resetForm() {

    serviceForm.reset();

    editingServiceId = null;

    formHeading.textContent = "নতুন পরিষেবা যোগ করুন";
    saveBtn.textContent = "Publish Service";
    cancelBtn.style.display = "none";

}

cancelBtn.addEventListener("click", () => {

    resetForm();
    message.textContent = "";

});
