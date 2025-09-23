import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment, arrayUnion, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyA4hyg3BbR--b5c_ig01yr_OblTZP4TsDE",
    authDomain: "adsbux-73efc.firebaseapp.com",
    projectId: "adsbux-73efc",
    storageBucket: "adsbux-73efc.firebasestorage.app",
    messagingSenderId: "396593744688",
    appId: "1:396593744688:web:03d7020fa05c9296d396f5",
    measurementId: "G-SFXVSS6MRJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const loginBtn = document.getElementById("loginBtn");
const adsSection = document.getElementById("adsSection");
const withdrawSection = document.getElementById("withdrawSection");
const robuxCountElem = document.getElementById("robuxCount");
const watchAdBtn = document.getElementById("watchAdBtn");
const withdrawAmount = document.getElementById("withdrawAmount");
const gamepassInput = document.getElementById("gamepassInput");
const withdrawBtn = document.getElementById("withdrawBtn");
const withdrawHistory = document.getElementById("withdrawHistory");

const adminLoginBtn = document.getElementById("adminLoginBtn");
const adminPanel = document.getElementById("adminPanel");
const closeAdmin = document.getElementById("closeAdmin");
const adminRequests = document.getElementById("adminRequests");

const adBar = document.getElementById("adBar");

let user = null;

// Google Login
loginBtn.addEventListener("click", async ()=>{
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    user = result.user;
    adsSection.classList.remove("hidden");
    withdrawSection.classList.remove("hidden");
    await initUserData();
});

// Kullanıcı verisini yükle / oluştur
async function initUserData(){
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if(!docSnap.exists()){
        await setDoc(docRef, {robux:0, withdraws:[], email:user.email});
    }
    updateUI();
}

// UI Güncelleme
async function updateUI(){
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();
    robuxCountElem.innerText = data.robux;
    withdrawHistory.innerHTML = "";
    data.withdraws.forEach(w => {
        const li = document.createElement("li");
        li.innerText = `${w.amount} Robux - ${w.gamepass} - ${w.status}`;
        withdrawHistory.appendChild(li);
    });
}

// Animasyonlu Reklam İzleme
watchAdBtn.addEventListener("click", async ()=>{
    watchAdBtn.disabled = true;
    let progress = 0;
    const interval = setInterval(()=>{
        progress += 5;
        adBar.style.width = progress + "%";
        if(progress >= 100){
            clearInterval(interval);
            adBar.style.width = "0%";
            watchAdBtn.disabled = false;
            const docRef = doc(db, "users", user.uid);
            updateDoc(docRef, {robux: increment(1)}).then(()=> updateUI());
            alert("Reklam izlendi! 1 Robux kazandınız.");
        }
    }, 200);
});

// Çekim Talebi
withdrawBtn.addEventListener("click", async ()=>{
    const amount = Number(withdrawAmount.value);
    const gamepass = gamepassInput.value.trim();
    if(amount >= 20 && gamepass){
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {withdraws: arrayUnion({amount, gamepass, status:"Beklemede"})});
        withdrawAmount.value = "";
        gamepassInput.value = "";
        updateUI();
        alert("Çekim talebiniz gönderildi.");
    } else alert("Minimum 20 Robux ve geçerli Gamepass girin.");
});

// Admin Paneli
adminLoginBtn.addEventListener("click", async ()=>{
    const adminUIDs = ["ADMIN_UID_1"]; // kendi UID ekle
    if(!user) return alert("Önce giriş yapın!");
    if(adminUIDs.includes(user.uid)){
        adminPanel.classList.remove("hidden");
        renderAdminRequests();
    } else alert("Admin yetkiniz yok!");
});

closeAdmin.addEventListener("click", ()=>{
    adminPanel.classList.add("hidden");
});

// Admin talepleri
async function renderAdminRequests(){
    adminRequests.innerHTML = "";
    const usersSnapshot = await getDocs(collection(db, "users"));
    usersSnapshot.forEach(uDoc=>{
        const uData = uDoc.data();
        uData.withdraws.forEach((w)=>{
            if(w.status==="Beklemede"){
                const li = document.createElement("li");
                li.innerHTML = `${uData.email} - ${w.amount} Robux - ${w.gamepass} - ${w.status} `;
                const approveBtn = document.createElement("button");
                approveBtn.innerText = "Ödendi";
                approveBtn.style.marginRight = "5px";
                approveBtn.addEventListener("click", async ()=>{
                    w.status="Ödendi";
                    await updateDoc(doc(db, "users", uDoc.id), {withdraw
