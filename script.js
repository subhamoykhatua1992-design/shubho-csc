
// Shubho CSC Website JavaScript

// Animated Headlines
const headlines = [
    "আপনার বিশ্বস্ত ডিজিটাল পরিষেবা কেন্দ্র",
    "সরকারি ও বেসরকারি অনলাইন পরিষেবা",
    "ব্যাংকিং, PAN CARD ও LIC পরিষেবা",
    "ডিজিটাল শিক্ষা ও অনলাইন সহযোগিতা"
];

let headlineIndex = 0;

const headlineElement = document.querySelector(".premium-hero h2");

function changeHeadline() {
    if (!headlineElement) return;

    headlineElement.style.opacity = "0";

    setTimeout(() => {
        headlineIndex = (headlineIndex + 1) % headlines.length;
        headlineElement.textContent = headlines[headlineIndex];
        headlineElement.style.opacity = "1";
    }, 500);
}

setInterval(changeHeadline, 3000);


// Welcome Message in Console
console.log("Welcome to Shubho CSC Website!");


// Current Year in Footer
const footer = document.querySelector("footer p");

if (footer) {
    footer.textContent =
        "© " + new Date().getFullYear() +
        " Shubho CSC & Digital Education Centre";
}

// Contact Form WhatsApp Integration

const contactForm = document.getElementById("contactForm");

if (contactForm) {

    contactForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("customerName").value;
        const phone = document.getElementById("customerPhone").value;
        const service = document.getElementById("customerService").value;
        const message = document.getElementById("customerMessage").value;

        const whatsappMessage =
            "New Customer Enquiry\n\n" +
            "Name: " + name + "\n" +
            "Phone: " + phone + "\n" +
            "Service: " + service + "\n" +
            "Message: " + message;

        const whatsappURL =
            "https://wa.me/918240614983?text=" +
            encodeURIComponent(whatsappMessage);

        window.open(whatsappURL, "_blank");

    });

}

// SHUBHO CSC CUSTOMER ENQUIRY

const enquiryForm = document.getElementById("enquiryForm");

if (enquiryForm) {

    enquiryForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const name = document.getElementById("customerName").value.trim();

        const phone = document.getElementById("customerPhone").value.trim();

        const service = document.getElementById("customerService").value;

        const message = document.getElementById("customerMessage").value.trim();

        if (!/^[6-9][0-9]{9}$/.test(phone)) {
            alert("সঠিক ১০ সংখ্যার মোবাইল নম্বর লিখুন।");
            return;
        }

        const whatsappMessage =
            "নতুন Customer Enquiry - Shubho CSC\n\n" +
            "নাম: " + name + "\n" +
            "মোবাইল: " + phone + "\n" +
            "পরিষেবা: " + service + "\n" +
            "অতিরিক্ত তথ্য: " + (message || "কিছু জানানো হয়নি");

        const whatsappURL =
            "https://wa.me/918240614983?text=" +
            encodeURIComponent(whatsappMessage);

        window.open(whatsappURL, "_blank");

    });

}
