
import { db } from "./firebase.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

const noticeList = document.getElementById("publicNoticeList");

async function loadPublicNotices() {

    if (!noticeList) return;

    noticeList.textContent = "Notice Loading...";

    try {

        const snapshot = await getDocs(
            collection(db, "notices")
        );

        noticeList.innerHTML = "";

        if (snapshot.empty) {
            noticeList.textContent = "বর্তমানে কোনো নতুন Notice নেই।";
            return;
        }

        snapshot.forEach((doc) => {

            const data = doc.data();

            const card = document.createElement("div");
            card.className = "public-notice-card";

            const title = document.createElement("h3");
            title.textContent = data.title || "Notice";

            const message = document.createElement("p");
            message.textContent = data.content || "";

            card.appendChild(title);
            card.appendChild(message);

            noticeList.appendChild(card);

        });

    } catch (error) {

        console.error("Notice Loading Error:", error);
        noticeList.textContent = "Notice লোড করা যাচ্ছে না।";

    }
}

loadPublicNotices();
