// Variables globales
let allTeams = [];
let filteredTeams = [];
let allCharacters = [];
let selectedCharacters = [];


// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando teams.js');
    checkAuth();
    loadAllCharacters().then(() => {
        loadTeams();
        setupEventListeners();
        console.log('teams.js inicializado correctamente');
    });
});

// Función para verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
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

// Configurar event listeners
function setupEventListeners() {
    // Formulario de equipo
    const teamForm = document.getElementById('teamForm');
    teamForm.addEventListener('submit', handleTeamSubmit);
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(searchTeams, 300));
}

// Función debounce para búsqueda
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Cargar equipos
async function loadTeams() {
    try {
        showLoading(true);
        
        const teams = await apiCall('/equipos', { method: 'GET' });
        console.log('Raw teams data from API:', teams);
        
        allTeams = teams;
        filteredTeams = [...allTeams];
        renderTeams();
        showLoading(false);
        
    } catch (error) {
        console.error('Error cargando equipos:', error);
        showMessage('Error cargando equipos', 'error');
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loadingMessage = document.getElementById('loadingMessage');
    const teamsGrid = document.getElementById('teamsGrid');
    const noTeamsMessage = document.getElementById('noTeamsMessage');
    
    if (show) {
        loadingMessage.classList.remove('hidden');
        teamsGrid.classList.add('hidden');
        noTeamsMessage.classList.add('hidden');
    } else {
        loadingMessage.classList.add('hidden');
        teamsGrid.classList.remove('hidden');
        
        if (filteredTeams.length === 0) {
            noTeamsMessage.classList.remove('hidden');
        }
    }
}

// Renderizar equipos
function renderTeams() {
    const teamsGrid = document.getElementById('teamsGrid');
    
    console.log('renderTeams called, filteredTeams:', filteredTeams);
    console.log('allCharacters:', allCharacters);
    
    if (filteredTeams.length === 0) {
        teamsGrid.innerHTML = '';
        return;
    }
    
    teamsGrid.innerHTML = filteredTeams.map(team => {
        console.log('Processing team:', team);
        console.log('Team fields:', Object.keys(team));
        
        // Convertir el formato del backend al formato del frontend
        const personajes = [
            { alias: team.AliasPersonaje1, type: team.Heroe_O_Villano1 === 'heroe' ? 'hero' : 'villain' },
            { alias: team.AliasPersonaje2, type: team.Heroe_O_Villano2 === 'heroe' ? 'hero' : 'villain' },
            { alias: team.AliasPersonaje3, type: team.Heroe_O_Villano3 === 'heroe' ? 'hero' : 'villain' }
        ].filter(char => char.alias); // Filtrar personajes vacíos
        
        console.log('Team personajes:', personajes);
        
        const teamType = getTeamType(personajes);
        const teamStats = calculateTeamStats(personajes);
        
        return `
            <div class="team-card">
                <div class="team-header">
                    <h3 class="team-name">Equipo #${team.id}</h3>
                    <span class="team-type ${teamType}">${getTeamTypeLabel(teamType)}</span>
                </div>
                
                <div class="team-info">
                    <p><strong>Miembros:</strong> ${personajes.length}/3</p>
                </div>
                
                <div class="team-members">
                    <h4>Miembros del Equipo:</h4>
                    <div class="team-characters-container">
                        ${personajes.map(char => {
                            console.log('Processing character:', char);
                            const characterData = getCharacterDataByAlias(char.alias, char.type);
                            console.log('Found character data:', characterData);
                            
                            if (characterData) {
                                const imageUrl = characterData.team && characterData.team.startsWith('P') ? `./personajes/${characterData.team}.png` : '';
                                console.log('Image URL:', imageUrl);
                                
                                return `
                                    <div class="team-character-card ${characterData.type}" 
                                        style="${imageUrl ? `--character-image: url('${imageUrl}')` : ''}"
                                        ${imageUrl ? 'data-image="true"' : ''}>
                                        <!-- Header de la carta -->
                                        <div class="team-character-header">
                                            <h4 class="team-character-name">${characterData.name}</h4>
                                        </div>
                                        <div class="team-character-type-container">
                                            <span class="team-character-type ${characterData.type}">${characterData.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                                        </div>
                                        
                                        <!-- Área de imagen -->
                                        <div class="team-character-image-section">
                                            <div class="team-character-skin">
                                                ${characterData.team && characterData.team.startsWith('P') ? 
                                                    `<img src="./personajes/${characterData.team}.png" alt="${characterData.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                                     <div style="display: none; align-items: center; justify-content: center; font-size: 2rem; color: #ffffff;">
                                                        ${characterData.type === 'hero' ? '🦸' : '👿'}
                                                     </div>` : 
                                                    `<div style="display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ffffff;">
                                                       ${characterData.type === 'hero' ? '🦸' : '👿'}
                                                     </div>`
                                                }
                                            </div>
                                        </div>
                                        
                                        <!-- Información del personaje -->
                                        <div class="team-character-info-section">
                                            <div class="team-character-basic-info">
                                                <div class="team-character-info-item">
                                                    <span class="team-character-info-label">Alias</span>
                                                    <span class="team-character-info-value">${characterData.alias}</span>
                                                </div>
                                                <div class="team-character-info-item">
                                                    <span class="team-character-info-label">Skin</span>
                                                    <span class="team-character-info-value">${characterData.team}</span>
                                                </div>
                                            </div>
                                            
                                            <!-- Estadísticas de combate -->
                                            <div class="team-character-stats">
                                                <div class="team-character-stats-grid">
                                                    <div class="team-character-stat-item">
                                                        <div class="team-character-stat-label">Poder</div>
                                                        <div class="team-character-stat-value">Nvl. ${characterData.poder}</div>
                                                    </div>
                                                    <div class="team-character-stat-item">
                                                        <div class="team-character-stat-label">Defensa</div>
                                                        <div class="team-character-stat-value">Nvl. ${characterData.defensa}</div>
                                                    </div>
                                                    <div class="team-character-stat-item">
                                                        <div class="team-character-stat-label">Daño Crítico</div>
                                                        <div class="team-character-stat-value">${characterData.danoCrit}%</div>
                                                    </div>
                                                    <div class="team-character-stat-item">
                                                        <div class="team-character-stat-label">Prob. Crítica</div>
                                                        <div class="team-character-stat-value">${characterData.probCrit}%</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `;
                            } else {
                                console.log('Character not found, using fallback');
                                // Fallback si no se encuentra el personaje
                                return `
                                    <div class="team-character-card ${char.type}">
                                        <div class="team-character-header">
                                            <h4 class="team-character-name">${char.alias}</h4>
                                            <span class="team-character-type ${char.type}">${char.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                                        </div>
                                        <div class="team-character-placeholder">
                                            <div style="display: flex; align-items: center; justify-content: center; font-size: 2rem; color: #ffffff;">
                                                ${char.type === 'hero' ? '🦸' : '👿'}
                                            </div>
                                        </div>
                                    </div>
                                `;
                            }
                        }).join('')}
                    </div>
                </div>
                
                <div class="team-actions">
                    <button class="btn-delete" onclick="deleteTeam(${team.id})">
                        🗑️ Eliminar
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Determinar tipo de equipo
function getTeamType(personajes) {
    if (personajes.length === 0) return 'mixed';
    
    const heroCount = personajes.filter(char => char.type === 'hero').length;
    const villainCount = personajes.filter(char => char.type === 'villain').length;
    
    if (heroCount === personajes.length) return 'heroes';
    if (villainCount === personajes.length) return 'villains';
    return 'mixed';
}

// Obtener etiqueta del tipo de equipo
function getTeamTypeLabel(type) {
    switch(type) {
        case 'heroes': return 'HÉROES';
        case 'villains': return 'VILLANOS';
        case 'mixed': return 'MIXTO';
        default: return 'MIXTO';
    }
}

// Calcular estadísticas del equipo
function calculateTeamStats(personajes) {
    // Como no tenemos los stats completos de los personajes en el equipo,
    // solo devolvemos información básica
    return {
        totalPower: personajes.length,
        totalDefense: personajes.length
    };
}

// Obtener datos completos de un personaje por alias y tipo
function getCharacterDataByAlias(alias, type) {
    console.log('getCharacterDataByAlias called with:', { alias, type });
    console.log('allCharacters length:', allCharacters ? allCharacters.length : 'undefined');
    
    if (!allCharacters || allCharacters.length === 0) {
        console.log('No characters loaded');
        return null;
    }
    
    const found = allCharacters.find(char => 
        char.alias === alias && char.type === type
    );
    
    console.log('Found character:', found);
    return found || null;
}

// Cargar todos los personajes
async function loadAllCharacters() {
    try {
        console.log('Loading all characters...');
        const [heroes, villains] = await Promise.all([
            apiCall('/heroes', { method: 'GET' }),
            apiCall('/villains', { method: 'GET' })
        ]);
        
        console.log('Heroes loaded:', heroes);
        console.log('Villains loaded:', villains);
        
        allCharacters = [
            ...heroes.map(hero => ({ ...hero, type: 'hero', uniqueId: `hero_${hero.id}` })),
            ...villains.map(villain => ({ ...villain, type: 'villain', uniqueId: `villain_${villain.id}` }))
        ];
        
        console.log('Personajes cargados:', allCharacters.length);
        console.log('All characters:', allCharacters);
    } catch (error) {
        console.error('Error cargando personajes:', error);
    }
}

// Mostrar formulario de creación
function showCreateForm() {
    selectedCharacters = [];
    
    const form = document.getElementById('createForm');
    
    // Limpiar formulario
    document.getElementById('teamForm').reset();
    document.getElementById('charactersList').innerHTML = '';
    document.getElementById('selectedCharacters').innerHTML = '';
    
    // Mostrar formulario
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
}

// Ocultar formulario
function hideCreateForm() {
    const form = document.getElementById('createForm');
    form.style.display = 'none';
    
    // Limpiar variables
    selectedCharacters = [];
}

// Cargar personajes por tipo
async function loadCharactersByType() {
    const characterType = document.getElementById('characterType').value;
    if (!characterType) return;
    
    try {
        let characters = [];
        
        if (characterType === 'mixed') {
            // Cargar héroes y villanos
            const [heroes, villains] = await Promise.all([
                apiCall('/heroes', { method: 'GET' }),
                apiCall('/villains', { method: 'GET' })
            ]);
            characters = [
                ...heroes.map(hero => ({ ...hero, type: 'hero', uniqueId: `hero_${hero.id}` })),
                ...villains.map(villain => ({ ...villain, type: 'villain', uniqueId: `villain_${villain.id}` }))
            ];
        } else {
            // Cargar solo un tipo
            const endpoint = characterType === 'hero' ? '/heroes' : '/villains';
            const chars = await apiCall(endpoint, { method: 'GET' });
            characters = chars.map(char => ({ ...char, type: characterType, uniqueId: `${characterType}_${char.id}` }));
        }
        
        allCharacters = characters;
        renderCharactersList();
        
    } catch (error) {
        console.error('Error cargando personajes:', error);
        showMessage('Error cargando personajes', 'error');
    }
}

// Renderizar lista de personajes
function renderCharactersList() {
    const charactersList = document.getElementById('charactersList');
    
    charactersList.innerHTML = allCharacters.map(character => {
        const isSelected = selectedCharacters.some(selected => selected.uniqueId === character.uniqueId);
        
                    const imageUrl = character.team && character.team.startsWith('P') ? `./personajes/${character.team}.png` : '';
            return `
                <div class="character-select-card ${character.type} ${isSelected ? 'selected' : ''}" 
                    onclick="toggleCharacterSelection('${character.uniqueId}')"
                    style="${imageUrl ? `--character-image: url('${imageUrl}')` : ''}"
                    ${imageUrl ? 'data-image="true"' : ''}>
                    <!-- Header de la carta con formas geométricas -->
                    <div class="character-select-header">
                        <h3 class="character-select-name">${character.name}</h3>
                    </div>
                    <div class="character-select-type-container">
                        <span class="character-select-type ${character.type}">${character.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                    </div>
                    
                    <!-- Área de imagen épica como fondo -->
                    <div class="character-select-image-section">
                        <div class="character-select-skin">
                            ${character.team && character.team.startsWith('P') ? 
                                `<img src="./personajes/${character.team}.png" alt="${character.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                 <div style="display: none; align-items: center; justify-content: center; font-size: 3rem; color: #ffffff;">
                                    ${character.type === 'hero' ? '🦸' : '👿'}
                                 </div>` : 
                                `<div style="display: flex; align-items: center; justify-content: center; font-size: 3rem; color: #ffffff;">
                                    ${character.type === 'hero' ? '🦸' : '👿'}
                                 </div>`
                            }
                        </div>
                    </div>
                    
                    <!-- Información del personaje -->
                    <div class="character-select-info-section">
                        <!-- Información básica -->
                        <div class="character-select-basic-info">
                            <div class="character-select-info-item">
                                <span class="character-select-info-label">Alias</span>
                                <span class="character-select-info-value">${character.alias}</span>
                            </div>
                            <div class="character-select-info-item">
                                <span class="character-select-info-label">Ciudad</span>
                                <span class="character-select-info-value">${character.city}</span>
                            </div>
                            <div class="character-select-info-item">
                                <span class="character-select-info-label">Skin</span>
                                <span class="character-select-info-value">${character.team}</span>
                            </div>
                        </div>
                        
                        <!-- Estadísticas de combate épicas -->
                        <div class="character-select-stats">
                            <div class="character-select-stats-grid">
                                <div class="character-select-stat-item">
                                    <div class="character-select-stat-label">Poder</div>
                                    <div class="character-select-stat-value">Nvl. ${character.poder}</div>
                                </div>
                                <div class="character-select-stat-item">
                                    <div class="character-select-stat-label">Defensa</div>
                                    <div class="character-select-stat-value">Nvl. ${character.defensa}</div>
                                </div>
                                <div class="character-select-stat-item">
                                    <div class="character-select-stat-label">Daño Crítico</div>
                                    <div class="character-select-stat-value">${character.danoCrit}%</div>
                                </div>
                                <div class="character-select-stat-item">
                                    <div class="character-select-stat-label">Prob. Crítica</div>
                                    <div class="character-select-stat-value">${character.probCrit}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }).join('');
}

// Alternar selección de personaje
function toggleCharacterSelection(uniqueId) {
    const character = allCharacters.find(char => char.uniqueId === uniqueId);
    if (!character) return;
    
    const isSelected = selectedCharacters.some(selected => selected.uniqueId === uniqueId);
    
    if (isSelected) {
        // Remover personaje
        selectedCharacters = selectedCharacters.filter(selected => selected.uniqueId !== uniqueId);
    } else {
        // Agregar personaje (exactamente 3)
        if (selectedCharacters.length >= 3) {
            showMessage('Ya tienes 3 personajes seleccionados', 'error');
            return;
        }
        selectedCharacters.push(character);
    }
    
    renderCharactersList();
    renderSelectedCharacters();
}

// Renderizar personajes seleccionados
function renderSelectedCharacters() {
    const selectedList = document.getElementById('selectedCharacters');
    
    selectedList.innerHTML = selectedCharacters.map(character => `
        <div class="selected-character">
            ${character.name}
            <button class="remove-btn" onclick="removeCharacter('${character.uniqueId}')">✕</button>
        </div>
    `).join('');
}

// Remover personaje de la selección
function removeCharacter(uniqueId) {
    selectedCharacters = selectedCharacters.filter(selected => selected.uniqueId !== uniqueId);
    renderCharactersList();
    renderSelectedCharacters();
}

// Manejar envío del formulario
async function handleTeamSubmit(event) {
    event.preventDefault();
    
    try {
        if (selectedCharacters.length === 0) {
            showMessage('Debes seleccionar al menos un personaje', 'error');
            return;
        }
        
        if (selectedCharacters.length !== 3) {
            showMessage('Debes seleccionar exactamente 3 personajes', 'error');
            return;
        }
        
        // Validar que tengamos exactamente 3 personajes
        if (selectedCharacters.length !== 3) {
            showMessage('Debes seleccionar exactamente 3 personajes', 'error');
            return;
        }
        
        const teamData = {
            Heroe_O_Villano1: selectedCharacters[0].type === 'hero' ? 'heroe' : 'villano',
            AliasPersonaje1: selectedCharacters[0].alias,
            Heroe_O_Villano2: selectedCharacters[1].type === 'hero' ? 'heroe' : 'villano',
            AliasPersonaje2: selectedCharacters[1].alias,
            Heroe_O_Villano3: selectedCharacters[2].type === 'hero' ? 'heroe' : 'villano',
            AliasPersonaje3: selectedCharacters[2].alias
        };
        
        // Crear nuevo equipo
        await apiCall('/equipos', {
            method: 'POST',
            body: JSON.stringify(teamData)
        });
        showMessage('Equipo creado exitosamente', 'success');
        
        // Recargar equipos y ocultar formulario
        await loadTeams();
        hideCreateForm();
        
    } catch (error) {
        console.error('Error guardando equipo:', error);
        showMessage('Error guardando equipo: ' + error.message, 'error');
    }
}



// Eliminar equipo
async function deleteTeam(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) {
        return;
    }
    
    try {
        await apiCall(`/equipos/${id}`, { method: 'DELETE' });
        
        showMessage('Equipo eliminado exitosamente', 'success');
        await loadTeams();
        
    } catch (error) {
        console.error('Error eliminando equipo:', error);
        showMessage('Error eliminando equipo: ' + error.message, 'error');
    }
}

// Buscar equipos
function searchTeams() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    filteredTeams = allTeams.filter(team => {
        const matchesSearch = team.nombre.toLowerCase().includes(searchTerm) ||
                            team.descripcion.toLowerCase().includes(searchTerm);
        
        const teamType = getTeamType(team.personajes);
        const matchesType = typeFilter === 'all' || teamType === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    renderTeams();
}

// Filtrar equipos
function filterTeams() {
    searchTeams(); // Reutilizar la lógica de búsqueda
}

// Mostrar mensajes
function showMessage(message, type = 'success') {
    // Crear elemento de mensaje
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    // Estilos del mensaje
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-family: 'Orbitron', monospace;
        font-weight: 700;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: linear-gradient(45deg, #10b981, #059669);' : 'background: linear-gradient(45deg, #ef4444, #dc2626);'}
    `;
    
    // Agregar al DOM
    document.body.appendChild(messageDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Navegar a otras páginas
function navigateTo(page) {
    window.location.href = `${page}.html`;
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
}

// Animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style); 