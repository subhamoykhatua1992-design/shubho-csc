
import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const ADMIN_UID = "yTGOIVQjdYd4PYaZMEEkazbT63W2";

const noticeForm = document.getElementById("noticeForm");
const noticeList = document.getElementById("noticeList");
const message = document.getElementById("message");

const titleInput = document.getElementById("noticeTitle");
const contentInput = document.getElementById("noticeText");
const saveBtn = document.getElementById("saveBtn");

let currentUser = null;
let editingNoticeId = null;

// Cancel Button তৈরি
const cancelBtn = document.createElement("button");
cancelBtn.type = "button";
cancelBtn.textContent = "Cancel Edit";
cancelBtn.style.display = "none";
cancelBtn.style.marginLeft = "10px";

saveBtn.insertAdjacentElement("afterend", cancelBtn);

// Admin Login Check
onAuthStateChanged(auth, async (user) => {

    if (!user || user.uid !== ADMIN_UID) {
        if (user) await signOut(auth);
        window.location.href = "admin.html";
        return;
    }

    currentUser = user;
    loadNotices();
});

// Form Submit: Add অথবা Update
noticeForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    if (!currentUser) return;

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        message.textContent = "সব তথ্য পূরণ করুন।";
        return;
    }

    saveBtn.disabled = true;

    try {

        if (editingNoticeId) {

            message.textContent = "Updating...";

            await updateDoc(
                doc(db, "notices", editingNoticeId),
                {
                    title: title,
                    content: content,
                    updatedAt: serverTimestamp()
                }
            );

            message.textContent = "Notice সফলভাবে Update হয়েছে!";

        } else {

            message.textContent = "Saving...";

            await addDoc(collection(db, "notices"), {
                title: title,
                content: content,
                createdAt: serverTimestamp()
            });

            message.textContent = "Notice সফলভাবে যোগ হয়েছে!";
        }

        resetEditMode();
        await loadNotices();

    } catch (error) {

        message.textContent = "Error: " + error.message;

    } finally {

        saveBtn.disabled = false;
    }
});

// Edit Mode Cancel
cancelBtn.addEventListener("click", () => {
    resetEditMode();
    message.textContent = "Edit বাতিল করা হয়েছে।";
});

// Form Reset
function resetEditMode() {

    editingNoticeId = null;

    noticeForm.reset();

    saveBtn.textContent = "Save Notice";
    cancelBtn.style.display = "none";
}

// Load Notices
async function loadNotices() {

    noticeList.textContent = "Loading...";

    try {

        const snapshot = await getDocs(collection(db, "notices"));

        noticeList.innerHTML = "";

        if (snapshot.empty) {
            noticeList.textContent = "এখনও কোনও Notice নেই।";
            return;
        }

        snapshot.forEach((item) => {

            const data = item.data();

            const card = document.createElement("div");
            card.className = "notice-item";

            const heading = document.createElement("h3");
            heading.textContent = data.title || "Notice";

            const details = document.createElement("p");
            details.textContent = data.content || "";

            // Edit Button
            const editButton = document.createElement("button");
            editButton.textContent = "Edit Notice";
            editButton.className = "edit-btn";

            editButton.addEventListener("click", () => {

                editingNoticeId = item.id;

                titleInput.value = data.title || "";
                contentInput.value = data.content || "";

                saveBtn.textContent = "Update Notice";
                cancelBtn.style.display = "inline-block";

                message.textContent = "এখন Notice Edit করুন।";

                noticeForm.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            });

            // Delete Button
            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete Notice";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async () => {

                if (!confirm("এই Notice মুছে ফেলতে চান?")) return;

                try {

                    await deleteDoc(doc(db, "notices", item.id));

                    if (editingNoticeId === item.id) {
                        resetEditMode();
                    }

                    message.textContent = "Notice মুছে ফেলা হয়েছে!";

                    await loadNotices();

                } catch (error) {

                    alert("Delete করা যায়নি: " + error.message);
                }
            });

            card.append(
                heading,
                details,
                editButton,
                deleteButton
            );

            noticeList.appendChild(card);
        });

    } catch (error) {

        noticeList.textContent = "Notice Load Error: " + error.message;
    }
}
