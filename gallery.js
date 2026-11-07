
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

const galleryForm = document.getElementById("galleryForm");
const galleryTitle = document.getElementById("galleryTitle");
const galleryImage = document.getElementById("galleryImage");
const galleryDescription = document.getElementById("galleryDescription");
const galleryList = document.getElementById("galleryList");
const message = document.getElementById("message");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formHeading = document.getElementById("formHeading");

let editingGalleryId = null;
let isAdmin = false;

// Admin Login Check
onAuthStateChanged(auth, async (user) => {

    if (!user || user.uid !== ADMIN_UID) {
        window.location.href = "admin.html";
        return;
    }

    isAdmin = true;
    await loadGallery();

});

// Load Gallery
async function loadGallery() {

    if (!isAdmin) return;

    galleryList.textContent = "Gallery Loading...";

    try {

        const snapshot = await getDocs(collection(db, "gallery"));

        galleryList.innerHTML = "";

        if (snapshot.empty) {
            galleryList.textContent = "এখনও কোনো ছবি যোগ করা হয়নি।";
            return;
        }

        snapshot.forEach((galleryDoc) => {

            const data = galleryDoc.data();

            const item = document.createElement("div");
            item.className = "gallery-item";

            const image = document.createElement("img");
            image.src = data.image || "";
            image.alt = data.title || "Gallery Image";

            image.onerror = () => {
                image.alt = "ছবি পাওয়া যায়নি";
                image.style.display = "none";
            };

            const title = document.createElement("h4");
            title.textContent = data.title || "";

            const description = document.createElement("p");
            description.textContent = data.description || "";

            const path = document.createElement("p");
            path.textContent = "Image Path: " + (data.image || "");

            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit";
            editBtn.className = "edit-btn";

            editBtn.addEventListener("click", () => {

                editingGalleryId = galleryDoc.id;

                galleryTitle.value = data.title || "";
                galleryImage.value = data.image || "";
                galleryDescription.value = data.description || "";

                formHeading.textContent = "ছবির তথ্য পরিবর্তন করুন";
                saveBtn.textContent = "Update Photo";
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

                if (!confirm("আপনি কি এই ছবি Gallery থেকে মুছে ফেলতে চান?")) {
                    return;
                }

                try {

                    await deleteDoc(doc(db, "gallery", galleryDoc.id));

                    message.textContent = "ছবিটি Delete হয়েছে।";
                    await loadGallery();

                } catch (error) {

                    console.error(error);
                    message.textContent = "ছবি Delete করা যায়নি।";

                }

            });

            item.appendChild(image);
            item.appendChild(title);
            item.appendChild(description);
            item.appendChild(path);
            item.appendChild(editBtn);
            item.appendChild(deleteBtn);

            galleryList.appendChild(item);

        });

    } catch (error) {

        console.error("Gallery Loading Error:", error);
        galleryList.textContent = "Gallery লোড করা যাচ্ছে না।";

    }

}

// Add / Update Photo
galleryForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!isAdmin) return;

    const imagePath = galleryImage.value.trim();

    const galleryData = {
        title: galleryTitle.value.trim(),
        image: imagePath,
        description: galleryDescription.value.trim()
    };

    if (!galleryData.title || !galleryData.image) {
        message.textContent = "সব প্রয়োজনীয় তথ্য পূরণ করুন।";
        return;
    }

    if (!imagePath.startsWith("images/") || imagePath.includes("..")) {
        message.textContent = "সঠিক Image Path দিন। যেমন: images/shop-front.jpg";
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
    message.textContent = "";

    try {

        if (editingGalleryId) {

            await updateDoc(
                doc(db, "gallery", editingGalleryId),
                {
                    ...galleryData,
                    updatedAt: serverTimestamp()
                }
            );

            message.textContent = "ছবির তথ্য Update হয়েছে।";

        } else {

            await addDoc(
                collection(db, "gallery"),
                {
                    ...galleryData,
                    createdAt: serverTimestamp()
                }
            );

            message.textContent = "নতুন ছবি Gallery-তে যোগ হয়েছে।";

        }

        resetForm();
        await loadGallery();

    } catch (error) {

        console.error("Gallery Save Error:", error);
        message.textContent = "সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।";

    } finally {

        saveBtn.disabled = false;
        saveBtn.textContent = editingGalleryId ? "Update Photo" : "Publish Photo";

    }

});

// Reset Form
function resetForm() {

    galleryForm.reset();

    editingGalleryId = null;

    formHeading.textContent = "নতুন ছবি যোগ করুন";
    saveBtn.textContent = "Publish Photo";
    cancelBtn.style.display = "none";

}

cancelBtn.addEventListener("click", () => {

    resetForm();
    message.textContent = "";

});
