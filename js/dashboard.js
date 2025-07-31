// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadDashboardData();
});

// Función para verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Mostrar información del usuario (sin verificación adicional)
    const username = localStorage.getItem('username') || 'Usuario';
    document.getElementById('username').textContent = username;
}

// Función para hacer llamadas a la API
async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la petición');
        }
        
        return data;
    } catch (error) {
        console.error('Error en API call:', error);
        throw error;
    }
}

// Función para cargar datos del dashboard
async function loadDashboardData() {
    try {
        // Cargar estadísticas
        await loadStatistics();
        
    } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        showMessage('Error cargando datos', 'error');
    }
}

// Función para cargar estadísticas
async function loadStatistics() {
    try {
        // Cargar personajes
        const heroes = await apiCall('/heroes', { method: 'GET' });
        const villains = await apiCall('/villains', { method: 'GET' });
        const totalCharacters = heroes.length + villains.length;
        document.getElementById('totalCharacters').textContent = totalCharacters;
        
        // Cargar equipos
        const teams = await apiCall('/equipos', { method: 'GET' });
        document.getElementById('totalTeams').textContent = teams.length;
        
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        // Si hay error, mostrar 0 en las estadísticas
        document.getElementById('totalCharacters').textContent = '0';
        document.getElementById('totalTeams').textContent = '0';
    }
}

// Función para navegar a otras páginas
function navigateTo(page) {
    // Verificar autenticación antes de navegar
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    // Navegar a la página con extensión .html
    window.location.href = `${page}.html`;
}

// Función para mostrar mensajes
function showMessage(message, type = 'success') {
    // Crear elemento de mensaje si no existe
    let messageDiv = document.querySelector('.message');
    if (!messageDiv) {
        messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        document.body.appendChild(messageDiv);
    }
    
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Función para logout
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Función para actualizar estadísticas en tiempo real
function updateStats() {
    loadStatistics();
}

// Event listeners adicionales
document.addEventListener('keydown', function(event) {
    // Navegación con teclado
    if (event.key === 'Escape') {
        logout();
    }
});

// Función para crear efecto de partículas en el dashboard
function createDashboardParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    particlesContainer.style.zIndex = '-1';
    document.body.appendChild(particlesContainer);
    
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 6 + 's';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Crear partículas al cargar
document.addEventListener('DOMContentLoaded', function() {
    createDashboardParticles();
});

// Función para animar números
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Animar números cuando se cargan las estadísticas
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(element => {
        const target = parseInt(element.textContent) || 0;
        element.textContent = '0';
        animateNumber(element, target);
    });
}

// Llamar animación después de cargar datos
setTimeout(animateStats, 500); 