
import { auth } from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const ADMIN_UID = "yTGOIVQjdYd4PYaZMEEkazbT63W2";

onAuthStateChanged(auth, (user) => {

    if (!user || user.uid !== ADMIN_UID) {
        signOut(auth);
        window.location.href = "admin.html";
        return;
    }

    document.getElementById("adminEmail").textContent =
        "Logged in as: " + user.email;
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "admin.html";
});

