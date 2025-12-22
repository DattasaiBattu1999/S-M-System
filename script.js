//const API_URL = "http://localhost:3000/api";
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api"
    : "/api";

// --- 1. GLOBAL UTILITIES ---
window.logout = function() {
    localStorage.clear();
    window.location.href = 'login.html';
};



window.showSection = function(id, element) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    if (element) {
        document.querySelectorAll('.horizontal-nav li, .sidebar li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
    }
    
    // Auto-load data based on section
    if (id === 'marks') loadMarks();
    if (id === 'profile') initProfileFields();

    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
//    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    if (element) {
        document.querySelectorAll('.horizontal-nav li, .sidebar li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
    }

    // This line is what actually fills the ID field when you click the tab
    if (id === 'profile') initProfileFields();
};

// --- 2. ADMIN ACTIONS (Explicitly Global) ---
window.postAnnouncement = async function() {
    const course = document.getElementById('ann_course').value;
    const message = document.getElementById('ann_text').value;

    if (!message) return alert("Please enter a message.");

    try {
        const res = await fetch(`${API_URL}/announcements`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course, message })
        });
        const result = await res.text();
        alert(result);
        if (res.ok) document.getElementById('ann_text').value = ''; 
    } catch (err) {
        console.error("Post Error:", err);
        alert("Error posting announcement.");
    }
};

window.uploadMarks = async function() {
    const fileInput = document.getElementById('marks_file');
    if (!fileInput.files[0]) return alert("Select file first");

    const reader = new FileReader();
    reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

        try {
            const res = await fetch(`${API_URL}/upload-marks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ data: json })
            });
            alert(await res.text());
            fileInput.value = ""; 
        } catch (err) {
            alert("Upload failed.");
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
};

// --- 3. STUDENT ACTIONS ---
async function loadMarks() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const res = await fetch(`${API_URL}/get-marks/${user.student_id}`);
        const data = await res.json();
        const list = document.getElementById('marks_list');
        if (list) {
            list.innerHTML = data.map(m => `
                <tr>
                    <td>${m.subject}</td>
                    <td>${m.semester}</td>
                    <td><strong>${m.score}</strong></td>
                </tr>`).join('');
        }
    } catch (err) { console.error("Error loading marks", err); }
}

async function loadAnnouncements() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    try {
        const res = await fetch(`${API_URL}/get-announcements/${user.course}`);
        const data = await res.json();
        const list = document.getElementById('announcement_list');
        if (list) list.innerHTML = data.map(a => `<div class='card'><b>${a.course}:</b> ${a.message}</div>`).join('');
    } catch (err) { console.error("Announcement error", err); }
}

// --- 4. LOGIN HANDLER ---
window.loginHandler = async function(e, role) {
    e.preventDefault();
    const id = role === 'admin' ? document.getElementById('adminID').value : document.getElementById('s_id').value;
    const password = role === 'admin' ? document.getElementById('adminPassword').value : document.getElementById('s_pass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, id, password })
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = role === 'admin' ? 'admin_portal.html' : 'student_portal.html';
        } else {
            alert("Invalid credentials");
        }
    } catch (err) { alert("Server error."); }
};

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('student_portal.html')) {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) { window.location.href = 'login.html'; return; }
        document.getElementById('display_name').innerText = user.name;
        document.getElementById('display_course').innerText = user.course || 'N/A';
        loadAnnouncements();
    }
});

function initProfileFields() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // 1. Find the ID field
    const idField = document.getElementById('prof_id');
    
    if (idField) {
        // We try both student_id and id just in case
        idField.value = user.student_id || user.id || "N/A";
    }

    // 2. Fill the other fields
    if(document.getElementById('upd_email')) document.getElementById('upd_email').value = user.email || '';
    if(document.getElementById('upd_phone')) document.getElementById('upd_phone').value = user.phone || '';
    if(document.getElementById('upd_address')) document.getElementById('upd_address').value = user.address || '';
}

// --- 6. PASSWORD RESET HANDLER ---
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'resetForm') {
        e.preventDefault();

        const role = document.getElementById('resetRole').value;
        const id = document.getElementById('resetId').value;
        const newPass = document.getElementById('newPass').value;
        const confPass = document.getElementById('confNewPass').value;

        if (newPass !== confPass) {
            return alert("Passwords do not match!");
        }

        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, id, newPassword: newPass })
            });

            const message = await res.text();
            alert(message);

            if (res.ok) {
                window.location.href = 'login.html';
            }
        } catch (err) {
            console.error("Reset Error:", err);
            alert("Failed to connect to server.");
        }
    }
});

// --- 7. REGISTRATION HANDLER ---
document.addEventListener('submit', async (e) => {
    if (e.target && e.target.id === 'registerForm') {
        e.preventDefault();

        const role = document.getElementById('roleSelector').value;
        const name = document.getElementById('reg_name').value;
        const id = document.getElementById('reg_id').value;
        const course = document.getElementById('reg_course') ? document.getElementById('reg_course').value : '';
        const password = document.getElementById('reg_pass').value;

        try {
            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, name, id, course, password })
            });

            const result = await res.text();
            alert(result);

            if (res.ok) {
                window.location.href = 'login.html';
            }
        } catch (err) {
            console.error("Register Error:", err);
            alert("Connection error.");
        }
    }
});

// Also add the toggleFields function if it's missing
window.toggleFields = function() {
    const role = document.getElementById('roleSelector').value;
    const studentFields = document.getElementById('studentOnly');
    if (studentFields) {
        studentFields.style.display = (role === 'student') ? 'block' : 'none';
    }
};