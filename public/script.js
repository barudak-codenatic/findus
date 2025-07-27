async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
            document.getElementById('register-form').reset();
            window.location.href = 'login.html';
        }
    } catch (error) {
        alert('Error saat mendaftar: ' + error.message);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            localStorage.setItem('username', result.username);
            window.location.href = 'dashboard.html';
        } else {
            alert(result.message);
        }
    } catch (error) {
        alert('Error saat masuk: ' + error.message);
    }
}

async function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Check if user is on dashboard and display username
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        const token = localStorage.getItem('token');
        const username = localStorage.getItem('username');
        if (!token) {
            window.location.href = 'login.html';
        } else {
            document.getElementById('username-display').textContent = `Hai, ${username}`;
        }
    }
});

// Popup functions
function openPopup(id) {
    const popup = document.getElementById(id);
    popup.classList.remove('hidden');
}

function closePopup(id) {
    const popup = document.getElementById(id);
    popup.classList.add('hidden');
}

// Close popup when clicking outside content
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('popup')) {
        event.target.classList.add('hidden');
    }
});