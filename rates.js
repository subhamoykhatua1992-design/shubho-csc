
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

const rateForm = document.getElementById("rateForm");
const rateTitle = document.getElementById("rateTitle");
const ratePrice = document.getElementById("ratePrice");
const rateList = document.getElementById("rateList");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formHeading = document.getElementById("formHeading");

let editingRateId = null;
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
    await loadRates();

});

async function loadRates() {

    if (!isAdmin) return;

    rateList.textContent = "Rate List Loading...";

    try {

        const snapshot = await getDocs(
            collection(db, "rates")
        );

        rateList.innerHTML = "";

        if (snapshot.empty) {
            rateList.textContent = "এখনও কোনো Rate যোগ করা হয়নি।";
            return;
        }

        snapshot.forEach((rateDoc) => {

            const data = rateDoc.data();

            const item = document.createElement("div");
            item.className = "rate-item";

            const heading = document.createElement("h4");
            heading.textContent = data.title || "";

            const price = document.createElement("p");
            price.textContent = "মূল্য: " + (data.price || "");

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";

            editBtn.addEventListener("click", () => {

                editingRateId = rateDoc.id;

                rateTitle.value = data.title || "";
                ratePrice.value = data.price || "";

                formHeading.textContent = "Rate পরিবর্তন করুন";
                saveBtn.textContent = "Update Rate";
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
                    "আপনি কি এই Rate Delete করতে চান?"
                );

                if (!confirmDelete) return;

                try {

                    await deleteDoc(
                        doc(db, "rates", rateDoc.id)
                    );

                    message.textContent = "Rate Delete হয়েছে।";
                    await loadRates();

                } catch (error) {

                    console.error(error);
                    message.textContent = "Delete করা যায়নি।";

                }

            });

            item.appendChild(heading);
            item.appendChild(price);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);

            rateList.appendChild(item);

        });

    } catch (error) {

        console.error("Rate Loading Error:", error);
        rateList.textContent = "Rate List লোড করা যাচ্ছে না।";

    }
}

rateForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!isAdmin) return;

    const rateData = {
        title: rateTitle.value.trim(),
        price: ratePrice.value.trim()
    };

    if (!rateData.title || !rateData.price) {
        message.textContent = "সব তথ্য পূরণ করুন।";
        return;
    }

    saveBtn.disabled = true;
    message.textContent = "Saving...";

    try {

        if (editingRateId) {

            await updateDoc(
    doc(db, "rates", editingRateId),
    {
        ...rateData,
        updatedAt: serverTimestamp()
    }
);
            message.textContent = "Rate সফলভাবে Update হয়েছে।";

        } else {

            await addDoc(
                collection(db, "rates"),
                {
                    ...rateData,
                    createdAt: serverTimestamp()
                }
            );

            message.textContent = "নতুন Rate সফলভাবে যোগ হয়েছে।";

        }

        resetForm();
        await loadRates();

    } catch (error) {

        console.error("Rate Save Error:", error);
        message.textContent = "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";

    } finally {

        saveBtn.disabled = false;

    }

});

function resetForm() {

    rateForm.reset();

    editingRateId = null;

    formHeading.textContent = "নতুন Rate যোগ করুন";
    saveBtn.textContent = "Publish Rate";
    cancelBtn.style.display = "none";

}

cancelBtn.addEventListener("click", () => {

    resetForm();
    message.textContent = "";

});
