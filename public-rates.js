
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const rateList = document.getElementById("publicRateList");

async function loadPublicRates() {

    if (!rateList) return;

    rateList.textContent = "Rate List Loading...";

    try {

        const snapshot = await getDocs(
            collection(db, "rates")
        );

        rateList.innerHTML = "";

        if (snapshot.empty) {
            rateList.textContent = "বর্তমানে কোনো Rate প্রকাশিত নেই।";
            return;
        }

        snapshot.forEach((rateDoc) => {

            const data = rateDoc.data();

            const row = document.createElement("div");
            row.className = "rate-row";

            const name = document.createElement("span");
            name.textContent = data.title || "";

            const price = document.createElement("strong");
            price.textContent = data.price || "যোগাযোগ করুন";

            row.appendChild(name);
            row.appendChild(price);

            rateList.appendChild(row);

        });

    } catch (error) {

        console.error("Rate Loading Error:", error);

        rateList.textContent = "Rate List লোড করা যাচ্ছে না।";

    }
}

loadPublicRates();
