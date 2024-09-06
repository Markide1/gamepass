document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Navigation
    document.getElementById('homeBtn').addEventListener('click', showHome);
    document.getElementById('messagesBtn').addEventListener('click', showMessages);
    document.getElementById('loginBtn').addEventListener('click', showAuthModal);

    closeBtn.onclick = () => {
        modal.style.display = "none";
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    // Initially show home
    showHome();

    function showHome() {
        content.innerHTML = `
            <h2>Welcome to Guesser Game!</h2>
            <p>Guesser Game is an exciting and unique password guessing game that will keep you on your toes!</p>
            <p>Challenge your memory and deduction skills as you try to guess passwords and uncover hidden user identities.</p>
            <p>With each attempt, you'll receive clues that will help you piece together the puzzle. Are you ready to become the ultimate Guesser?</p>
        `;
    }

    function showMessages() {
        // Fetch and display messages
        fetch('/messages')
            .then(response => response.json())
            .then(messages => {
                let messageHtml = '<h2>Messages</h2>';
                messages.forEach(msg => {
                    messageHtml += `<p><strong>${msg.user.name}:</strong> ${msg.content}</p>`;
                });
                messageHtml += '<button id="newMessageBtn">New Message</button>';
                content.innerHTML = messageHtml;

                document.getElementById('newMessageBtn').addEventListener('click', showNewMessageForm);
            })
            .catch(error => {
                content.innerHTML = '<p>Error loading messages. Please try again.</p>';
            });
    }

    function showNewMessageForm() {
        modalContent.innerHTML = `
            <h2>New Message</h2>
            <form id="newMessageForm">
                <textarea name="message" required></textarea>
                <button type="submit">Send</button>
            </form>
        `;
        modal.style.display = "block";

        document.getElementById('newMessageForm').addEventListener('submit', submitNewMessage);
    }

    function submitNewMessage(e) {
        e.preventDefault();
        const message = e.target.message.value;
        // Send message to server
        fetch('/leave-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        })
        .then(response => response.json())
        .then(data => {
            modal.style.display = "none";
            showMessages();
        })
        .catch(error => {
            alert('Error sending message. Please try again.');
        });
    }

    function showAuthModal() {
        modalContent.innerHTML = `
            <div class="auth-container">
                <div class="auth-form">
                    <h2>Login</h2>
                    <form id="loginForm">
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <a href="#" id="forgotPasswordLink">Forgot Password?</a>
                </div>
                <div class="auth-form">
                    <h2>Register</h2>
                    <form id="registerForm">
                        <input type="text" name="name" placeholder="Name" required>
                        <input type="email" name="email" placeholder="Email" required>
                        <input type="password" name="password" placeholder="Password" required>
                        <button type="submit">Register</button>
                    </form>
                </div>
            </div>
        `;
        modal.style.display = "block";

        document.getElementById('loginForm').addEventListener('submit', submitLogin);
        document.getElementById('registerForm').addEventListener('submit', submitRegister);
        document.getElementById('forgotPasswordLink').addEventListener('click', showForgotPasswordForm);
    }

    function submitLogin(e) {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        // Send login request to server
        fetch('/login', {
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
                alert(data.message || 'Login failed. Please try again.');
            }
        })
        .catch(error => {
            alert('Error logging in. Please try again.');
        });
    }

    function submitRegister(e) {
        e.preventDefault();
        const name = e.target.name.value;
        const email = e.target.email.value;
        const password = e.target.password.value;
        // Send register request to server
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.userId) {
                alert('Registered successfully! Please log in.');
                showAuthModal();
            } else {
                alert('Registration failed. Please try again.');
            }
        })
        .catch(error => {
            alert('Error registering. Please try again.');
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
        // Send forgot password request to server
        fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message || 'Password reset instructions sent to your email.');
            modal.style.display = "none";
        })
        .catch(error => {
            alert('Error processing request. Please try again.');
        });
    }
});