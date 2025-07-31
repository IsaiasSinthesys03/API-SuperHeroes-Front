// Variables globales
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const messageDiv = document.getElementById('message');

// Función para mostrar mensajes
function showMessage(message, type = 'success') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Función para cambiar entre tabs
function showLogin() {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Buscar el botón de login específicamente
    const loginBtn = document.querySelector('.tab-btn:first-child');
    if (loginBtn) {
        loginBtn.classList.add('active');
    }
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
}

function showRegister() {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    // Buscar el botón de registro específicamente
    const registerBtn = document.querySelector('.tab-btn:last-child');
    if (registerBtn) {
        registerBtn.classList.add('active');
    }
    
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
}

// Función para hacer llamadas a la API
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API Call:', {
        url: url,
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? JSON.parse(options.body) : undefined
    });
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('Error en API call:', error);
        throw error;
    }
}

// Función de login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        // Guardar token y username
        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('username', username);
        currentUser = data.user;
        
        showMessage('¡Login exitoso! Redirigiendo...', 'success');
        
        // Redirigir al dashboard después de 2 segundos
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
        
    } catch (error) {
        showMessage(error.message || 'Error en el login', 'error');
    }
}

// Función de registro
async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    console.log('Intentando registro con:', { username, password: '***' });
    
    if (!username || !password || !confirmPassword) {
        showMessage('Por favor completa todos los campos', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Las contraseñas no coinciden', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('La contraseña debe tener al menos 6 caracteres', 'error');
        return;
    }
    
    try {
        console.log('Enviando petición a:', `${API_BASE_URL}/auth/register`);
        
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        console.log('Respuesta del servidor:', data);
        
        showMessage('¡Registro exitoso! Ahora puedes hacer login', 'success');
        
        // Cambiar a la pestaña de login de forma segura
        setTimeout(() => {
            showLogin();
            // Limpiar formulario
            registerForm.reset();
        }, 1000);
        
    } catch (error) {
        console.error('Error en registro:', error);
        showMessage(error.message || 'Error en el registro', 'error');
    }
}

// Función para verificar si ya está logueado
function checkAuth() {
    if (authToken) {
        // Si hay token, redirigir al dashboard
        window.location.href = 'dashboard.html';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación al cargar
    checkAuth();
    
    // Event listeners para formularios (solo si existen)
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Crear efecto de partículas (solo en la página de login)
    if (document.querySelector('.login-container')) {
        createParticles();
    }
});

// Función para crear partículas de fondo
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Función para logout (para usar en otras páginas)
function logout() {
    localStorage.removeItem('authToken');
    authToken = null;
    currentUser = null;
    window.location.href = 'index.html';
}

// Función para obtener el token (para usar en otras páginas)
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Función para verificar si está autenticado (para usar en otras páginas)
function isAuthenticated() {
    return !!localStorage.getItem('authToken');
} 