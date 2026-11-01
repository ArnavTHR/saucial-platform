// Handle Registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    const payload = {
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        real_name: document.getElementById('regRealName').value,
        anonymous_name: document.getElementById('regAnonName').value,
        flair: document.getElementById('regFlair').value,
        use_anonymous: true // Default setting for new accounts
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            document.getElementById('registerForm').reset();
            toggleForm('login');
        } else {
            alert(data.message || 'Registration failed.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server connection error.');
    }
});

// Handle Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            // Save the JWT token and user info to the browser's local storage
            localStorage.setItem('saucial_token', data.token);
            localStorage.setItem('saucial_user', JSON.stringify(data.user));
            
            alert('Login successful!');
            window.location.href = '/index.html'; // Redirect to main feed
        } else {
            alert(data.message || 'Invalid credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server connection error.');
    }
});