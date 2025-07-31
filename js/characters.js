// Variables globales
let allCharacters = [];
let filteredCharacters = [];
let currentCharacterType = null;
let editingCharacterId = null;
let selectedImageName = null;
let availableImages = ['P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008', 'P009', 'P010', 
                      'P011', 'P012', 'P013', 'P014', 'P015', 'P016', 'P017', 'P018', 'P019', 'P020'];
let isImageSelectorOpen = false; // Nueva variable para controlar el estado del modal

// Variables globales para el nuevo diseño
let currentImageIndex = 0;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado, inicializando characters.js');
    checkAuth();
    loadCharacters();
    loadAvailableImages();
    setupEventListeners();
    console.log('characters.js inicializado correctamente');
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
    console.log('setupEventListeners llamado');
    // Formulario de personaje
    const characterForm = document.getElementById('characterForm');
    console.log('characterForm encontrado:', characterForm);
    if (characterForm) {
        characterForm.addEventListener('submit', handleCharacterSubmit);
        console.log('Event listener agregado al formulario');
    }
    
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(searchCharacters, 300));
    }
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

// Cargar personajes
async function loadCharacters() {
    try {
        showLoading(true);
        
        // Cargar héroes y villanos
        const [heroes, villains] = await Promise.all([
            apiCall('/heroes', { method: 'GET' }),
            apiCall('/villains', { method: 'GET' })
        ]);
        
        // Combinar y marcar el tipo
        allCharacters = [
            ...heroes.map(hero => ({ ...hero, type: 'hero' })),
            ...villains.map(villain => ({ ...villain, type: 'villain' }))
        ];
        
        filteredCharacters = [...allCharacters];
        renderCharacters();
        showLoading(false);
        
    } catch (error) {
        console.error('Error cargando personajes:', error);
        showMessage('Error cargando personajes', 'error');
        showLoading(false);
    }
}

// Mostrar/ocultar loading
function showLoading(show) {
    const loadingMessage = document.getElementById('loadingMessage');
    const charactersGrid = document.getElementById('charactersGrid');
    const noCharactersMessage = document.getElementById('noCharactersMessage');
    
    if (show) {
        loadingMessage.classList.remove('hidden');
        charactersGrid.classList.add('hidden');
        noCharactersMessage.classList.add('hidden');
    } else {
        loadingMessage.classList.add('hidden');
        charactersGrid.classList.remove('hidden');
        
        if (filteredCharacters.length === 0) {
            noCharactersMessage.classList.remove('hidden');
        }
    }
}

// Renderizar personajes
function renderCharacters() {
    const charactersGrid = document.getElementById('charactersGrid');
    
    if (filteredCharacters.length === 0) {
        charactersGrid.innerHTML = '';
        return;
    }
    
    charactersGrid.innerHTML = filteredCharacters.map(character => `
        <div class="character-card ${character.type}">
            <!-- Header de la carta con formas geométricas -->
            <div class="character-card-header">
                <h3 class="character-name">${character.name}</h3>
                <span class="character-type-badge ${character.type}">${character.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
            </div>
            
                         <!-- Área de imagen épica como fondo -->
             <div class="character-image-section">
                 <div class="character-skin">
                     ${character.team && character.team.startsWith('P') ? 
                         `<img src="personajes/${character.team}.png" alt="${character.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                          <div style="display: none; align-items: center; justify-content: center; font-size: 5rem; color: #ffffff;">
                             ${character.type === 'hero' ? '🦸' : '👿'}
                          </div>` : 
                         `<div style="display: flex; align-items: center; justify-content: center; font-size: 5rem; color: #ffffff;">
                             ${character.type === 'hero' ? '🦸' : '👿'}
                          </div>`
                     }
                 </div>
             </div>
            
            <!-- Información del personaje -->
            <div class="character-info-section">
                <!-- Información básica -->
                <div class="character-basic-info">
                    <div class="info-item">
                        <span class="info-label">Alias</span>
                        <span class="info-value">${character.alias}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Ciudad</span>
                        <span class="info-value">${character.city}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Skin</span>
                        <span class="info-value">${character.team}</span>
                    </div>
                </div>
                
                <!-- Estadísticas de combate épicas -->
                <div class="character-stats">
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">Poder</div>
                            <div class="stat-value">Nvl. ${character.poder}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Defensa</div>
                            <div class="stat-value">Nvl. ${character.defensa}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Daño Crítico</div>
                            <div class="stat-value">${character.danoCrit}%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Prob. Crítica</div>
                            <div class="stat-value">${character.probCrit}%</div>
                        </div>
                    </div>
                </div>
                
                <!-- Botones de acción épicos -->
                <div class="character-actions">
                    <button class="btn-edit" onclick="editCharacter(${character.id}, '${character.type}')">
                        ✏️ EDITAR
                    </button>
                    <button class="btn-delete" onclick="deleteCharacter(${character.id}, '${character.type}')">
                        🗑️ ELIMINAR
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Mostrar formulario de creación
function showCreateForm(type) {
    console.log('showCreateForm llamado con tipo:', type);
    currentCharacterType = type;
    editingCharacterId = null;
    
    const createForm = document.getElementById('createForm');
    console.log('createForm encontrado:', createForm);
    if (createForm) {
        createForm.style.display = 'block';
        
        // Inicializar la vista previa del personaje
        currentImageIndex = 0;
        updateCharacterPreview();
        
        console.log('showCreateForm: después de updateCharacterPreview, campo team =', document.getElementById('team').value);
        
            // Limpiar el formulario
    document.getElementById('characterForm').reset();
    
    // Restaurar el texto del botón para crear nuevo personaje
    const submitBtn = document.querySelector('.btn-select-character');
    submitBtn.textContent = '🎮 Crear Personaje';
    
    console.log('showCreateForm: después de reset, campo team =', document.getElementById('team').value);
    
    // Restaurar el valor del campo team después del reset
    document.getElementById('team').value = selectedImageName;
        
        console.log('showCreateForm: después de restaurar, campo team =', document.getElementById('team').value);
        
        // Actualizar barras de estadísticas
        setTimeout(() => {
            updateAllStatBars();
        }, 100);
        
        // Agregar event listeners para las barras de estadísticas
        addStatBarListeners();
        
        // Scroll al formulario
        createForm.scrollIntoView({ behavior: 'smooth' });
    }
}

// Ocultar formulario
function hideCreateForm() {
    const createForm = document.getElementById('createForm');
    if (createForm) {
        createForm.style.display = 'none';
        
        // Restaurar texto del botón
        const submitBtn = document.querySelector('.btn-select-character');
        submitBtn.textContent = '🎮 Crear Personaje';
        
        // Limpiar variables
        currentCharacterType = null;
        editingCharacterId = null;
        
        // Limpiar selección de imagen
        clearImageSelection();
        
        // Cerrar modal si está abierto
        if (isImageSelectorOpen) {
            closeImageSelector();
        }
    }
}

// Manejar envío del formulario
async function handleCharacterSubmit(event) {
    console.log('handleCharacterSubmit llamado');
    event.preventDefault();
    
    try {
        console.log('Iniciando validación...');
        // Validar límites antes de enviar
        const validationErrors = validateCharacterData();
        console.log('Errores de validación:', validationErrors);
        if (validationErrors.length > 0) {
            showMessage('Errores de validación: ' + validationErrors.join(', '), 'error');
            return;
        }
        
        const characterData = {
            name: document.getElementById('nombre').value.trim(),
            alias: document.getElementById('alias').value.trim(),
            city: document.getElementById('city').value.trim(),
            team: selectedImageName, // Usar selectedImageName en lugar del campo
            golpeBasico1: parseInt(document.getElementById('golpeBasico1').value),
            golpeBasico2: parseInt(document.getElementById('golpeBasico2').value),
            golpeBasico3: parseInt(document.getElementById('golpeBasico3').value),
            danoCrit: parseInt(document.getElementById('danoCrit').value),
            probCrit: parseInt(document.getElementById('probCrit').value),
            nombreHabilidad: document.getElementById('nombreHabilidad').value.trim(),
            danoHabilidad: parseInt(document.getElementById('danoHabilidad').value),
            poder: parseInt(document.getElementById('poder').value),
            defensa: parseInt(document.getElementById('defensa').value)
        };
        
        if (editingCharacterId) {
            // Actualizar personaje existente
            const endpoint = currentCharacterType === 'hero' ? `/heroes/${editingCharacterId}` : `/villains/${editingCharacterId}`;
            await apiCall(endpoint, {
                method: 'PUT',
                body: JSON.stringify(characterData)
            });
            showMessage('Personaje actualizado exitosamente', 'success');
        } else {
            // Crear nuevo personaje
            const endpoint = currentCharacterType === 'hero' ? '/heroes' : '/villains';
            await apiCall(endpoint, {
                method: 'POST',
                body: JSON.stringify(characterData)
            });
            showMessage('Personaje creado exitosamente', 'success');
        }
        
        // Recargar personajes y ocultar formulario
        await loadCharacters();
        hideCreateForm();
        
    } catch (error) {
        console.error('Error guardando personaje:', error);
        showMessage('Error guardando personaje: ' + error.message, 'error');
    }
}

// Función para validar datos del personaje
function validateCharacterData() {
    console.log('validateCharacterData llamado');
    const errors = [];
    
    // Obtener valores
    const golpeBasico1 = parseInt(document.getElementById('golpeBasico1').value);
    const golpeBasico2 = parseInt(document.getElementById('golpeBasico2').value);
    const golpeBasico3 = parseInt(document.getElementById('golpeBasico3').value);
    const danoCrit = parseInt(document.getElementById('danoCrit').value);
    const probCrit = parseInt(document.getElementById('probCrit').value);
    const danoHabilidad = parseInt(document.getElementById('danoHabilidad').value);
    const poder = parseInt(document.getElementById('poder').value);
    const defensa = parseInt(document.getElementById('defensa').value);
    const team = document.getElementById('team').value;
    
    console.log('validateCharacterData: campo team =', team);
    console.log('validateCharacterData: selectedImageName =', selectedImageName);
    console.log('Valores obtenidos:', { golpeBasico1, golpeBasico2, golpeBasico3, danoCrit, probCrit, danoHabilidad, poder, defensa, team });
    
    // Validar que se haya seleccionado una imagen
    if (!selectedImageName || !selectedImageName.startsWith('P')) {
        console.log('Error: No se seleccionó imagen válida');
        console.log('Error: team =', team, 'selectedImageName =', selectedImageName);
        errors.push('Debes seleccionar una imagen para tu personaje');
    }
    
    // Validar golpes básicos (0-15)
    if (golpeBasico1 < 0 || golpeBasico1 > 15) errors.push('Golpe Básico 1 debe estar entre 0 y 15');
    if (golpeBasico2 < 0 || golpeBasico2 > 15) errors.push('Golpe Básico 2 debe estar entre 0 y 15');
    if (golpeBasico3 < 0 || golpeBasico3 > 15) errors.push('Golpe Básico 3 debe estar entre 0 y 15');
    
    // Validar daño crítico (0-100)
    if (danoCrit < 0 || danoCrit > 100) errors.push('Daño Crítico debe estar entre 0 y 100');
    
    // Validar probabilidad crítica (0-100)
    if (probCrit < 0 || probCrit > 100) errors.push('Probabilidad Crítica debe estar entre 0 y 100');
    
    // Validar daño de habilidad (0-50)
    if (danoHabilidad < 0 || danoHabilidad > 50) errors.push('Daño de Habilidad debe estar entre 0 y 50');
    
    // Validar poder (0-10)
    if (poder < 0 || poder > 10) errors.push('Poder debe estar entre 0 y 10');
    
    // Validar defensa (0-10)
    if (defensa < 0 || defensa > 10) errors.push('Defensa debe estar entre 0 y 10');
    
    return errors;
}

// Editar personaje
function editCharacter(id, type) {
    const character = allCharacters.find(c => c.id === id && c.type === type);
    if (!character) return;
    
    currentCharacterType = type;
    editingCharacterId = id;
    
    const form = document.getElementById('createForm');
    const submitBtn = document.querySelector('.btn-select-character');
    
    // Cambiar el texto del botón para indicar que estamos editando
    submitBtn.textContent = '💾 Actualizar Personaje';
    
    // Llenar formulario con datos del personaje usando los IDs correctos
    document.getElementById('nombre').value = character.name;
    document.getElementById('alias').value = character.alias;
    document.getElementById('city').value = character.city;
    document.getElementById('team').value = character.team;
    document.getElementById('golpeBasico1').value = character.golpeBasico1;
    document.getElementById('golpeBasico2').value = character.golpeBasico2;
    document.getElementById('golpeBasico3').value = character.golpeBasico3;
    document.getElementById('danoCrit').value = character.danoCrit;
    document.getElementById('probCrit').value = character.probCrit;
    document.getElementById('nombreHabilidad').value = character.nombreHabilidad;
    document.getElementById('danoHabilidad').value = character.danoHabilidad;
    document.getElementById('poder').value = character.poder;
    document.getElementById('defensa').value = character.defensa;
    
    // Cargar imagen seleccionada si existe
    if (character.team && character.team.startsWith('P')) {
        const characterPreview = document.getElementById('characterPreview');
        if (characterPreview) {
            characterPreview.src = `personajes/${character.team}.png`;
            characterPreview.style.display = 'block';
            selectedImageName = character.team;
            
            // Encontrar el índice de la imagen en availableImages
            const imageIndex = availableImages.indexOf(character.team);
            if (imageIndex !== -1) {
                currentImageIndex = imageIndex;
            }
        }
    } else {
        clearImageSelection();
    }
    
    // Mostrar formulario
    form.style.display = 'block';
    form.scrollIntoView({ behavior: 'smooth' });
    
    // Actualizar barras de estadísticas
    setTimeout(() => {
        updateAllStatBars();
    }, 100);
    
    // Agregar event listeners para las barras de estadísticas
    addStatBarListeners();
}

// Eliminar personaje
async function deleteCharacter(id, type) {
    if (!confirm(`¿Estás seguro de que quieres eliminar este ${type === 'hero' ? 'héroe' : 'villano'}?`)) {
        return;
    }
    
    try {
        const endpoint = type === 'hero' ? `/heroes/${id}` : `/villains/${id}`;
        await apiCall(endpoint, { method: 'DELETE' });
        
        showMessage('Personaje eliminado exitosamente', 'success');
        await loadCharacters();
        
    } catch (error) {
        console.error('Error eliminando personaje:', error);
        showMessage('Error eliminando personaje: ' + error.message, 'error');
    }
}

// Buscar personajes
function searchCharacters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    
    filteredCharacters = allCharacters.filter(character => {
        const matchesSearch = character.name.toLowerCase().includes(searchTerm) ||
                            character.alias.toLowerCase().includes(searchTerm) ||
                            character.city.toLowerCase().includes(searchTerm);
        
        const matchesType = typeFilter === 'all' || character.type === typeFilter;
        
        return matchesSearch && matchesType;
    });
    
    renderCharacters();
}

// Filtrar personajes
function filterCharacters() {
    searchCharacters(); // Reutilizar la lógica de búsqueda
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

// Funciones para el selector de imágenes
function loadAvailableImages() {
    // Simular carga de imágenes disponibles
    // En un caso real, esto vendría de una API o carpeta
    availableImages = [
        'P001', 'P002', 'P003', 'P004', 'P005', 'P006', 'P007', 'P008',
        'P009', 'P010', 'P011', 'P012', 'P013', 'P014', 'P015', 'P016',
        'P017', 'P018', 'P019', 'P020'
    ];
}

function openImageSelector() {
    // Evitar abrir múltiples modales
    if (isImageSelectorOpen) {
        return;
    }
    
    const modal = document.getElementById('imageSelectorModal');
    const imageGrid = document.getElementById('imageGrid');
    
    if (!modal || !imageGrid) {
        console.error('Modal elements not found');
        return;
    }
    
    // Limpiar selección previa
    selectedImageName = null;
    
    // Generar opciones de imágenes solo una vez
    if (imageGrid.children.length === 0) {
        imageGrid.innerHTML = availableImages.map(imageName => `
            <div class="image-option" onclick="selectImage('${imageName}')">
                <img src="personajes/${imageName}.png" alt="${imageName}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div class="image-placeholder" style="display: none;">
                    <span class="placeholder-text">${imageName}</span>
                </div>
                <div class="image-name">${imageName}</div>
            </div>
        `).join('');
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
    isImageSelectorOpen = true;
}

function selectImage(imageName) {
    // Remover selección previa
    document.querySelectorAll('.image-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Seleccionar nueva imagen
    const selectedOption = document.querySelector(`[onclick="selectImage('${imageName}')"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    selectedImageName = imageName;
}

function confirmImageSelection() {
    if (!selectedImageName) {
        showMessage('Por favor selecciona una imagen', 'error');
        return;
    }
    
    // Actualizar preview
    const preview = document.getElementById('selectedImagePreview');
    const noImageSelected = document.getElementById('noImageSelected');
    const teamInput = document.getElementById('team');
    
    if (preview && noImageSelected && teamInput) {
        preview.src = `personajes/${selectedImageName}.png`;
        preview.style.display = 'block';
        noImageSelected.style.display = 'none';
        teamInput.value = selectedImageName;
    }
    
    // Cerrar modal
    closeImageSelector();
    
    showMessage('Imagen seleccionada: ' + selectedImageName, 'success');
}

function closeImageSelector() {
    const modal = document.getElementById('imageSelectorModal');
    if (modal) {
        modal.classList.add('hidden');
        isImageSelectorOpen = false;
    }
}

// Función para limpiar selección de imagen
function clearImageSelection() {
    const characterPreview = document.getElementById('characterPreview');
    const teamInput = document.getElementById('team');
    
    if (characterPreview && teamInput) {
        characterPreview.style.display = 'none';
        teamInput.value = '';
        selectedImageName = null;
        currentImageIndex = 0;
    }
} 

// Funciones para el nuevo diseño de formulario
function previousImage() {
    if (currentImageIndex > 0) {
        currentImageIndex--;
    } else {
        currentImageIndex = availableImages.length - 1;
    }
    updateCharacterPreview();
}

function nextImage() {
    if (currentImageIndex < availableImages.length - 1) {
        currentImageIndex++;
    } else {
        currentImageIndex = 0;
    }
    updateCharacterPreview();
}

function updateCharacterPreview() {
    const characterPreview = document.getElementById('characterPreview');
    
    if (characterPreview) {
        const imageName = availableImages[currentImageIndex];
        const imagePath = `personajes/${imageName}.png`;
        
        // Actualizar la imagen
        characterPreview.src = imagePath;
        characterPreview.style.display = 'block';
        
        // Guardar la imagen seleccionada
        selectedImageName = imageName;
        document.getElementById('team').value = imageName;
        
        console.log('updateCharacterPreview: imagen seleccionada:', imageName);
        console.log('updateCharacterPreview: campo team actualizado a:', document.getElementById('team').value);
        
        // Actualizar el campo oculto para el tipo
        updateTeamField();
    }
}

function updateTeamField() {
    const teamSelect = document.getElementById('team');
    if (teamSelect && selectedImageName) {
        // Guardar el nombre de la imagen en el campo team
        teamSelect.value = selectedImageName;
    }
}

function upgradeStat(statName) {
    const input = document.getElementById(statName);
    const bar = document.getElementById(statName + 'Bar');
    
    if (input && bar) {
        let currentValue = parseInt(input.value) || 0;
        let maxValue = parseInt(input.max) || 10;
        
        if (currentValue < maxValue) {
            currentValue++;
            input.value = currentValue;
            updateStatBar(bar, currentValue, maxValue);
        }
    }
}

function updateStatBar(barElement, currentValue, maxValue) {
    if (barElement) {
        const percentage = (currentValue / maxValue) * 100;
        barElement.style.width = percentage + '%';
    }
}

// Función para actualizar todas las barras de estadísticas
function updateAllStatBars() {
    const stats = [
        { name: 'poder', max: 10 },
        { name: 'defensa', max: 10 },
        { name: 'danoHabilidad', max: 50 }
    ];
    
    stats.forEach(stat => {
        const input = document.getElementById(stat.name);
        const bar = document.getElementById(stat.name + 'Bar');
        
        if (input && bar) {
            const currentValue = parseInt(input.value) || 0;
            updateStatBar(bar, currentValue, stat.max);
        }
    });
}

function addStatBarListeners() {
    const statInputs = ['poder', 'defensa', 'danoHabilidad'];
    
    statInputs.forEach(statName => {
        const input = document.getElementById(statName);
        const bar = document.getElementById(statName + 'Bar');
        
        if (input && bar) {
            input.addEventListener('input', function() {
                const maxValue = parseInt(this.max) || 10;
                const currentValue = parseInt(this.value) || 0;
                updateStatBar(bar, currentValue, maxValue);
            });
        }
    });
}

 