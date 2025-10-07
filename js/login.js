document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const messageContainer = document.getElementById('message-container');
    const togglePassword = document.querySelector('.toggle-password');

    // Fitur Show/Hide Password
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validasi Sederhana
        if (!password) {
            showMessage('Password cannot be empty.', 'error');
            return;
        }

        // Tampilkan Loading State
        setLoading(true);

        try {
            const response = await fetch('https://dummyjson.com/users');
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
            const data = await response.json();
            const users = data.users;
            
            // Cari user berdasarkan username
            const foundUser = users.find(user => user.username === username);

            if (foundUser) {
                // DummyJSON tidak menyediakan password yang cocok, jadi kita anggap
                // jika username ada dan password diisi, login berhasil.
                showMessage('Login successful! Redirecting...', 'success');
                
                // Simpan firstName di localStorage
                localStorage.setItem('firstName', foundUser.firstName);
                localStorage.setItem('isLoggedIn', 'true');

                // Redirect ke halaman resep setelah 1.5 detik
                setTimeout(() => {
                    window.location.href = 'recipes.html';
                }, 1500);

            } else {
                throw new Error('Invalid username or password.');
            }

        } catch (error) {
            showMessage(error.message, 'error');
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        if (isLoading) {
            loginButton.disabled = true;
            loginButton.textContent = 'SIGNING IN...';
            showMessage('Checking your credentials...', 'loading');
        } else {
            loginButton.disabled = false;
            loginButton.textContent = 'SIGN IN';
        }
    }

    function showMessage(message, type) {
        messageContainer.innerHTML = `<p class="message ${type}">${message}</p>`;
    }
});