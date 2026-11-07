import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";


const loginForm = document.getElementById("adminLoginForm");
const message = document.getElementById("loginMessage");


// Already logged in check
onAuthStateChanged(auth, (user) => {
    if (user && user.uid === "yTGOIVQjdYd4PYaZMEEkazbT63W2") {
        window.location.href = "dashboard.html";
    }
});


// Admin Login
loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    message.textContent = "Please wait...";

    try {

        const result = await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        if (result.user.uid === "yTGOIVQjdYd4PYaZMEEkazbT63W2") {

            window.location.href = "dashboard.html";

        } else {

            await auth.signOut();
            message.textContent = "আপনার Admin Access নেই।";

        }

    } catch (error) {

        message.textContent = "Login Failed: " + error.message;

    }

});