const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQEzYoOIxS2UkOCuHav9gDm2DTuOLdGOjb0QvXv1Ed5kAOxaVdWwOFfO3ueVpdzGYmDcibjXN4KOOkm/pub?output=csv";
const webhookUrl = "https://discordapp.com/api/webhooks/1504374388697333760/Wbp4LWwgJ6IJUw9dMs1iDOScJwsk8ZbcD1nMRxDCgCKLVpQzyz6EoULs4ip6jM4y8pNy";

let prices = {};
let selectedProduct = "";
let finalPrice = 0;
let uploadedImageBase64 = "";
let currentLang = 'mm';

async function fetchPrices() {
    try {
        const res = await fetch(sheetUrl);
        const data = await res.text();
        const rows = data.split(/\r?\n/);
        prices = {};

        for (let i = 1; i < rows.length; i++) {
            const cols = rows[i].split(',');
            if (cols[0] && cols[1]) {
                prices[cols[0].trim()] = cols[1].trim();
            }
        }
        renderContent();
    } catch (e) { console.error("Sheet Error:", e); }
}

function renderContent() {
    const specialGrid = document.getElementById('specialGrid');
    const doubleGrid = document.getElementById('doubleGrid');
    const normalGrid = document.getElementById('normalGrid');
    const paymentList = document.getElementById('paymentList');
    const contactLink = document.getElementById('contactLink');
    const contactText = document.getElementById('contactText');
    
    specialGrid.innerHTML = ""; doubleGrid.innerHTML = ""; normalGrid.innerHTML = ""; paymentList.innerHTML = "";

    Object.keys(prices).forEach(item => {
        const val = prices[item];

        if(item === "Contact") {
            if(contactLink && contactText) {
                contactText.innerText = "Contact Admin (Telegram)";
                contactLink.href = val.trim();
            }
            return;
        }

        if(item === "KPay" || item === "Wave") {
            paymentList.innerHTML += `
                <div class="payment-method">
                    <div><span style="font-size:12px; color:var(--text-muted);">${item} (Admin)</span><br>
                    <span style="font-weight:800; letter-spacing:1px;">${val}</span></div>
                    <button class="copy-btn" onclick="copyNum('${val}')">Copy</button>
                </div>`;
            return;
        }

        const price = parseInt(val);
        const cardHtml = `<div class="item-card" onclick="selectItem('${item}', ${price}, this)">
            ${item.includes('+') ? '<div class="badge-2x">2X</div>' : ''}
            <span class="diamond-val">${item.replace(' Diamonds', ' 💎')}</span>
            <span class="price-val">${price.toLocaleString()} Ks</span>
        </div>`;

        if(item.includes('Pass')) specialGrid.innerHTML += cardHtml;
        else if(item.includes('+')) doubleGrid.innerHTML += cardHtml;
        else if(item.includes('Diamonds')) normalGrid.innerHTML += cardHtml;
    });
}

function selectItem(name, price, el) {
    selectedProduct = name; finalPrice = price;
    document.getElementById('priceDisplay').innerText = price.toLocaleString() + " Ks";
    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('productError').style.display = 'none';
}

function copyNum(n) {
    navigator.clipboard.writeText(n);
    const t = document.getElementById('toast');
    t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000);
}

function setLang(l) {
    currentLang = l;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.id === 'btn-'+l));
    const langData = {
        en: { subtitle: "Instant Top-up", step1: "Account Info", uidErr: "ID Required", zidErr: "Zone Required", step2: "Select Amount", cat1: "Special Offers", cat2: "2X Diamonds", cat3: "Normal Diamonds", prodErr: "Select a package", step3: "Payment", upload: "Upload Receipt", receiptErr: "Upload Required", total: "Total", buyBtn: "Buy Now", modTitle: "Confirmation", modCancel: "Cancel", modConfirm: "Confirm", succTitle: "Success!", succDesc: "Order placed. Admin will verify soon.", toast: "Copied!" },
        mm: { subtitle: "အမြန်ဆုံးနှင့် ယုံကြည်စိတ်ချရသော Top-up", step1: "ဂိမ်းအကောင့် ထည့်ပါ", uidErr: "User ID လိုအပ်ပါသည်", zidErr: "Zone ID လိုအပ်ပါသည်", step2: "ပမာဏ ရွေးချယ်ပါ", cat1: "အထူးပရိုမိုးရှင်း", cat2: "2X စိန်များ", cat3: "ပုံမှန် စိန်များ", prodErr: "ကျေးဇူးပြု၍ ပမာဏတစ်ခု ရွေးချယ်ပါ", step3: "ငွေပေးချေမှု", upload: "ငွေလွှဲပြေစာပုံ တင်ရန် နှိပ်ပါ", receiptErr: "ကျေးဇူးပြု၍ ငွေလွှဲပြေစာ ပုံထည့်ပါ", total: "ကျသင့်ငွေ", buyBtn: "ဝယ်ယူမည်", modTitle: "အော်ဒါ အတည်ပြုခြင်း", modCancel: "ပယ်ဖျက်မည်", modConfirm: "အတည်ပြုမည်", succTitle: "အောင်မြင်ပါသည်!", succDesc: "အော်ဒါတင်ခြင်း အောင်မြင်ပါသည်။ Admin မှ စစ်ဆေးပေးပါမည်။", toast: "Copy ကူးပြီးပါပြီ" }
    };
    Object.keys(langData[l]).forEach(k => {
        const el = document.getElementById('txt-'+k);
        if(el) el.innerText = langData[l][k];
    });
}

function previewImage(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            uploadedImageBase64 = ev.target.result;
            document.getElementById('imagePreview').src = uploadedImageBase64;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadContent').style.display = 'none';
            document.getElementById('receiptError').style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

function openConfirmation() {
    const uid = document.getElementById('userId').value.trim();
    const zid = document.getElementById('zoneId').value.trim();
    let valid = true;

    if(!uid) { document.getElementById('userIdError').style.display='block'; valid=false; }
    else { document.getElementById('userIdError').style.display='none'; }
    if(!zid) { document.getElementById('zoneIdError').style.display='block'; valid=false; }
    else { document.getElementById('zoneIdError').style.display='none'; }
    if(!selectedProduct) { document.getElementById('productError').style.display='block'; valid=false; }
    if(!uploadedImageBase64) { document.getElementById('receiptError').style.display='block'; valid=false; }

    if(valid) {
        document.getElementById('sumId').innerText = uid + " ("+zid+")";
        document.getElementById('sumProduct').innerText = selectedProduct;
        document.getElementById('sumPrice').innerText = finalPrice.toLocaleString() + " Ks";
        document.getElementById('modalImgPreview').src = uploadedImageBase64;
        document.getElementById('modalOverlay').classList.add('active');
    }
}

async function submitFinalOrder() {
    const btn = document.getElementById('txt-modConfirm');
    btn.disabled = true; btn.innerText = "...";
    const uid = document.getElementById('userId').value;
    const zid = document.getElementById('zoneId').value;
    const msg = `🔔 **New Order!**\n> ID: \`${uid}\` (${zid})\n> Item: ${selectedProduct}\n> Price: ${finalPrice} Ks`;
    
    const fd = new FormData();
    fd.append('payload_json', JSON.stringify({ content: msg }));
    fd.append('file', document.getElementById('receiptImg').files[0]);

    try {
        const res = await fetch(webhookUrl, { method: 'POST', body: fd });
        if(res.ok) { closeModal(); resetForm(); document.getElementById('successOverlay').classList.add('active'); }
    } catch(e) { alert("Network Error!"); }
    finally { btn.disabled = false; btn.innerText = "Confirm"; }
}

function closeModal() { document.getElementById('modalOverlay').classList.remove('active'); }
function closeSuccess() { document.getElementById('successOverlay').classList.remove('active'); }
function resetForm() {
    document.getElementById('userId').value = ''; document.getElementById('zoneId').value = '';
    document.getElementById('receiptImg').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('uploadContent').style.display = 'block';
    document.querySelectorAll('.item-card').forEach(c => c.classList.remove('active'));
    selectedProduct = ""; finalPrice = 0; uploadedImageBase64 = "";
    document.getElementById('priceDisplay').innerText = "0 Ks";
}

window.onload = fetchPrices;