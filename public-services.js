
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const serviceList = document.getElementById("publicServiceList");

async function loadPublicServices() {

    if (!serviceList) return;

    serviceList.textContent = "পরিষেবা লোড হচ্ছে...";

    try {

        const snapshot = await getDocs(
            collection(db, "services")
        );

        serviceList.innerHTML = "";

        if (snapshot.empty) {
            serviceList.textContent = "বর্তমানে কোনো পরিষেবা প্রকাশিত নেই।";
            return;
        }

        snapshot.forEach((doc) => {

            const data = doc.data();

            const card = document.createElement("div");
            card.className = "service-card";

            const icon = document.createElement("div");
            icon.className = "service-icon";
            icon.textContent = data.icon || "💻";

            const title = document.createElement("h3");
            title.textContent = data.title || "Digital Service";

            const description = document.createElement("p");
            description.textContent = data.description || "";

            card.appendChild(icon);
            card.appendChild(title);
            card.appendChild(description);

            serviceList.appendChild(card);

        });

    } catch (error) {

        console.error("Service Loading Error:", error);

        serviceList.textContent = "পরিষেবা লোড করা যাচ্ছে না।";

    }
}

loadPublicServices();
