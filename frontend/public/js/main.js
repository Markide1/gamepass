const API_URL = 'http://localhost:3001';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');

    const content = document.getElementById('content');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementsByClassName('close')[0];

    document.getElementById('loginBtn').addEventListener('click', showAuthModal);

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (event) => {
        if (event.target === modal) modal.style.display = "none";
    };

    showHome();

    function showHome() {
        content.innerHTML = `
            <h2>Welcome to Guesser Game!</h2>
            <p>Guesser Game is an exciting and unique password guessing game that will keep you on your toes!</p>
            <p>Challenge your memory and deduction skills as you try to guess passwords and uncover hidden user identities.</p>
            <p>Hint, all passwords are 4 digits! Are you ready to become the ultimate Guesser?</p>
        `;
    }

    function showAuthModal() {
        modalContent.innerHTML = `
            <div class="slider">
                <div class="tabs">
                    <button id="loginTab" class="active">Login</button>
                    <button id="registerTab">Register</button>
                </div>
                <div class="form-container">
                    <div id="loginForm" class="auth-form active">
                        <h2>Login</h2>
                        <div id="loginMessage" class="login-message"></div>
                        <form id="loginFormElement">
                            <input type="email" name="email" placeholder="Email" required>
                            <input type="password" name="password" placeholder="Password" required>
                            <button type="submit">Login</button>
                        </form>
                        <a href="#" id="forgotPasswordLink">Forgot Password?</a>
                    </div>
                    <div id="registerForm" class="auth-form">
                        <h2>Register</h2>
                        <form id="registerFormElement">
                            <input type="text" name="username" placeholder="Username" required>
                            <input type="email" name="email" placeholder="Email" required>
                            <input type="password" name="password" placeholder="Password" required>
                            <button type="submit">Register</button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = "block";

        document.getElementById('loginTab').addEventListener('click', () => toggleForms('login'));
        document.getElementById('registerTab').addEventListener('click', () => toggleForms('register'));
        document.getElementById('loginFormElement').addEventListener('submit', submitLogin);
        document.getElementById('registerFormElement').addEventListener('submit', submitRegister);
        document.getElementById('forgotPasswordLink').addEventListener('click', showForgotPasswordForm);
    }

    function toggleForms(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');

        if (formType === 'login') {
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
        } else {
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            loginTab.classList.remove('active');
            registerTab.classList.add('active');
        }
    }

    function clearForm(form) {
        form.reset();
    }

    function displayLoginMessage(message) {
        const loginMessage = document.getElementById('loginMessage');
        loginMessage.textContent = message;
        loginMessage.style.display = 'block';
    }

    function submitLogin(e) {
        e.preventDefault();
        console.log('Login attempt...');
        const email = e.target.email.value;
        const password = e.target.password.value;
        
        fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                modal.style.display = "none";
                alert('Logged in successfully!');
            } else {
                // Show a message above the email field if login fails
                const loginMessage = document.getElementById('loginMessage');
                if (data.username && data.email) {
                    loginMessage.textContent = `You've entered '${data.username}'s password. Maybe your email is '${data.email}'?`;
                } else {
                    loginMessage.textContent = data.message || 'Login failed. Please try again.';
                }
                loginMessage.style.display = 'block';
            }
            clearForm(e.target); // Clear form after submission
        })
        .catch(error => {
            console.error('Login error:', error);
            alert('Error logging in. Please try again.');
            clearForm(e.target); // Clear form even on error
        });
    }
    
    function submitRegister(e) {
        e.preventDefault();
        console.log('Signup attempt...');
        const name = e.target.username.value;
        const email = e.target.email.value;
        const password = e.target.password.value;

        fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.userId) {
                alert('Registered successfully! Please log in.');
                toggleForms('login');
            } else {
                alert('Registration failed. Please try again.');
            }
            clearForm(e.target);
        })
        .catch(error => {
            console.error('Registration error:', error);
            alert('Error registering. Please try again.');
            clearForm(e.target);
        });
    }

    function showForgotPasswordForm() {
        modalContent.innerHTML = `
            <h2>Forgot Password</h2>
            <form id="forgotPasswordForm">
                <input type="email" name="email" placeholder="Email" required>
                <button type="submit">Reset Password</button>
            </form>
        `;
        document.getElementById('forgotPasswordForm').addEventListener('submit', submitForgotPassword);
    }

    function submitForgotPassword(e) {
        e.preventDefault();
        const email = e.target.email.value;
        fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Password reset instructions sent to your email.');
            modal.style.display = "none";
            clearForm(e.target);
        })
        .catch(error => {
            alert('Error processing request. Please try again.');
            clearForm(e.target);
        });
    }
});