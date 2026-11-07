import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const galleryList = document.getElementById("publicGalleryList");

async function loadPublicGallery() {
    if (!galleryList) return;

    galleryList.textContent = "Gallery Loading...";

    try {
        const galleryQuery = query(
            collection(db, "gallery"),
            orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(galleryQuery);

        galleryList.innerHTML = "";

        if (snapshot.empty) {
            galleryList.textContent = "বর্তমানে কোনো ছবি প্রকাশিত নেই।";
            return;
        }

        snapshot.forEach((galleryDoc, index) => {
            const data = galleryDoc.data();

            const card = document.createElement("div");
            card.className = "gallery-card";

            const image = document.createElement("img");
            image.src = data.image || "";
            image.alt = data.title || "Gallery Photo";
            image.loading = "lazy";

            const overlay = document.createElement("div");
            overlay.className = "gallery-overlay";

            const number = document.createElement("span");
            number.textContent = String(index + 1).padStart(2, "0");

            const title = document.createElement("h3");
            title.textContent = data.title || "";

            const description = document.createElement("p");
            description.textContent = data.description || "";

            overlay.appendChild(number);
            overlay.appendChild(title);
            overlay.appendChild(description);

            card.appendChild(image);
            card.appendChild(overlay);

            galleryList.appendChild(card);
        });

    } catch (error) {
        console.error("Gallery Error:", error);
        galleryList.textContent = "Gallery লোড করা যাচ্ছে না।";
    }
}

loadPublicGallery();