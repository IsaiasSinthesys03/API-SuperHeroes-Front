// Variables globales para la Arena de Batalla
let allTeams = [];
let allHeroes = [];
let allVillains = [];
let selectedTeam1 = null;
let selectedTeam2 = null;
let currentRound = 1;
let currentEnfrentamiento = null;
let battleState = {
    player1Health: 200,
    player2Health: 200,
    player1Combo: 0,
    player2Combo: 0,
    currentTurn: 1, // 1 = Jugador 1, 2 = Jugador 2
    roundResults: []
};

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Battle Arena: DOM Content Loaded');
    checkAuth();
    
    try {
        // Cargar personajes primero
        await loadAllCharacters();
        console.log('Battle Arena: Characters loaded successfully');
        
        // Luego cargar equipos
        await loadTeams();
        console.log('Battle Arena: Teams loaded successfully');
        
        // Finalmente configurar event listeners
        setupEventListeners();
        console.log('Battle Arena: Event listeners setup completed');
        
        // Verificar que los datos se cargaron correctamente
        verifyDataLoaded();
    } catch (error) {
        console.error('Battle Arena: Error during initialization:', error);
        showMessage('Error cargando datos', 'error');
    }
});

// Verificar que los datos se cargaron correctamente
function verifyDataLoaded() {
    console.log('Battle Arena: Verifying data loaded...');
    console.log('Battle Arena: allHeroes:', allHeroes ? `${allHeroes.length} heroes` : 'not loaded');
    console.log('Battle Arena: allVillains:', allVillains ? `${allVillains.length} villains` : 'not loaded');
    console.log('Battle Arena: allTeams:', allTeams ? `${allTeams.length} teams` : 'not loaded');
    
    if (allHeroes && allHeroes.length > 0) {
        console.log('Battle Arena: Sample hero data:', allHeroes[0]);
    }
    
    if (allVillains && allVillains.length > 0) {
        console.log('Battle Arena: Sample villain data:', allVillains[0]);
    }
    
    if (allTeams && allTeams.length > 0) {
        console.log('Battle Arena: Sample team data:', allTeams[0]);
    }
}

// Verificar autenticación
function checkAuth() {
    const token = localStorage.getItem('authToken');
    console.log('Battle Arena: Checking auth, token:', token ? 'exists' : 'not found');
    if (!token) {
        console.log('Battle Arena: No token found, redirecting to index');
        navigateTo('index');
        return;
    }
    console.log('Battle Arena: Auth check passed');
}

// Llamadas a la API
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('authToken');
    const url = `${window.API_BASE_URL}${endpoint}`;
    
    const config = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        ...options
    };
    
    if (options.body) {
        config.body = options.body;
    }
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Error en la API');
        }
        
        return data;
    } catch (error) {
        console.error('Error en API call:', error);
        throw error;
    }
}

// Configurar event listeners
function setupEventListeners() {
    console.log('Battle Arena: setupEventListeners called');
    
    // Botón de iniciar batalla
    const startBattleBtn = document.getElementById('startBattleBtn');
    if (startBattleBtn) {
        startBattleBtn.addEventListener('click', startBattle);
        console.log('Battle Arena: startBattleBtn event listener added');
    } else {
        console.log('Battle Arena: startBattleBtn not found');
    }
    
    // Botones de ataque
    const player1AttackBtn = document.getElementById('player1AttackBtn');
    const player2AttackBtn = document.getElementById('player2AttackBtn');
    
    if (player1AttackBtn) {
        player1AttackBtn.addEventListener('click', () => performAction(1, 'Golpear'));
        console.log('Battle Arena: player1AttackBtn event listener added');
    } else {
        console.log('Battle Arena: player1AttackBtn not found');
    }
    
    if (player2AttackBtn) {
        player2AttackBtn.addEventListener('click', () => performAction(2, 'Golpear'));
        console.log('Battle Arena: player2AttackBtn event listener added');
    } else {
        console.log('Battle Arena: player2AttackBtn not found');
    }
    
    // Botones de habilidad
    const player1SpecialBtn = document.getElementById('player1SpecialBtn');
    const player2SpecialBtn = document.getElementById('player2SpecialBtn');
    
    if (player1SpecialBtn) {
        player1SpecialBtn.addEventListener('click', () => performAction(1, 'Usar habilidad'));
        console.log('Battle Arena: player1SpecialBtn event listener added');
    } else {
        console.log('Battle Arena: player1SpecialBtn not found');
    }
    
    if (player2SpecialBtn) {
        player2SpecialBtn.addEventListener('click', () => performAction(2, 'Usar habilidad'));
        console.log('Battle Arena: player2SpecialBtn event listener added');
    } else {
        console.log('Battle Arena: player2SpecialBtn not found');
    }
    
    // Botón continuar
    const continueBtn = document.getElementById('continueBtn');
    if (continueBtn) {
        continueBtn.addEventListener('click', continueToNextRound);
        console.log('Battle Arena: continueBtn event listener added');
    } else {
        console.log('Battle Arena: continueBtn not found');
    }
    
    // Botones de volver
    const volverBtn = document.getElementById('volverBtn');
    const volverFinalBtn = document.getElementById('volverFinalBtn');
    
    console.log('Battle Arena: volverBtn element:', volverBtn);
    console.log('Battle Arena: volverFinalBtn element:', volverFinalBtn);
    
    if (volverBtn) {
        console.log('Battle Arena: Adding event listener to volverBtn');
        volverBtn.addEventListener('click', async (e) => {
            console.log('Battle Arena: volverBtn clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('Battle Arena: About to call volverAlMenu');
            await volverAlMenu();
        });
        console.log('Battle Arena: volverBtn event listener added successfully');
    } else {
        console.log('Battle Arena: volverBtn not found in DOM');
    }
    
    if (volverFinalBtn) {
        console.log('Battle Arena: Adding event listener to volverFinalBtn');
        volverFinalBtn.addEventListener('click', async (e) => {
            console.log('Battle Arena: volverFinalBtn clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('Battle Arena: About to call volverAlMenu');
            await volverAlMenu();
        });
        console.log('Battle Arena: volverFinalBtn event listener added successfully');
    } else {
        console.log('Battle Arena: volverFinalBtn not found in DOM');
    }
    
    // Botón nueva batalla
    const nuevaBatallaBtn = document.getElementById('nuevaBatallaBtn');
    console.log('Battle Arena: nuevaBatallaBtn element:', nuevaBatallaBtn);
    
    if (nuevaBatallaBtn) {
        console.log('Battle Arena: Adding event listener to nuevaBatallaBtn');
        nuevaBatallaBtn.addEventListener('click', async (e) => {
            console.log('Battle Arena: nuevaBatallaBtn clicked');
            e.preventDefault();
            e.stopPropagation();
            console.log('Battle Arena: About to call nuevaBatalla');
            await nuevaBatalla();
        });
        console.log('Battle Arena: nuevaBatallaBtn event listener added successfully');
    } else {
        console.log('Battle Arena: nuevaBatallaBtn not found in DOM');
    }
    
    console.log('Battle Arena: setupEventListeners completed');
}

// Cargar equipos
async function loadTeams() {
    try {
        console.log('Battle Arena: Loading teams...');
        allTeams = await apiCall('/equipos');
        console.log('Battle Arena: Teams loaded:', allTeams);
        
        // Solo renderizar si los personajes ya están cargados
        if (allHeroes.length > 0 || allVillains.length > 0) {
            renderTeamCards();
        } else {
            console.log('Battle Arena: Characters not loaded yet, will render when available');
        }
    } catch (error) {
        console.error('Error cargando equipos:', error);
        showMessage('Error cargando equipos', 'error');
    }
}

// Cargar todos los personajes
async function loadAllCharacters() {
    try {
        console.log('Battle Arena: Loading all characters...');
        const [heroes, villains] = await Promise.all([
            apiCall('/heroes'),
            apiCall('/villains')
        ]);
        
        // Agregar el campo type a cada personaje como en teams.js
        allHeroes = heroes.map(hero => ({ ...hero, type: 'hero' }));
        allVillains = villains.map(villain => ({ ...villain, type: 'villain' }));
        
            console.log('Battle Arena: Heroes loaded:', allHeroes.length);
    console.log('Battle Arena: Villains loaded:', allVillains.length);
    console.log('Battle Arena: Heroes data:', allHeroes);
    console.log('Battle Arena: Villains data:', allVillains);
    
    // Verificar la estructura de los datos de los personajes
    if (allHeroes.length > 0) {
        console.log('Battle Arena: First hero structure:', allHeroes[0]);
        console.log('Battle Arena: Hero fields:', Object.keys(allHeroes[0]));
    }
    if (allVillains.length > 0) {
        console.log('Battle Arena: First villain structure:', allVillains[0]);
        console.log('Battle Arena: Villain fields:', Object.keys(allVillains[0]));
    }
        
        // Verificar la estructura de los datos
        if (allHeroes.length > 0) {
            console.log('Battle Arena: First hero structure:', allHeroes[0]);
        }
        if (allVillains.length > 0) {
            console.log('Battle Arena: First villain structure:', allVillains[0]);
        }
        
        // Si los equipos ya están cargados, renderizar las cards
        if (allTeams.length > 0) {
            console.log('Battle Arena: Teams already loaded, rendering cards now');
            renderTeamCards();
        }
    } catch (error) {
        console.error('Error cargando personajes:', error);
        showMessage('Error cargando personajes', 'error');
    }
}

// Renderizar tarjetas de equipos
function renderTeamCards() {
    console.log('Battle Arena: renderTeamCards called');
    console.log('Battle Arena: allTeams length:', allTeams.length);
    console.log('Battle Arena: allHeroes length:', allHeroes.length);
    console.log('Battle Arena: allVillains length:', allVillains.length);
    
    // Verificar que todos los datos estén disponibles
    if (!allTeams || allTeams.length === 0) {
        console.log('Battle Arena: No teams available');
        return;
    }
    
    if ((!allHeroes || allHeroes.length === 0) && (!allVillains || allVillains.length === 0)) {
        console.log('Battle Arena: No characters available');
        return;
    }
    
    const team1Cards = document.getElementById('team1Cards');
    const team2Cards = document.getElementById('team2Cards');
    
    if (!team1Cards || !team2Cards) {
        console.log('Battle Arena: Team card containers not found');
        return;
    }
    
    team1Cards.innerHTML = '';
    team2Cards.innerHTML = '';
    
    allTeams.forEach((team, index) => {
        const teamIndex = index + 1; // Empezar desde 1
        const teamCard = createTeamCard(team, teamIndex);
        
        // Clonar para ambos lados
        const team1Card = teamCard.cloneNode(true);
        const team2Card = teamCard.cloneNode(true);
        
        // Event listeners para selección
        team1Card.addEventListener('click', () => selectTeam(1, team));
        team2Card.addEventListener('click', () => selectTeam(2, team));
        
        team1Cards.appendChild(team1Card);
        team2Cards.appendChild(team2Card);
    });
    
    console.log('Battle Arena: Team cards rendered successfully');
}

// Crear tarjeta de equipo - Igual que teams.html
function createTeamCard(team, teamIndex) {
    const card = document.createElement('div');
    card.className = 'team-card-battle';
    card.dataset.teamId = team.id;
    
    // Convertir formato del backend al frontend
    const personajes = [
        { alias: team.AliasPersonaje1, type: team.Heroe_O_Villano1 === 'heroe' ? 'hero' : 'villain' },
        { alias: team.AliasPersonaje2, type: team.Heroe_O_Villano2 === 'heroe' ? 'hero' : 'villain' },
        { alias: team.AliasPersonaje3, type: team.Heroe_O_Villano3 === 'heroe' ? 'hero' : 'villain' }
    ].filter(char => char.alias);
    
    const teamType = getTeamType(personajes);
    const teamStats = calculateTeamStats(personajes);
    
    card.innerHTML = `
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
                    const characterData = getCharacterDataByAlias(char.alias, char.type);
                    console.log('Processing character:', char.alias, 'Type:', char.type, 'Character data:', characterData);
                    
                    if (characterData) {
                        // Intentar diferentes formatos de imagen
                        let imageUrl = '';
                        if (characterData.team && characterData.team.startsWith('P')) {
                            imageUrl = `./personajes/${characterData.team}.png`;
                        } else if (characterData.imagen) {
                            imageUrl = characterData.imagen;
                        }
                        console.log('Image URL for', char.alias, ':', imageUrl, 'Team field:', characterData.team);
                        
                        return `
                            <div class="team-character-card ${characterData.type}" 
                                style="${imageUrl ? `--character-image: url('${imageUrl}')` : ''}"
                                ${imageUrl ? 'data-image="true"' : ''}>
                                <!-- Header de la carta -->
                                <div class="team-character-header">
                                    <h4 class="team-character-name">${characterData.name}</h4>
                                    <span class="team-character-type-badge ${characterData.type}">${characterData.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                                </div>
                                
                                <!-- Área de imagen como fondo completo -->
                                <div class="team-character-image-section">
                                    <div class="team-character-skin">
                                        ${imageUrl ? 
                                            `<img src="${imageUrl}" alt="${characterData.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                                             <div style="display: none; align-items: center; justify-content: center; font-size: 4rem; color: #ffffff;">
                                                ${characterData.type === 'hero' ? '🦸' : '👿'}
                                             </div>` : 
                                            `<div style="display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #ffffff;">
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
                        // Fallback si no se encuentra el personaje
                        return `
                            <div class="team-character-card ${char.type}">
                                <div class="team-character-header">
                                    <h4 class="team-character-name">${char.alias}</h4>
                                    <span class="team-character-type-badge ${char.type}">${char.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                                </div>
                                <div class="team-character-image-section">
                                    <div class="team-character-skin">
                                        <div style="display: flex; align-items: center; justify-content: center; font-size: 4rem; color: #ffffff;">
                                            ${char.type === 'hero' ? '🦸' : '👿'}
                                        </div>
                                    </div>
                                </div>
                                <div class="team-character-info-section">
                                    <div class="team-character-basic-info">
                                        <div class="team-character-info-item">
                                            <span class="team-character-info-label">Alias</span>
                                            <span class="team-character-info-value">${char.alias}</span>
                                        </div>
                                        <div class="team-character-info-item">
                                            <span class="team-character-info-label">Skin</span>
                                            <span class="team-character-info-value">N/A</span>
                                        </div>
                                    </div>
                                    <div class="team-character-stats">
                                        <div class="team-character-stats-grid">
                                            <div class="team-character-stat-item">
                                                <div class="team-character-stat-label">Poder</div>
                                                <div class="team-character-stat-value">Nvl. 0</div>
                                            </div>
                                            <div class="team-character-stat-item">
                                                <div class="team-character-stat-label">Defensa</div>
                                                <div class="team-character-stat-value">Nvl. 0</div>
                                            </div>
                                            <div class="team-character-stat-item">
                                                <div class="team-character-stat-label">Daño Crítico</div>
                                                <div class="team-character-stat-value">0%</div>
                                            </div>
                                            <div class="team-character-stat-item">
                                                <div class="team-character-stat-label">Prob. Crítica</div>
                                                <div class="team-character-stat-value">0%</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }
                }).join('')}
            </div>
        </div>
    `;
    
    return card;
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

// Obtener datos de un personaje por alias y tipo
function getCharacterData(alias, type) {
    const characters = type === 'hero' ? allHeroes : allVillains;
    return characters.find(char => char.alias === alias);
}

// Obtener datos completos de un personaje por alias y tipo
function getCharacterDataByAlias(alias, type) {
    console.log('getCharacterDataByAlias called with:', { alias, type });
    
    // Crear array combinado como en teams.js
    const allCharacters = [
        ...(allHeroes || []),
        ...(allVillains || [])
    ];
    
    console.log('allCharacters length:', allCharacters.length);
    console.log('Available characters:', allCharacters.map(c => ({ alias: c.alias, name: c.name, nombre: c.nombre, type: c.type })));
    
    // Verificar que los datos estén cargados
    if (!allCharacters || allCharacters.length === 0) {
        console.error('Battle Arena: No characters loaded');
        return null;
    }
    
    // Si el tipo es 'all', buscar en todos los personajes sin restricción de tipo
    if (type === 'all') {
        // Buscar por alias exacto
        let found = allCharacters.find(char => char.alias === alias);
        
        // Si no se encuentra, buscar por nombre
        if (!found) {
            found = allCharacters.find(char => char.name === alias);
        }
        
        // Si no se encuentra, buscar por campo nombre
        if (!found) {
            found = allCharacters.find(char => char.nombre === alias);
        }
        
        // Si aún no se encuentra, buscar por alias que contenga el nombre
        if (!found) {
            found = allCharacters.find(char => char.alias && char.alias.toLowerCase().includes(alias.toLowerCase()));
        }
        
        // Si aún no se encuentra, buscar por nombre que contenga el alias
        if (!found) {
            found = allCharacters.find(char => char.name && char.name.toLowerCase().includes(alias.toLowerCase()));
        }
        
        // Si aún no se encuentra, buscar por campo nombre que contenga el alias
        if (!found) {
            found = allCharacters.find(char => char.nombre && char.nombre.toLowerCase().includes(alias.toLowerCase()));
        }
        
        console.log('Found character (all types):', found);
        return found || null;
    }
    
    // Buscar por alias exacto y tipo
    let found = allCharacters.find(char => char.alias === alias && char.type === type);
    
    // Si no se encuentra, buscar por nombre y tipo
    if (!found) {
        found = allCharacters.find(char => char.name === alias && char.type === type);
    }
    
    // Si no se encuentra, buscar por campo nombre y tipo
    if (!found) {
        found = allCharacters.find(char => char.nombre === alias && char.type === type);
    }
    
    // Si aún no se encuentra, buscar por alias que contenga el nombre y tipo
    if (!found) {
        found = allCharacters.find(char => char.alias && char.alias.toLowerCase().includes(alias.toLowerCase()) && char.type === type);
    }
    
    // Si aún no se encuentra, buscar por nombre que contenga el alias y tipo
    if (!found) {
        found = allCharacters.find(char => char.name && char.name.toLowerCase().includes(alias.toLowerCase()) && char.type === type);
    }
    
    // Si aún no se encuentra, buscar por campo nombre que contenga el alias y tipo
    if (!found) {
        found = allCharacters.find(char => char.nombre && char.nombre.toLowerCase().includes(alias.toLowerCase()) && char.type === type);
    }
    
    console.log('Found character:', found);
    return found || null;
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

// Obtener nombre del personaje para un round específico
function getCharacterNameForRound(team, round) {
    if (!team) return 'Desconocido';
    
    let aliasField;
    switch(round) {
        case 1:
            aliasField = 'AliasPersonaje1';
            break;
        case 2:
            aliasField = 'AliasPersonaje2';
            break;
        case 3:
            aliasField = 'AliasPersonaje3';
            break;
        default:
            return 'Desconocido';
    }
    
    return team[aliasField] || 'Desconocido';
}

// Seleccionar equipo
function selectTeam(player, team) {
    // Deseleccionar todas las tarjetas del jugador
    const cards = document.querySelectorAll(`#team${player}Cards .team-card-battle`);
    cards.forEach(card => card.classList.remove('selected'));
    
    // Seleccionar la tarjeta clickeada
    event.target.closest('.team-card-battle').classList.add('selected');
    
    // Guardar selección
    if (player === 1) {
        selectedTeam1 = team;
    } else {
        selectedTeam2 = team;
    }
    
    // Habilitar botón de iniciar batalla si ambos equipos están seleccionados
    updateStartButton();
}

// Actualizar botón de iniciar batalla
function updateStartButton() {
    const startBtn = document.getElementById('startBattleBtn');
    if (selectedTeam1 && selectedTeam2 && selectedTeam1.id !== selectedTeam2.id) {
        startBtn.disabled = false;
    } else {
        startBtn.disabled = true;
    }
}

// Iniciar batalla
async function startBattle() {
    try {
        console.log('Battle Arena: startBattle called');
        console.log('Battle Arena: selectedTeam1:', selectedTeam1);
        console.log('Battle Arena: selectedTeam2:', selectedTeam2);
        
        // Crear enfrentamiento
        const enfrentamientoData = {
            ID_Equipo1: selectedTeam1.id,
            ID_Equipo2: selectedTeam2.id
        };
        
        console.log('Battle Arena: Creating enfrentamiento with data:', enfrentamientoData);
        
        currentEnfrentamiento = await apiCall('/enfrentamientos', {
            method: 'POST',
            body: JSON.stringify(enfrentamientoData)
        });
        
        console.log('Battle Arena: New battle started with enfrentamiento ID:', currentEnfrentamiento._id);
        console.log('Battle Arena: Full enfrentamiento object:', currentEnfrentamiento);
        console.log('Battle Arena: currentEnfrentamiento type:', typeof currentEnfrentamiento);
        console.log('Battle Arena: currentEnfrentamiento keys:', Object.keys(currentEnfrentamiento));
        
        // Mostrar pantalla VS
        showVSScreen();
        
    } catch (error) {
        console.error('Error iniciando batalla:', error);
        showMessage('Error iniciando batalla: ' + error.message, 'error');
    }
}

// Mostrar pantalla VS
async function showVSScreen() {
    hideAllScreens();
    document.getElementById('vsScreen').classList.add('active');
    
    // Actualizar información de equipos
    updateVSInfo();
    
    // Animación de VS
    setTimeout(async () => {
        await showBattleField();
    }, 3000);
}

// Actualizar información VS
function updateVSInfo() {
    // Equipo 1
    const team1Personajes = [
        { alias: selectedTeam1.AliasPersonaje1, type: selectedTeam1.Heroe_O_Villano1 === 'heroe' ? 'hero' : 'villain' },
        { alias: selectedTeam1.AliasPersonaje2, type: selectedTeam1.Heroe_O_Villano2 === 'heroe' ? 'hero' : 'villain' },
        { alias: selectedTeam1.AliasPersonaje3, type: selectedTeam1.Heroe_O_Villano3 === 'heroe' ? 'hero' : 'villain' }
    ].filter(char => char.alias);
    
    document.getElementById('team1Name').textContent = `Equipo #${selectedTeam1.id}`;
    document.getElementById('team1Member1').textContent = team1Personajes[0]?.alias || '';
    document.getElementById('team1Member2').textContent = team1Personajes[1]?.alias || '';
    document.getElementById('team1Member3').textContent = team1Personajes[2]?.alias || '';
    
    // Equipo 2
    const team2Personajes = [
        { alias: selectedTeam2.AliasPersonaje1, type: selectedTeam2.Heroe_O_Villano1 === 'heroe' ? 'hero' : 'villain' },
        { alias: selectedTeam2.AliasPersonaje2, type: selectedTeam2.Heroe_O_Villano2 === 'heroe' ? 'hero' : 'villain' },
        { alias: selectedTeam2.AliasPersonaje3, type: selectedTeam2.Heroe_O_Villano3 === 'heroe' ? 'hero' : 'villain' }
    ].filter(char => char.alias);
    
    document.getElementById('team2Name').textContent = `Equipo #${selectedTeam2.id}`;
    document.getElementById('team2Member1').textContent = team2Personajes[0]?.alias || '';
    document.getElementById('team2Member2').textContent = team2Personajes[1]?.alias || '';
    document.getElementById('team2Member3').textContent = team2Personajes[2]?.alias || '';
}

// Mostrar campo de batalla
async function showBattleField() {
    hideAllScreens();
    document.getElementById('battleField').classList.add('active');
    
    // Inicializar estado de batalla (esto ya incluye loadRoundCharacters)
    await initializeBattle();
}

// Inicializar batalla
async function initializeBattle() {
    // Cargar personajes y vidas del primer round
    await loadRoundCharacters();
    
    // Inicializar estado de batalla con las vidas obtenidas del backend
    battleState = {
        player1Health: battleState.player1Health || 200,
        player2Health: battleState.player2Health || 200,
        player1Combo: 0,
        player2Combo: 0,
        currentTurn: 1,
        roundResults: []
    };
    
    // Reiniciar barras de combo
    updateComboBar(1, 0);
    updateComboBar(2, 0);
    
    // Actualizar avatares y GIFs de personajes
    updateCharacterAvatars();
    updateCharacterGifs();
    
    updateBattleUI();
    updateBattleMessage('¡La batalla ha comenzado!');
}

// Cargar personajes del round actual
async function loadRoundCharacters() {
    // Declarar variables fuera del try-catch para que estén disponibles en todo el scope
    let player1Alias, player2Alias;
    
    try {
        // Determinar endpoint según el round
        let endpoint;
        switch(currentRound) {
            case 1:
                endpoint = '/round1/estados-vida';
                break;
            case 2:
                endpoint = '/round2jugador1/estados-vida';
                break;
            case 3:
                // Para Round 3, usar siempre el endpoint del jugador 1 (como en Round 1 y 2)
                endpoint = '/round3jugador1/estados-vida';
                break;
        }
        
        // Obtener datos del endpoint
        console.log('Battle Arena: Calling endpoint:', endpoint, 'for round:', currentRound);
        const response = await apiCall(endpoint);
        
        console.log('Battle Arena: Full response from', endpoint, ':', response);
        
        // Verificar si la respuesta es válida
        if (!response || typeof response !== 'object') {
            throw new Error('Invalid response format from endpoint');
        }
        
        // Extraer nombres de personajes y vidas
        // Interpretar datos de la misma manera que Round 1 y 2
        player1Alias = response.TuPersonaje;
        player2Alias = response.TuEnemigo;
        // Manejar ambos casos: Tuvida (Round 1) y TuVida (Round 3)
        const rawPlayer1Health = response.TuVida || response.Tuvida;
        const rawPlayer2Health = response.VidaEnemigo;
        
        // Validar que los valores sean números válidos
        const player1Health = typeof rawPlayer1Health === 'number' ? rawPlayer1Health : 0;
        const player2Health = typeof rawPlayer2Health === 'number' ? rawPlayer2Health : 0;
        
        console.log('Battle Arena: Raw response from endpoint:', response);
        console.log('Battle Arena: Available fields in response:', Object.keys(response));
        console.log('Battle Arena: Extracted health - Player 1:', player1Health, 'Player 2:', player2Health);
        console.log('Battle Arena: Extracted names - Player 1:', player1Alias, 'Player 2:', player2Alias);
        console.log('Battle Arena: Field names check - TuPersonaje:', response.TuPersonaje, 'TuVida:', response.TuVida, 'Tuvida:', response.Tuvida, 'TuEnemigo:', response.TuEnemigo, 'VidaEnemigo:', response.VidaEnemigo);
        
        // Validar que los campos necesarios estén presentes
        if (!player1Alias || !player2Alias) {
            console.error('Battle Arena: Missing character names in response');
            throw new Error('Missing character names in response');
        }
        
        if (player1Health === undefined || player2Health === undefined) {
            console.error('Battle Arena: Missing health values in response');
            throw new Error('Missing health values in response');
        }
        
        // Actualizar nombres de personajes
        console.log('Battle Arena: Setting character names - Player 1:', player1Alias, 'Player 2:', player2Alias);
        
        const player1NameElement = document.getElementById('player1Name');
        const player2NameElement = document.getElementById('player2Name');
        const player1TitleElement = document.getElementById('player1Title');
        const player2TitleElement = document.getElementById('player2Title');
        
        if (player1NameElement) {
            player1NameElement.textContent = player1Alias;
        } else {
            console.error('Battle Arena: Player 1 name element not found');
        }
        
        if (player2NameElement) {
            player2NameElement.textContent = player2Alias;
        } else {
            console.error('Battle Arena: Player 2 name element not found');
        }
        
        // Actualizar títulos de jugadores con nombres de personajes
        if (player1TitleElement) {
            player1TitleElement.textContent = `Jugador 1 - ${player1Alias}`;
        } else {
            console.error('Battle Arena: Player 1 title element not found');
        }
        
        if (player2TitleElement) {
            player2TitleElement.textContent = `Jugador 2 - ${player2Alias}`;
        } else {
            console.error('Battle Arena: Player 2 title element not found');
        }
        
        console.log('Battle Arena: Character names set successfully');
        
        // Actualizar vidas en battleState
        console.log('Battle Arena: Before assignment - player1Health:', player1Health, 'player2Health:', player2Health);
        battleState.player1Health = player1Health;
        battleState.player2Health = player2Health;
        console.log('Battle Arena: After assignment - battleState.player1Health:', battleState.player1Health, 'battleState.player2Health:', battleState.player2Health);
        
        // Actualizar barras de vida
        updateHealthBars();
        
        // Actualizar avatares según el tipo
        updateCharacterAvatars();
        
        // Actualizar GIFs de personajes
        updateCharacterGifs();
        
        // Generar cartas de personajes para battle arena
        console.log('Battle Arena: About to generate character cards for:', player1Alias, player2Alias);
        await generateBattleCharacterCards(player1Alias, player2Alias);
        
        console.log('Battle Arena: Characters loaded for round', currentRound, ':', player1Alias, 'vs', player2Alias);
        console.log('Battle Arena: Health loaded - Player 1:', player1Health, 'Player 2:', player2Health);
    } catch (error) {
        console.error('Error loading round characters for round', currentRound, ':', error);
        console.error('Error details:', error.message, error.status);
        
        // Si es error 403 (restricción de round), intentar obtener nombres de la API de todos modos
        if (error.status === 403) {
            console.log('Battle Arena: Round restriction detected for round', currentRound, ', attempting to get character names from API anyway');
            
            try {
                // Intentar obtener los nombres de la API incluso con restricción
                const response = await apiCall(endpoint);
                console.log('Battle Arena: API response despite 403:', response);
                
                if (response && response.TuPersonaje && response.TuEnemigo) {
                    // Usar los nombres de la API
                    player1Alias = response.TuPersonaje;
                    player2Alias = response.TuEnemigo;
                    console.log('Battle Arena: Using API names despite 403 - Player 1:', player1Alias, 'Player 2:', player2Alias);
                } else {
                    // Fallback a nombres de equipos seleccionados
                    switch(currentRound) {
                        case 1:
                            player1Alias = selectedTeam1.AliasPersonaje1_1;
                            player2Alias = selectedTeam2.AliasPersonaje2_1;
                            break;
                        case 2:
                            player1Alias = selectedTeam1.AliasPersonaje1_2;
                            player2Alias = selectedTeam2.AliasPersonaje2_2;
                            break;
                        case 3:
                            player1Alias = selectedTeam1.AliasPersonaje1_3;
                            player2Alias = selectedTeam2.AliasPersonaje2_3;
                            break;
                    }
                    console.log('Battle Arena: Using fallback names - Player 1:', player1Alias, 'Player 2:', player2Alias);
                }
            } catch (apiError) {
                console.log('Battle Arena: Could not get API names, using fallback');
                // Fallback a nombres de equipos seleccionados
                switch(currentRound) {
                    case 1:
                        player1Alias = selectedTeam1.AliasPersonaje1_1;
                        player2Alias = selectedTeam2.AliasPersonaje2_1;
                        break;
                    case 2:
                        player1Alias = selectedTeam1.AliasPersonaje1_2;
                        player2Alias = selectedTeam2.AliasPersonaje2_2;
                        break;
                    case 3:
                        player1Alias = selectedTeam1.AliasPersonaje1_3;
                        player2Alias = selectedTeam2.AliasPersonaje2_3;
                        break;
                }
                console.log('Battle Arena: Using fallback names - Player 1:', player1Alias, 'Player 2:', player2Alias);
            }
            
            // Actualizar nombres de personajes
            document.getElementById('player1Name').textContent = player1Alias;
            document.getElementById('player2Name').textContent = player2Alias;
            
            // Actualizar títulos de jugadores con nombres de personajes
            document.getElementById('player1Title').textContent = `Jugador 1 - ${player1Alias}`;
            document.getElementById('player2Title').textContent = `Jugador 2 - ${player2Alias}`;
            
            // Usar vidas por defecto (200/200)
            battleState.player1Health = 200;
            battleState.player2Health = 200;
            updateHealthBars();
            
            // Actualizar avatares según el tipo
            updateCharacterAvatars();
            
            // Generar cartas de personajes para battle arena
            await generateBattleCharacterCards(player1Alias || 'Personaje 1', player2Alias || 'Personaje 2');
            
            // Generar cartas de personajes para battle arena
            await generateBattleCharacterCards(player1Alias, player2Alias);
            
            console.log('Battle Arena: Using default health for round', currentRound, ':', player1Alias, 'vs', player2Alias);
        } else {
            // Fallback general: usar nombres por defecto y vidas por defecto
            console.log('Battle Arena: General error for round', currentRound, ', using fallback values');
            
            // Obtener nombres de personajes de los equipos seleccionados como fallback
            let player1Alias, player2Alias;
            switch(currentRound) {
                case 1:
                    player1Alias = selectedTeam1.AliasPersonaje1_1;
                    player2Alias = selectedTeam2.AliasPersonaje2_1;
                    break;
                case 2:
                    player1Alias = selectedTeam1.AliasPersonaje1_2;
                    player2Alias = selectedTeam2.AliasPersonaje2_2;
                    break;
                case 3:
                    player1Alias = selectedTeam1.AliasPersonaje1_3;
                    player2Alias = selectedTeam2.AliasPersonaje2_3;
                    break;
            }
            
            // Actualizar nombres de personajes
            document.getElementById('player1Name').textContent = player1Alias || 'Personaje 1';
            document.getElementById('player2Name').textContent = player2Alias || 'Personaje 2';
            
            // Actualizar títulos de jugadores con nombres de personajes
            document.getElementById('player1Title').textContent = `Jugador 1 - ${player1Alias || 'Personaje 1'}`;
            document.getElementById('player2Title').textContent = `Jugador 2 - ${player2Alias || 'Personaje 2'}`;
            
            // Usar vidas por defecto
            battleState.player1Health = 200;
            battleState.player2Health = 200;
            updateHealthBars();
            
            // Actualizar avatares según el tipo
            updateCharacterAvatars();
            
            // Generar cartas de personajes para battle arena
            await generateBattleCharacterCards(player1Alias || 'Personaje 1', player2Alias || 'Personaje 2');
        }
    }
}

// Actualizar avatares de personajes
function updateCharacterAvatars() {
    console.log('Battle Arena: Updating character avatars');
    
    // Obtener equipos seleccionados
    const player1Team = selectedTeam1;
    const player2Team = selectedTeam2;
    
    if (!player1Team || !player2Team) {
        console.log('Battle Arena: Teams not selected yet, skipping avatar update');
        return;
    }
    
    const player1Type = getCharacterType(player1Team, currentRound, 1);
    const player2Type = getCharacterType(player2Team, currentRound, 2);
    
    console.log('Battle Arena: Player 1 type:', player1Type);
    console.log('Battle Arena: Player 2 type:', player2Type);
    
    // Los avatares ya no existen en el HTML, así que solo registramos los tipos
    console.log('Battle Arena: Avatar types determined - Player 1:', player1Type, 'Player 2:', player2Type);
}

// Cargar y mostrar GIFs de personajes
function updateCharacterGifs() {
    console.log('Battle Arena: Updating character GIFs');
    
    // Obtener equipos seleccionados
    const player1Team = selectedTeam1;
    const player2Team = selectedTeam2;
    
    console.log('Battle Arena: Player 1 team:', player1Team);
    console.log('Battle Arena: Player 2 team:', player2Team);
    
    // Obtener personajes del round actual
    const player1Alias = getCharacterNameForRound(player1Team, currentRound);
    const player2Alias = getCharacterNameForRound(player2Team, currentRound);
    
    console.log('Battle Arena: Player 1 alias:', player1Alias);
    console.log('Battle Arena: Player 2 alias:', player2Alias);
    
    // Obtener datos completos de los personajes
    const player1Type = getCharacterType(player1Team, currentRound, 1);
    const player2Type = getCharacterType(player2Team, currentRound, 2);
    
    const player1Data = getCharacterDataByAlias(player1Alias, player1Type);
    const player2Data = getCharacterDataByAlias(player2Alias, player2Type);
    
    console.log('Battle Arena: Player 1 data:', player1Data);
    console.log('Battle Arena: Player 2 data:', player2Data);
    
    // Cargar GIFs
    const player1Gif = document.getElementById('player1Gif');
    const player2Gif = document.getElementById('player2Gif');
    
    if (player1Data && player1Data.team) {
        const player1GifUrl = `./gif/${player1Data.team}.gif`;
        console.log('Battle Arena: Player 1 GIF URL:', player1GifUrl);
        player1Gif.src = player1GifUrl;
        player1Gif.style.display = 'block';
        player1Gif.onerror = function() {
            console.log('Battle Arena: Player 1 GIF failed to load');
            player1Gif.style.display = 'none';
        };
    } else {
        console.log('Battle Arena: Player 1 data not found, hiding GIF');
        player1Gif.style.display = 'none';
    }
    
    if (player2Data && player2Data.team) {
        const player2GifUrl = `./gif/${player2Data.team}.gif`;
        console.log('Battle Arena: Player 2 GIF URL:', player2GifUrl);
        player2Gif.src = player2GifUrl;
        player2Gif.style.display = 'block';
        player2Gif.onerror = function() {
            console.log('Battle Arena: Player 2 GIF failed to load');
            player2Gif.style.display = 'none';
        };
    } else {
        console.log('Battle Arena: Player 2 data not found, hiding GIF');
        player2Gif.style.display = 'none';
    }
}

// Activar animación de ataque para un personaje
function triggerAttackAnimation(player, actionType = 'attack') {
    const gifElement = document.getElementById(`player${player}Gif`);
    const enemyGifElement = document.getElementById(`player${player === 1 ? 2 : 1}Gif`);
    const battleCenter = document.querySelector('.battle-center');
    
    if (gifElement && gifElement.style.display !== 'none') {
        console.log(`Battle Arena: Triggering epic ${actionType} animation for player ${player}`);
        console.log(`Battle Arena: GIF element found and visible for player ${player}`);
        
        // Remover clases anteriores si existen
        gifElement.classList.remove('attacking');
        if (enemyGifElement) enemyGifElement.classList.remove('taking-damage');
        if (battleCenter) battleCenter.classList.remove('shaking');
        
        // Forzar reflow para asegurar que la animación se ejecute
        gifElement.offsetHeight;
        
        // Agregar clases de animación
        gifElement.classList.add('attacking');
        if (battleCenter) battleCenter.classList.add('shaking');
        
        // Activar efecto de daño en el enemigo cuando el atacante colisione
        setTimeout(() => {
            if (enemyGifElement && enemyGifElement.style.display !== 'none') {
                enemyGifElement.classList.add('taking-damage');
                console.log(`Battle Arena: Enemy collision and damage effect activated`);
            }
            
            // Mostrar animación de golpe o habilidad sobre el personaje golpeado
            const enemyPlayer = player === 1 ? 2 : 1;
            const animationType = actionType === 'skill' ? 'skill' : 'hit';
            const animationElement = document.getElementById(`${animationType}AnimationPlayer${enemyPlayer}`);
            
            if (animationElement) {
                animationElement.style.display = 'block';
                console.log(`Battle Arena: ${actionType} animation G0${actionType === 'skill' ? '2' : '1'} activated over player ${enemyPlayer}`);
                
                // Ocultar la animación después de que termine
                setTimeout(() => {
                    animationElement.style.display = 'none';
                }, 1000); // La animación dura 1 segundo
            }
        }, 520); // El daño se activa cuando el atacante está en su punto máximo (65% de 0.8s)
        
        // Remover clases después de la animación
        setTimeout(() => {
            gifElement.classList.remove('attacking');
            if (enemyGifElement) enemyGifElement.classList.remove('taking-damage');
            if (battleCenter) battleCenter.classList.remove('shaking');
        }, 800);
    }
}

// Obtener tipo de personaje
function getCharacterType(team, round, player) {
    let heroField;
    switch(round) {
        case 1:
            heroField = player === 1 ? 'Heroe_O_Villano1' : 'Heroe_O_Villano1';
            break;
        case 2:
            heroField = player === 1 ? 'Heroe_O_Villano2' : 'Heroe_O_Villano2';
            break;
        case 3:
            heroField = player === 1 ? 'Heroe_O_Villano3' : 'Heroe_O_Villano3';
            break;
    }
    
    return team[heroField] === 'heroe' ? 'hero' : 'villain';
}

// Realizar acción (atacar o usar habilidad)
async function performAction(player, action) {
    try {
        // Verificar turno
        if (battleState.currentTurn !== player) {
            updateBattleMessage(`No es tu turno, Jugador ${player}!`);
            return;
        }
        
        console.log(`Battle Arena: Action "${action}" initiated for player ${player} on turn ${battleState.currentTurn}`);
        
        // Activar animación de ataque o habilidad
        console.log(`Battle Arena: Action received: "${action}" for player ${player}`);
        if (action === 'Golpear') {
            console.log(`Battle Arena: Triggering attack animation for player ${player}`);
            triggerAttackAnimation(player, 'attack');
        } else if (action === 'Usar habilidad') {
            console.log(`Battle Arena: Triggering skill animation for player ${player}`);
            triggerAttackAnimation(player, 'skill');
        } else {
            console.log(`Battle Arena: Unknown action: "${action}"`);
        }
        
        // Determinar endpoint según el round
        let endpoint;
        switch(currentRound) {
            case 1:
                endpoint = player === 1 ? '/round1/atacar' : '/round1jugador2/atacar';
                break;
            case 2:
                endpoint = player === 1 ? '/round2jugador1/atacar' : '/round2jugador2/atacar';
                break;
            case 3:
                endpoint = player === 1 ? '/round3jugador1/atacar' : '/round3jugador2/atacar';
                break;
        }
        
        // Realizar acción
        const actionData = {
            AccionRound1: action,
            AccionRound2: action,
            AccionRound3: action
        };
        
        const response = await apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(actionData)
        });
        
        // Procesar respuesta
        processActionResponse(player, action, response);
        
    } catch (error) {
        console.error('Error realizando acción:', error);
        updateBattleMessage(`Error: ${error.message}`);
    }
}

// Procesar respuesta de acción
async function processActionResponse(player, action, response) {
    console.log('Battle Arena: Processing action response for player', player, 'action:', action, 'response:', response);
    
    // Actualizar combo
    if (action === 'Golpear') {
        if (player === 1) {
            battleState.player1Combo++;
            updateComboBar(1, battleState.player1Combo);
        } else {
            battleState.player2Combo++;
            updateComboBar(2, battleState.player2Combo);
        }
    } else if (action === 'Usar habilidad') {
        if (player === 1) {
            battleState.player1Combo = 0;
            updateComboBar(1, 0);
        } else {
            battleState.player2Combo = 0;
            updateComboBar(2, 0);
        }
    }
    
    // Cambiar turno
    battleState.currentTurn = battleState.currentTurn === 1 ? 2 : 1;
    
    // Mostrar mensaje
    updateBattleMessage(response.mensaje || 'Acción realizada');
    
    // Verificar si el round terminó
    if (response.mensaje === 'YOU WIN' || response.mensaje === 'YOU LOSE') {
        console.log('Battle Arena: Round ended, handling round end');
        await handleRoundEnd(response);
    } else {
        // Actualizar estado de vida
        console.log('Battle Arena: Updating health after action');
        updateHealthFromAPI();
    }
    
    // Actualizar UI
    updateBattleUI();
}

// Actualizar barra de combo
function updateComboBar(player, combo) {
    const comboBar = document.getElementById(`player${player}Combo`);
    const comboText = comboBar.parentElement.querySelector('.combo-text');
    
    const percentage = (combo / 3) * 100;
    comboBar.style.width = `${percentage}%`;
    comboText.textContent = `Combo: ${combo}/3`;
    
    // Habilitar/deshabilitar botón de habilidad
    const specialBtn = document.getElementById(`player${player}SpecialBtn`);
    specialBtn.disabled = combo < 3;
}

// Actualizar vida desde API
async function updateHealthFromAPI() {
    try {
        let endpoint;
        switch(currentRound) {
            case 1:
                endpoint = '/round1/estados-vida';
                break;
            case 2:
                endpoint = '/round2jugador1/estados-vida';
                break;
            case 3:
                // Para Round 3, usar siempre el endpoint del jugador 1 (como en Round 1 y 2)
                endpoint = '/round3jugador1/estados-vida';
                break;
        }
        
        console.log('Battle Arena: Updating health from endpoint:', endpoint);
        const healthData = await apiCall(endpoint);
        
        console.log('Battle Arena: Health data received:', healthData);
        
        console.log('Battle Arena: updateHealthFromAPI - healthData.TuVida:', healthData.TuVida, 'healthData.Tuvida:', healthData.Tuvida, 'healthData.VidaEnemigo:', healthData.VidaEnemigo);
        
        // Interpretar datos de la misma manera que Round 1 y 2
        // Manejar ambos casos: Tuvida (Round 1) y TuVida (Round 3)
        const rawPlayer1Health = healthData.TuVida || healthData.Tuvida;
        const rawPlayer2Health = healthData.VidaEnemigo;
        
        // Validar que los valores sean números válidos
        battleState.player1Health = typeof rawPlayer1Health === 'number' ? rawPlayer1Health : 0;
        battleState.player2Health = typeof rawPlayer2Health === 'number' ? rawPlayer2Health : 0;
        
        console.log('Battle Arena: updateHealthFromAPI - After assignment - battleState.player1Health:', battleState.player1Health, 'battleState.player2Health:', battleState.player2Health);
        
        updateHealthBars();
        
    } catch (error) {
        console.error('Error actualizando vida:', error);
    }
}

// Actualizar barras de vida
function updateHealthBars() {
    const player1Health = document.getElementById('player1Health');
    const player2Health = document.getElementById('player2Health');
    const player1HealthText = document.getElementById('player1HealthText');
    const player2HealthText = document.getElementById('player2HealthText');
    
    console.log('Battle Arena: updateHealthBars - battleState.player1Health:', battleState.player1Health, 'battleState.player2Health:', battleState.player2Health);
    
    // Verificar si los valores son válidos
    if (battleState.player1Health === undefined || battleState.player1Health === null) {
        console.error('Battle Arena: player1Health is undefined/null, using 200 as fallback');
        battleState.player1Health = 200;
    }
    
    if (battleState.player2Health === undefined || battleState.player2Health === null) {
        console.error('Battle Arena: player2Health is undefined/null, using 200 as fallback');
        battleState.player2Health = 200;
    }
    
    const player1Percentage = (battleState.player1Health / 200) * 100;
    const player2Percentage = (battleState.player2Health / 200) * 100;
    
    console.log('Battle Arena: updateHealthBars - percentages - player1:', player1Percentage, 'player2:', player2Percentage);
    
    player1Health.style.width = `${player1Percentage}%`;
    player2Health.style.width = `${player2Percentage}%`;
    
    player1HealthText.textContent = `${battleState.player1Health}/200`;
    player2HealthText.textContent = `${battleState.player2Health}/200`;
    
    // Mantener color verde siempre, sin importar el nivel de vida
    player1Health.style.background = '#44ff44';
    player2Health.style.background = '#44ff44';
}

// Manejar fin de round
async function handleRoundEnd(response) {
    console.log('Battle Arena: handleRoundEnd - response:', response);
    
    try {
        // Determinar endpoint según el round
        let endpoint;
        switch(currentRound) {
            case 1:
                endpoint = '/round1/estados-vida';
                break;
            case 2:
                endpoint = '/round2jugador1/estados-vida';
                break;
            case 3:
                endpoint = '/round3jugador1/estados-vida';
                break;
        }
        
        console.log('Battle Arena: Getting final health status from:', endpoint);
        const healthData = await apiCall(endpoint);
        console.log('Battle Arena: Final health data:', healthData);
        
        // Determinar ganador basándose en las vidas reales
        let winner, loser;
        
        // Obtener vidas (manejar ambos formatos: Tuvida y TuVida)
        const player1Health = healthData.TuVida || healthData.Tuvida;
        const player2Health = healthData.VidaEnemigo;
        
        console.log('Battle Arena: Final health - Player 1:', player1Health, 'Player 2:', player2Health);
        console.log('Battle Arena: Health data fields - TuVida:', healthData.TuVida, 'Tuvida:', healthData.Tuvida, 'VidaEnemigo:', healthData.VidaEnemigo);
        
        // Validar que los valores de salud sean números válidos
        const p1Health = typeof player1Health === 'number' ? player1Health : 0;
        const p2Health = typeof player2Health === 'number' ? player2Health : 0;
        
        console.log('Battle Arena: Validated health - Player 1:', p1Health, 'Player 2:', p2Health);
        
        // Lógica corregida: quien tiene vida > 0 es el ganador
        if (p1Health > 0 && p2Health === 0) {
            // Jugador 1 tiene vida, Jugador 2 tiene 0 - Jugador 1 ganó
            winner = 1;
            loser = 2;
            console.log('Battle Arena: Player 1 wins (has health), Player 2 lost (0 health)');
        } else if (p2Health > 0 && p1Health === 0) {
            // Jugador 2 tiene vida, Jugador 1 tiene 0 - Jugador 2 ganó
            winner = 2;
            loser = 1;
            console.log('Battle Arena: Player 2 wins (has health), Player 1 lost (0 health)');
        } else if (p1Health === 0 && p2Health === 0) {
            // Empate - ambos perdieron
            winner = 1; // Por defecto
            loser = 2;
            console.log('Battle Arena: Both players lost (tie), defaulting to Player 1 win');
        } else if (p1Health > 0 && p2Health > 0) {
            // Ambos tienen vida - usar lógica de mensaje
            console.log('Battle Arena: Both players have health, using message-based logic');
            if (response.mensaje === 'YOU WIN') {
                winner = battleState.currentTurn;
                loser = battleState.currentTurn === 1 ? 2 : 1;
            } else if (response.mensaje === 'YOU LOSE') {
                loser = battleState.currentTurn;
                winner = battleState.currentTurn === 1 ? 2 : 1;
            } else {
                console.error('Battle Arena: Cannot determine winner from health or message');
                return;
            }
        } else {
            // Caso inesperado - usar lógica de mensaje como fallback
            console.log('Battle Arena: Unexpected health values, using message-based logic as fallback');
            if (response.mensaje === 'YOU WIN') {
                winner = battleState.currentTurn;
                loser = battleState.currentTurn === 1 ? 2 : 1;
            } else if (response.mensaje === 'YOU LOSE') {
                loser = battleState.currentTurn;
                winner = battleState.currentTurn === 1 ? 2 : 1;
            } else {
                console.error('Battle Arena: Cannot determine winner');
                return;
            }
        }
        
        console.log('Battle Arena: Round end - Winner:', winner, 'Loser:', loser);
        
        // Guardar resultado del round
        battleState.roundResults.push({
            round: currentRound,
            winner: winner,
            loser: loser
        });
        
        // Mostrar pantalla de resultados
        showRoundResults(winner, loser);
        
    } catch (error) {
        console.error('Battle Arena: Error determining winner from health data:', error);
        
        // Fallback a lógica de mensaje si falla la consulta de salud
        console.log('Battle Arena: Using message-based logic as fallback');
        let winner, loser;
        
        if (response.mensaje === 'YOU WIN') {
            winner = battleState.currentTurn;
            loser = battleState.currentTurn === 1 ? 2 : 1;
        } else if (response.mensaje === 'YOU LOSE') {
            loser = battleState.currentTurn;
            winner = battleState.currentTurn === 1 ? 2 : 1;
        } else {
            console.error('Battle Arena: Cannot determine winner');
            return;
        }
        
        console.log('Battle Arena: Fallback - Winner:', winner, 'Loser:', loser);
        
        // Guardar resultado del round
        battleState.roundResults.push({
            round: currentRound,
            winner: winner,
            loser: loser
        });
        
        // Mostrar pantalla de resultados
        showRoundResults(winner, loser);
    }
}

// Mostrar resultados del round
async function showRoundResults(winner, loser) {
    hideAllScreens();
    document.getElementById('roundResults').classList.add('active');
    
    // Actualizar información
    document.getElementById('roundResultTitle').textContent = `ROUND ${currentRound} COMPLETADO`;
    
    // Obtener los nombres actuales de los personajes que están combatiendo
    const player1CurrentName = document.getElementById('player1Name').textContent;
    const player2CurrentName = document.getElementById('player2Name').textContent;
    
    console.log('Battle Arena: Current character names - Player 1:', player1CurrentName, 'Player 2:', player2CurrentName);
    
    // Obtener los nombres correctos desde los equipos seleccionados
    const winnerTeam = winner === 1 ? selectedTeam1 : selectedTeam2;
    const loserTeam = loser === 1 ? selectedTeam1 : selectedTeam2;
    
    const winnerCharacterName = getCharacterNameForRound(winnerTeam, currentRound);
    const loserCharacterName = getCharacterNameForRound(loserTeam, currentRound);
    
    console.log('Battle Arena: Winner character name from team:', winnerCharacterName);
    console.log('Battle Arena: Loser character name from team:', loserCharacterName);
    
    // Verificar qué personajes están disponibles en los equipos
    console.log('Battle Arena: Winner team data:', winnerTeam);
    console.log('Battle Arena: Loser team data:', loserTeam);
    
    const winnerName = winnerCharacterName || player1CurrentName;
    const loserName = loserCharacterName || player2CurrentName;
    
    console.log('Battle Arena: showRoundResults - Winner:', winner, 'Winner Name:', winnerName, 'Loser:', loser, 'Loser Name:', loserName);
    
    // Obtener los elementos de resultado
    const winnerSide = document.getElementById('winnerSide');
    const loserSide = document.getElementById('loserSide');
    
    // Verificar que los elementos existen antes de intentar acceder a ellos
    if (!winnerSide || !loserSide) {
        console.error('Battle Arena: winnerSide or loserSide elements not found');
        return;
    }
    
    // Obtener datos de los personajes para crear las cards
    console.log('Battle Arena: Looking for winner character:', winnerName, 'Type:', winner === 1 ? 'hero' : 'villain');
    console.log('Battle Arena: Looking for loser character:', loserName, 'Type:', loser === 1 ? 'hero' : 'villain');
    
    // Verificar si los datos están cargados, si no, recargarlos
    if (!allHeroes || allHeroes.length === 0 || !allVillains || allVillains.length === 0) {
        console.log('Battle Arena: Characters not loaded, reloading...');
        await loadAllCharacters();
    }
    
    // Determinar el tipo correcto de personaje basado en el equipo
    const winnerCharacterType = getCharacterTypeFromTeam(winnerTeam, currentRound, winner);
    const loserCharacterType = getCharacterTypeFromTeam(loserTeam, currentRound, loser);
    
    console.log('Battle Arena: Winner character type:', winnerCharacterType);
    console.log('Battle Arena: Loser character type:', loserCharacterType);
    
    // Intentar obtener los datos completos de los personajes desde la API
    let winnerCharacter = getCharacterDataByAlias(winnerName, winnerCharacterType);
    let loserCharacter = getCharacterDataByAlias(loserName, loserCharacterType);
    
    // Si no se encuentran, intentar obtener desde la API directamente
    if (!winnerCharacter) {
        console.log('Battle Arena: Winner character not found in local data, trying API...');
        try {
            const winnerType = winnerCharacterType === 'hero' ? 'heroes' : 'villains';
            const winnerResponse = await apiCall(`/${winnerType}`);
            winnerCharacter = winnerResponse.find(char => char.alias === winnerName || char.name === winnerName || char.nombre === winnerName);
            console.log('Battle Arena: Winner character from API:', winnerCharacter);
        } catch (error) {
            console.error('Battle Arena: Error fetching winner character from API:', error);
        }
    }
    
    if (!loserCharacter) {
        console.log('Battle Arena: Loser character not found in local data, trying API...');
        try {
            const loserType = loserCharacterType === 'hero' ? 'heroes' : 'villains';
            const loserResponse = await apiCall(`/${loserType}`);
            loserCharacter = loserResponse.find(char => char.alias === loserName || char.name === loserName || char.nombre === loserName);
            console.log('Battle Arena: Loser character from API:', loserCharacter);
        } catch (error) {
            console.error('Battle Arena: Error fetching loser character from API:', error);
        }
    }
    
    console.log('Battle Arena: Winner character data:', winnerCharacter);
    console.log('Battle Arena: Loser character data:', loserCharacter);
    
    // Verificar los campos específicos de imagen
    if (winnerCharacter) {
        console.log('Battle Arena: Winner character image fields:', {
            team: winnerCharacter.team,
            imagen: winnerCharacter.imagen,
            alias: winnerCharacter.alias,
            nombre: winnerCharacter.nombre
        });
    }
    
    if (loserCharacter) {
        console.log('Battle Arena: Loser character image fields:', {
            team: loserCharacter.team,
            imagen: loserCharacter.imagen,
            alias: loserCharacter.alias,
            nombre: loserCharacter.nombre
        });
    }
    
    if (winnerCharacter) {
        console.log('Battle Arena: Winner character details:', {
            alias: winnerCharacter.alias,
            name: winnerCharacter.name,
            nombre: winnerCharacter.nombre,
            team: winnerCharacter.team,
            imagen: winnerCharacter.imagen,
            ataque: winnerCharacter.ataque,
            defensa: winnerCharacter.defensa,
            velocidad: winnerCharacter.velocidad,
            energia: winnerCharacter.energia
        });
    }
    
    if (loserCharacter) {
        console.log('Battle Arena: Loser character details:', {
            alias: loserCharacter.alias,
            name: loserCharacter.name,
            nombre: loserCharacter.nombre,
            team: loserCharacter.team,
            imagen: loserCharacter.imagen,
            ataque: loserCharacter.ataque,
            defensa: loserCharacter.defensa,
            velocidad: loserCharacter.velocidad,
            energia: loserCharacter.energia
        });
    }
    
    // Verificar si se encontraron los datos
    if (!winnerCharacter) {
        console.error('Battle Arena: Winner character not found for:', winnerName);
    }
    if (!loserCharacter) {
        console.error('Battle Arena: Loser character not found for:', loserName);
    }
    
    // Obtener el equipo correcto desde los datos del equipo
    const winnerTeamCode = getCharacterTeamFromTeam(winnerTeam, currentRound, winner);
    const loserTeamCode = getCharacterTeamFromTeam(loserTeam, currentRound, loser);
    
    console.log('Battle Arena: Winner team code:', winnerTeamCode);
    console.log('Battle Arena: Loser team code:', loserTeamCode);
    
    // Agregar el código de equipo a los datos de los personajes si no lo tienen
    if (winnerCharacter && winnerTeamCode) {
        winnerCharacter.team = winnerTeamCode;
    }
    if (loserCharacter && loserTeamCode) {
        loserCharacter.team = loserTeamCode;
    }
    
    // Crear cards de personajes
    console.log('Battle Arena: Creating winner card for:', winnerName);
    console.log('Battle Arena: Creating loser card for:', loserName);
    
    const winnerCard = createCharacterCard(winnerCharacter, 'winner', winnerName);
    const loserCard = createCharacterCard(loserCharacter, 'loser', loserName);
    
    console.log('Battle Arena: Winner card classes:', winnerCard.className);
    console.log('Battle Arena: Loser card classes:', loserCard.className);
    
    // Limpiar contenedores y agregar las cards
    const winnerCardContainer = winnerSide.querySelector('.winner-card-container');
    const loserCardContainer = loserSide.querySelector('.loser-card-container');
    
    console.log('Battle Arena: Winner card container found:', !!winnerCardContainer);
    console.log('Battle Arena: Loser card container found:', !!loserCardContainer);
    
    if (winnerCardContainer && loserCardContainer) {
        winnerCardContainer.innerHTML = '';
        loserCardContainer.innerHTML = '';
        winnerCardContainer.appendChild(winnerCard);
        loserCardContainer.appendChild(loserCard);
        console.log('Battle Arena: Character cards created and added to containers');
    } else {
        console.error('Battle Arena: Card containers not found');
        console.error('Battle Arena: winnerCardContainer:', winnerCardContainer);
        console.error('Battle Arena: loserCardContainer:', loserCardContainer);
    }
    
    // Aplicar estilos según quién ganó
    if (winner === 2) {
        // Si el Jugador 2 ganó, el ganador va a la derecha
        console.log('Battle Arena: Player 2 won, winner goes to the right');
        
        // Intercambiar las cards físicamente
        const tempCard = winnerCardContainer.innerHTML;
        winnerCardContainer.innerHTML = loserCardContainer.innerHTML;
        loserCardContainer.innerHTML = tempCard;
        
        // Actualizar las clases CSS de las cards después del intercambio
        const rightCard = loserCardContainer.querySelector('.team-character-card');
        const leftCard = winnerCardContainer.querySelector('.team-character-card');
        
        if (rightCard) {
            rightCard.classList.remove('loser');
            rightCard.classList.add('winner');
            console.log('Battle Arena: Right card updated to winner');
        }
        if (leftCard) {
            leftCard.classList.remove('winner');
            leftCard.classList.add('loser');
            console.log('Battle Arena: Left card updated to loser');
        }
        
        console.log('Battle Arena: Player 2 winner - Winner on right, Loser on left');
        
    } else {
        // Si el Jugador 1 ganó, el ganador va a la izquierda
        console.log('Battle Arena: Player 1 won, winner stays on left');
    }
}

// Crear card de personaje para resultados
function createCharacterCard(characterData, resultType, fallbackName = 'Unknown') {
    if (!characterData) {
        console.error('Battle Arena: No character data provided for card creation, using fallback');
        // Crear una card básica con el nombre de respaldo
        const card = document.createElement('div');
        card.className = 'team-character-card';
        card.classList.add('hero'); // Default a hero
        
        card.innerHTML = `
            <div class="team-character-header">
                <div class="team-character-name">${fallbackName}</div>
                <div class="team-character-type-badge hero">Héroe</div>
                ${resultType === 'winner' ? '<div class="round-result-badge winner">VICTORIA</div>' : '<div class="round-result-badge loser">DERROTADO</div>'}
            </div>
            
            <div class="team-character-image-section">
                <div class="team-character-skin">
                    <div style="width: 100%; height: 150px; background: linear-gradient(135deg, #666, #999); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem;">Sin Imagen</div>
                </div>
            </div>
            
            <div class="team-character-info-section">
                <div class="team-character-basic-info">
                    <div class="team-character-info-item">
                        <span class="team-character-info-label">Alias:</span>
                        <span class="team-character-info-value">${fallbackName}</span>
                    </div>
                    <div class="team-character-info-item">
                        <span class="team-character-info-label">Skin</span>
                        <span class="team-character-info-value">N/A</span>
                    </div>
                </div>
                
                <div class="team-character-stats">
                    <div class="team-character-stats-grid">
                        <div class="team-character-stat-item">
                            <span class="team-character-stat-label">Poder</span>
                            <span class="team-character-stat-value">Nvl. ${characterData.poder || 'N/A'}</span>
                        </div>
                        <div class="team-character-stat-item">
                            <span class="team-character-stat-label">Defensa</span>
                            <span class="team-character-stat-value">Nvl. ${characterData.defensa || 'N/A'}</span>
                        </div>
                        <div class="team-character-stat-item">
                            <span class="team-character-stat-label">Daño Crítico</span>
                            <span class="team-character-stat-value">${characterData.danoCrit || 'N/A'}%</span>
                        </div>
                        <div class="team-character-stat-item">
                            <span class="team-character-stat-label">Prob. Crítica</span>
                            <span class="team-character-stat-value">${characterData.probCrit || 'N/A'}%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar clase específica según el resultado
        if (resultType === 'winner') {
            card.classList.add('winner');
        } else if (resultType === 'loser') {
            card.classList.add('loser');
        }
        
        console.log(`Battle Arena: Fallback character card created for ${fallbackName} (${resultType})`);
        return card;
    }
    
    const card = document.createElement('div');
    card.className = 'team-character-card';
    card.classList.add(characterData.type || 'hero');
    
    // Agregar clase específica según el resultado
    if (resultType === 'winner') {
        card.classList.add('winner');
    } else if (resultType === 'loser') {
        card.classList.add('loser');
    }
    
    // Determinar la imagen del personaje
    let imageUrl = '';
    
    // Intentar obtener el equipo desde los datos del personaje
    if (characterData.team) {
        imageUrl = `./personajes/${characterData.team}.png`;
    } else if (characterData.imagen) {
        imageUrl = characterData.imagen;
    } else if (characterData.alias) {
        // Intentar con el alias como nombre de archivo
        imageUrl = `./personajes/${characterData.alias}.png`;
    }
    
    // Si no se encuentra imagen, intentar con el alias como equipo
    if (!imageUrl && characterData.alias) {
        // Verificar si el alias es un código de equipo (P001, P002, etc.)
        if (characterData.alias.match(/^P\d{3}$/)) {
            imageUrl = `./personajes/${characterData.alias}.png`;
        }
    }
    
    console.log('Battle Arena: Image URL for character:', characterData.nombre || characterData.alias, ':', imageUrl);
    console.log('Battle Arena: Character data for image:', { team: characterData.team, imagen: characterData.imagen, alias: characterData.alias });
    
    // Aplicar imagen de fondo si existe
    if (imageUrl) {
        card.style.setProperty('--character-image', `url('${imageUrl}')`);
        card.setAttribute('data-image', 'true');
        console.log('Battle Arena: Applied background image:', imageUrl);
    } else {
        console.log('Battle Arena: No image URL found for character');
    }
    
    // Crear el contenido de la card
    const resultBadge = resultType === 'winner' ? 
        '<div class="round-result-badge winner">VICTORIA</div>' : 
        '<div class="round-result-badge loser">DERROTADO</div>';
    console.log('Battle Arena: Creating card for', characterData.nombre || characterData.alias, 'Result type:', resultType, 'Result badge:', resultBadge);
    
    card.innerHTML = `
        <div class="team-character-header">
            <div class="team-character-name">${characterData.nombre || characterData.alias || 'Unknown'}</div>
            <div class="team-character-type-badge ${characterData.type || 'hero'}">
                ${characterData.type === 'villain' ? 'Villano' : 'Héroe'}
            </div>
            ${resultBadge}
        </div>
        
        <div class="team-character-image-section">
            <div class="team-character-skin">
                <img src="${imageUrl}" alt="${characterData.nombre || characterData.alias}" onerror="this.style.display='none'">
            </div>
        </div>
        
        <div class="team-character-info-section">
            <div class="team-character-basic-info">
                <div class="team-character-info-item">
                    <span class="team-character-info-label">Alias:</span>
                    <span class="team-character-info-value">${characterData.alias || 'N/A'}</span>
                </div>
                <div class="team-character-info-item">
                    <span class="team-character-info-label">Skin</span>
                    <span class="team-character-info-value">${characterData.team || 'N/A'}</span>
                </div>
            </div>
            
            <div class="team-character-stats">
                <div class="team-character-stats-grid">
                    <div class="team-character-stat-item">
                        <span class="team-character-stat-label">Poder</span>
                        <span class="team-character-stat-value">Nvl. ${characterData.poder || 'N/A'}</span>
                    </div>
                    <div class="team-character-stat-item">
                        <span class="team-character-stat-label">Defensa</span>
                        <span class="team-character-stat-value">Nvl. ${characterData.defensa || 'N/A'}</span>
                    </div>
                    <div class="team-character-stat-item">
                        <span class="team-character-stat-label">Daño Crítico</span>
                        <span class="team-character-stat-value">${characterData.danoCrit || 'N/A'}%</span>
                    </div>
                    <div class="team-character-stat-item">
                        <span class="team-character-stat-label">Prob. Crítica</span>
                        <span class="team-character-stat-value">${characterData.probCrit || 'N/A'}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Agregar clase especial según el resultado
    if (resultType === 'winner') {
        card.classList.add('winner-card');
    } else if (resultType === 'loser') {
        card.classList.add('loser-card');
    }
    
    console.log(`Battle Arena: Character card created for ${characterData.nombre || characterData.alias} (${resultType})`);
    return card;
}

// Función para crear cartas de personajes en battle arena
function createBattleCharacterCard(characterData, playerNumber) {
    console.log('Battle Arena: Creating battle character card for player', playerNumber, 'with data:', characterData);
    
    // Obtener datos del personaje
    const characterName = characterData?.nombre || characterData?.alias || 'Unknown';
    const characterType = characterData?.tipo || 'Unknown';
    const characterAlias = characterData?.alias || 'N/A';
    
    // Estadísticas del personaje
    const poder = characterData?.poder || 0;
    const defensa = characterData?.defensa || 0;
    const danoCrit = characterData?.danoCrit || 0;
    const probCrit = characterData?.probCrit || 0;
    
    console.log('Battle Arena: Battle character card data:', {
        name: characterName,
        type: characterType,
        alias: characterAlias,
        team: characterData.team,
        stats: { poder, defensa, danoCrit, probCrit }
    });
    
    // Crear la carta HTML para battle arena - SOLO UN CONTENEDOR CON IMAGEN
    const cardHTML = `
        <img src="personajes/${characterData.team}.png" alt="${characterName}" style="width: 100%; height: 100%; object-fit: cover; object-position: center; border: 2px solid var(--battle-gold); border-radius: 15px; box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);" onerror="this.style.display='none';">
    `;
    
    console.log('Battle Arena: Battle character card HTML created for player', playerNumber);
    return cardHTML;
}

// Función para generar las cartas de personajes en battle arena
async function generateBattleCharacterCards(player1Alias, player2Alias) {
    console.log('Battle Arena: Generating battle character cards for:', player1Alias, 'and', player2Alias);
    
    try {
        // Obtener tipos de personajes desde los equipos seleccionados
        const player1Type = getCharacterType(selectedTeam1, currentRound, 1);
        const player2Type = getCharacterType(selectedTeam2, currentRound, 2);
        
        console.log('Battle Arena: Player 1 type:', player1Type);
        console.log('Battle Arena: Player 2 type:', player2Type);
        
        // Obtener datos de los personajes elegidos con sus tipos correctos
        const player1Data = await getCharacterDataByAlias(player1Alias, player1Type);
        const player2Data = await getCharacterDataByAlias(player2Alias, player2Type);
        
        console.log('Battle Arena: Player 1 data:', player1Data);
        console.log('Battle Arena: Player 2 data:', player2Data);
        
        // Actualizar imágenes directamente
        const player1Image = document.getElementById('player1Image');
        const player2Image = document.getElementById('player2Image');
        
        console.log('Battle Arena: Player 1 image found:', !!player1Image);
        console.log('Battle Arena: Player 2 image found:', !!player2Image);
        
        // Crear datos básicos para las imágenes
        const player1BasicData = player1Data || { 
            nombre: player1Alias, 
            alias: player1Alias, 
            team: 'P001',
            tipo: player1Type || 'hero'
        };
        
        const player2BasicData = player2Data || { 
            nombre: player2Alias, 
            alias: player2Alias, 
            team: 'P002',
            tipo: player2Type || 'villain'
        };
        
        console.log('Battle Arena: Player 1 basic data:', player1BasicData);
        console.log('Battle Arena: Player 2 basic data:', player2BasicData);
        
        if (player1Image) {
            player1Image.src = `personajes/${player1BasicData.team}.png`;
            player1Image.alt = player1BasicData.nombre;
            console.log('Battle Arena: Player 1 image set to:', player1Image.src);
        } else {
            console.error('Battle Arena: Player 1 image not found');
        }
        
        if (player2Image) {
            player2Image.src = `personajes/${player2BasicData.team}.png`;
            player2Image.alt = player2BasicData.nombre;
            console.log('Battle Arena: Player 2 image set to:', player2Image.src);
        } else {
            console.error('Battle Arena: Player 2 image not found');
        }
        
        console.log('Battle Arena: Battle character cards generated successfully');
    } catch (error) {
        console.error('Battle Arena: Error generating battle character cards:', error);
    }
}

// Obtener el tipo de personaje desde el equipo
function getCharacterTypeFromTeam(team, round, player) {
    if (!team) {
        console.error('Battle Arena: No team provided for character type');
        return 'hero'; // Default
    }
    
    let heroField;
    switch(round) {
        case 1:
            heroField = 'Heroe_O_Villano1';
            break;
        case 2:
            heroField = 'Heroe_O_Villano2';
            break;
        case 3:
            heroField = 'Heroe_O_Villano3';
            break;
        default:
            return 'hero';
    }
    
    const characterType = team[heroField];
    console.log(`Battle Arena: Character type for round ${round}, player ${player}:`, characterType);
    
    return characterType === 'heroe' ? 'hero' : 'villain';
}

// Obtener el código de equipo del personaje desde el equipo
function getCharacterTeamFromTeam(team, round, player) {
    if (!team) {
        console.error('Battle Arena: No team provided for character team code');
        return null;
    }
    
    let teamField;
    switch(round) {
        case 1:
            teamField = 'Equipo1';
            break;
        case 2:
            teamField = 'Equipo2';
            break;
        case 3:
            teamField = 'Equipo3';
            break;
        default:
            return null;
    }
    
    const teamCode = team[teamField];
    console.log(`Battle Arena: Character team code for round ${round}, player ${player}:`, teamCode);
    
    return teamCode;
}

// Crear cards de ganadores para la pantalla de resultados finales
async function createWinnerCards(peleaFinalizada, playerNames) {
    console.log('Battle Arena: Creando cards de ganadores...');
    
    try {
        // Round 1
        if (peleaFinalizada.Round1) {
            const round1Winner = peleaFinalizada.Round1 === 'Jugador 1' ? 1 : 2;
            const round1WinnerName = peleaFinalizada.Round1 === 'Jugador 1' ? 
                playerNames.round1Player1Name : 
                playerNames.round1Player2Name;
            const round1WinnerTeam = peleaFinalizada.Round1 === 'Jugador 1' ? selectedTeam1 : selectedTeam2;
            
            await createWinnerCard(1, round1WinnerName, round1WinnerTeam, round1Winner);
        }
        
        // Round 2
        if (peleaFinalizada.Round2) {
            const round2Winner = peleaFinalizada.Round2 === 'Jugador 1' ? 1 : 2;
            const round2WinnerName = peleaFinalizada.Round2 === 'Jugador 1' ? 
                playerNames.round2Player1Name : 
                playerNames.round2Player2Name;
            const round2WinnerTeam = peleaFinalizada.Round2 === 'Jugador 1' ? selectedTeam1 : selectedTeam2;
            
            await createWinnerCard(2, round2WinnerName, round2WinnerTeam, round2Winner);
        }
        
        // Round 3
        if (peleaFinalizada.Round3) {
            const round3Winner = peleaFinalizada.Round3 === 'Jugador 1' ? 1 : 2;
            const round3WinnerName = peleaFinalizada.Round3 === 'Jugador 1' ? 
                playerNames.round3Player1Name : 
                playerNames.round3Player2Name;
            const round3WinnerTeam = peleaFinalizada.Round3 === 'Jugador 1' ? selectedTeam1 : selectedTeam2;
            
            await createWinnerCard(3, round3WinnerName, round3WinnerTeam, round3Winner);
        }
        
        console.log('Battle Arena: Cards de ganadores creadas exitosamente');
    } catch (error) {
        console.error('Battle Arena: Error creando cards de ganadores:', error);
    }
}

// Crear card de ganador individual
async function createWinnerCard(roundNumber, winnerName, winnerTeam, winnerPlayer) {
    console.log(`Battle Arena: Creando card para Round ${roundNumber}, Ganador: ${winnerName}`);
    
    try {
        // Obtener datos del personaje ganador
        const winnerCharacterType = getCharacterTypeFromTeam(winnerTeam, roundNumber, winnerPlayer);
        const winnerCharacterData = getCharacterDataByAlias(winnerName, winnerCharacterType);
        
        // Si no se encuentra localmente, intentar obtener desde la API
        let characterData = winnerCharacterData;
        if (!characterData) {
            console.log(`Battle Arena: No se encontró ${winnerName} localmente, buscando en API...`);
            try {
                const heroes = await apiCall('/heroes');
                const villains = await apiCall('/villains');
                
                const allCharacters = [
                    ...(heroes || []).map(hero => ({ ...hero, type: 'hero' })),
                    ...(villains || []).map(villain => ({ ...villain, type: 'villain' }))
                ];
                
                characterData = allCharacters.find(char => 
                    char.alias === winnerName || 
                    char.name === winnerName || 
                    char.nombre === winnerName
                );
            } catch (apiError) {
                console.error('Battle Arena: Error obteniendo datos desde API:', apiError);
            }
        }
        
        // Obtener el código de equipo
        const winnerTeamCode = getCharacterTeamFromTeam(winnerTeam, roundNumber, winnerPlayer);
        
        // Agregar el código de equipo a los datos del personaje
        if (characterData && winnerTeamCode) {
            characterData.team = winnerTeamCode;
        }
        
        // Crear la card
        const cardContainer = document.getElementById(`round${roundNumber}WinnerCard`);
        if (cardContainer) {
            const card = createCharacterCard(characterData, 'winner', winnerName);
            cardContainer.innerHTML = '';
            cardContainer.appendChild(card);
            
            console.log(`Battle Arena: Card creada para Round ${roundNumber}`);
        }
    } catch (error) {
        console.error(`Battle Arena: Error creando card para Round ${roundNumber}:`, error);
    }
}

// Crear cards de ganadores usando datos locales (fallback)
async function createWinnerCardsFromLocalData() {
    console.log('Battle Arena: Creando cards de ganadores usando datos locales...');
    
    try {
        battleState.roundResults.forEach((roundResult, index) => {
            const roundNumber = index + 1;
            const winnerName = getCharacterNameForRound(
                roundResult.winner === 1 ? selectedTeam1 : selectedTeam2, 
                roundNumber
            );
            const winnerTeam = roundResult.winner === 1 ? selectedTeam1 : selectedTeam2;
            const winnerPlayer = roundResult.winner;
            
            createWinnerCard(roundNumber, winnerName, winnerTeam, winnerPlayer);
        });
    } catch (error) {
        console.error('Battle Arena: Error creando cards con datos locales:', error);
    }
}

// Continuar al siguiente round
async function continueToNextRound() {
    currentRound++;
    
    if (currentRound > 3) {
        // Mostrar estadísticas finales
        await showFinalStats();
    } else {
        // Continuar al siguiente round
        await showBattleField();
        // Los personajes ya se cargan en showBattleField
        
        // Reiniciar combos para el nuevo round
        battleState.player1Combo = 0;
        battleState.player2Combo = 0;
        updateComboBar(1, 0);
        updateComboBar(2, 0);
        
        // Actualizar avatares y GIFs para el nuevo round
        updateCharacterAvatars();
        updateCharacterGifs();
        
        console.log('Battle Arena: Combo bars reset for round', currentRound);
    }
}

// Mostrar estadísticas finales
async function showFinalStats() {
    hideAllScreens();
    document.getElementById('finalStats').classList.add('active');
    
    try {
        // Obtener estadísticas desde el endpoint
        const estadisticas = await apiCall('/estadisticas');
        console.log('Battle Arena: Estadísticas obtenidas:', estadisticas);
        
        if (estadisticas && estadisticas.length > 0) {
            // Tomar la pelea más reciente
            const peleaFinalizada = estadisticas[0];
            
            // Obtener nombres de personajes para cada round
            const round1Player1Name = getCharacterNameForRound(selectedTeam1, 1);
            const round1Player2Name = getCharacterNameForRound(selectedTeam2, 1);
            const round2Player1Name = getCharacterNameForRound(selectedTeam1, 2);
            const round2Player2Name = getCharacterNameForRound(selectedTeam2, 2);
            const round3Player1Name = getCharacterNameForRound(selectedTeam1, 3);
            const round3Player2Name = getCharacterNameForRound(selectedTeam2, 3);
            
            // Actualizar ganador final
            const finalWinner = peleaFinalizada.Ganador === 'Jugador 1' ? 1 : 2;
            const finalWinnerName = finalWinner === 1 ? 
                'Jugador 1' : 
                'Jugador 2';
            
            // Obtener nombre del personaje ganador final
            let finalWinnerCharacterName = '';
            if (finalWinner === 1) {
                // Determinar qué round ganó el jugador 1 para obtener el personaje correcto
                if (peleaFinalizada.Round1 === 'Jugador 1') {
                    finalWinnerCharacterName = round1Player1Name;
                } else if (peleaFinalizada.Round2 === 'Jugador 1') {
                    finalWinnerCharacterName = round2Player1Name;
                } else if (peleaFinalizada.Round3 === 'Jugador 1') {
                    finalWinnerCharacterName = round3Player1Name;
                }
            } else {
                // Determinar qué round ganó el jugador 2 para obtener el personaje correcto
                if (peleaFinalizada.Round1 === 'Jugador 2') {
                    finalWinnerCharacterName = round1Player2Name;
                } else if (peleaFinalizada.Round2 === 'Jugador 2') {
                    finalWinnerCharacterName = round2Player2Name;
                } else if (peleaFinalizada.Round3 === 'Jugador 2') {
                    finalWinnerCharacterName = round3Player2Name;
                }
            }
            
            document.getElementById('finalWinnerName').textContent = `${finalWinnerName} (${finalWinnerCharacterName})`;
            
            // Actualizar resultados de cada round
            if (peleaFinalizada.Round1) {
                const round1Winner = peleaFinalizada.Round1 === 'Jugador 1' ? 
                    'Jugador 1' : 
                    'Jugador 2';
                const round1WinnerName = peleaFinalizada.Round1 === 'Jugador 1' ? 
                    round1Player1Name : 
                    round1Player2Name;
                document.getElementById('round1Result').textContent = `Ganador: ${round1Winner} (${round1WinnerName})`;
            }
            
            if (peleaFinalizada.Round2) {
                const round2Winner = peleaFinalizada.Round2 === 'Jugador 1' ? 
                    'Jugador 1' : 
                    'Jugador 2';
                const round2WinnerName = peleaFinalizada.Round2 === 'Jugador 1' ? 
                    round2Player1Name : 
                    round2Player2Name;
                document.getElementById('round2Result').textContent = `Ganador: ${round2Winner} (${round2WinnerName})`;
            }
            
            if (peleaFinalizada.Round3) {
                const round3Winner = peleaFinalizada.Round3 === 'Jugador 1' ? 
                    'Jugador 1' : 
                    'Jugador 2';
                const round3WinnerName = peleaFinalizada.Round3 === 'Jugador 1' ? 
                    round3Player1Name : 
                    round3Player2Name;
                document.getElementById('round3Result').textContent = `Ganador: ${round3Winner} (${round3WinnerName})`;
            }
            
            // Crear cards de ganadores para cada round
            await createWinnerCards(peleaFinalizada, {
                round1Player1Name,
                round1Player2Name,
                round2Player1Name,
                round2Player2Name,
                round3Player1Name,
                round3Player2Name
            });
            
            console.log('Battle Arena: Estadísticas finales actualizadas correctamente');
        } else {
            console.error('Battle Arena: No se encontraron estadísticas');
            
            // Crear cards de ganadores usando datos locales
            await createWinnerCardsFromLocalData();
            // Fallback a la lógica anterior si no hay estadísticas
            const team1Wins = battleState.roundResults.filter(r => r.winner === 1).length;
            const team2Wins = battleState.roundResults.filter(r => r.winner === 2).length;
            
            const finalWinner = team1Wins > team2Wins ? 1 : 2;
            const finalWinnerName = finalWinner === 1 ? 
                'Jugador 1' : 
                'Jugador 2';
            
            // Obtener nombre del personaje ganador final (usando el primer round ganado)
            const finalWinnerRound = battleState.roundResults.find(r => r.winner === finalWinner);
            let finalWinnerCharacterName = '';
            if (finalWinnerRound) {
                finalWinnerCharacterName = getCharacterNameForRound(
                    finalWinner === 1 ? selectedTeam1 : selectedTeam2, 
                    finalWinnerRound.round
                );
            }
            
            document.getElementById('finalWinnerName').textContent = `${finalWinnerName} (${finalWinnerCharacterName})`;
            
            // Actualizar resultados de cada round
            battleState.roundResults.forEach(result => {
                const roundElement = document.getElementById(`round${result.round}Result`);
                const winnerName = result.winner === 1 ? 
                    'Jugador 1' : 
                    'Jugador 2';
                const winnerCharacterName = getCharacterNameForRound(
                    result.winner === 1 ? selectedTeam1 : selectedTeam2, 
                    result.round
                );
                roundElement.textContent = `Ganador: ${winnerName} (${winnerCharacterName})`;
            });
        }
    } catch (error) {
        console.error('Battle Arena: Error obteniendo estadísticas:', error);
        // Fallback a la lógica anterior en caso de error
        const team1Wins = battleState.roundResults.filter(r => r.winner === 1).length;
        const team2Wins = battleState.roundResults.filter(r => r.winner === 2).length;
        
        const finalWinner = team1Wins > team2Wins ? 1 : 2;
        const finalWinnerName = finalWinner === 1 ? 
            'Jugador 1' : 
            'Jugador 2';
        
        // Obtener nombre del personaje ganador final (usando el primer round ganado)
        const finalWinnerRound = battleState.roundResults.find(r => r.winner === finalWinner);
        let finalWinnerCharacterName = '';
        if (finalWinnerRound) {
            finalWinnerCharacterName = getCharacterNameForRound(
                finalWinner === 1 ? selectedTeam1 : selectedTeam2, 
                finalWinnerRound.round
            );
        }
        
        document.getElementById('finalWinnerName').textContent = `${finalWinnerName} (${finalWinnerCharacterName})`;
        
        // Actualizar resultados de cada round
        battleState.roundResults.forEach(result => {
            const roundElement = document.getElementById(`round${result.round}Result`);
            const winnerName = result.winner === 1 ? 
                'Jugador 1' : 
                'Jugador 2';
            const winnerCharacterName = getCharacterNameForRound(
                result.winner === 1 ? selectedTeam1 : selectedTeam2, 
                result.round
            );
            roundElement.textContent = `Ganador: ${winnerName} (${winnerCharacterName})`;
        });
    }
}

// Limpiar bordes dorados de turno
function clearTurnBorders() {
    const player1Side = document.querySelector('.player-side.left');
    const player2Side = document.querySelector('.player-side.right');
    if (player1Side) player1Side.classList.remove('active-turn');
    if (player2Side) player2Side.classList.remove('active-turn');
}

// Actualizar UI de batalla
function updateBattleUI() {
    // Actualizar botones según el turno
    const player1AttackBtn = document.getElementById('player1AttackBtn');
    const player2AttackBtn = document.getElementById('player2AttackBtn');
    const player1SpecialBtn = document.getElementById('player1SpecialBtn');
    const player2SpecialBtn = document.getElementById('player2SpecialBtn');
    
    // Obtener elementos de los jugadores para el borde dorado
    const player1Side = document.querySelector('.player-side.left');
    const player2Side = document.querySelector('.player-side.right');
    
    if (battleState.currentTurn === 1) {
        // Turno del Jugador 1
        player1AttackBtn.disabled = false;
        player1SpecialBtn.disabled = battleState.player1Combo < 3;
        player2AttackBtn.disabled = true;
        player2SpecialBtn.disabled = true;
        
        // Aplicar borde dorado al Jugador 1
        if (player1Side) {
            player1Side.classList.add('active-turn');
            player2Side.classList.remove('active-turn');
        }
    } else {
        // Turno del Jugador 2
        player1AttackBtn.disabled = true;
        player1SpecialBtn.disabled = true;
        player2AttackBtn.disabled = false;
        player2SpecialBtn.disabled = battleState.player2Combo < 3;
        
        // Aplicar borde dorado al Jugador 2
        if (player2Side) {
            player2Side.classList.add('active-turn');
            player1Side.classList.remove('active-turn');
        }
    }
    
    // Actualizar indicadores de round
    document.querySelectorAll('.round-indicator').forEach((indicator, index) => {
        indicator.classList.toggle('active', index + 1 === currentRound);
    });
    
    document.getElementById('roundTitle').textContent = `ROUND ${currentRound}`;
}

// Actualizar mensaje de batalla
function updateBattleMessage(message) {
    const battleMessage = document.getElementById('battleMessage');
    battleMessage.textContent = message;
    
    // Mostrar el mensaje
    battleMessage.style.display = 'block';
    
    // Efectos visuales
    const effects = document.querySelectorAll('.battle-effects > div');
    effects.forEach(effect => {
        effect.classList.add('active');
        setTimeout(() => effect.classList.remove('active'), 500);
    });
    
    // Ocultar el mensaje después de 3 segundos con animación
    setTimeout(() => {
        battleMessage.style.animation = 'messageDisappear 0.3s ease-in';
        setTimeout(() => {
            battleMessage.style.display = 'none';
            battleMessage.style.animation = 'messageAppear 0.3s ease-out';
        }, 300);
    }, 3000);
}

// Ocultar todas las pantallas
function hideAllScreens() {
    document.querySelectorAll('.battle-screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Resetear batalla
function resetBattle() {
    currentRound = 1;
    selectedTeam1 = null;
    selectedTeam2 = null;
    currentEnfrentamiento = null;
    battleState = {
        player1Health: 200,
        player2Health: 200,
        player1Combo: 0,
        player2Combo: 0,
        currentTurn: 1,
        roundResults: []
    };
    
    // Limpiar selecciones
    document.querySelectorAll('.team-card-battle').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Limpiar bordes dorados de turno
    clearTurnBorders();
    
    // Mostrar pantalla de selección
    hideAllScreens();
    document.getElementById('teamSelection').classList.add('active');
    
    // Actualizar botón
    updateStartButton();
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
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Colores según tipo
    if (type === 'success') {
        messageDiv.style.background = 'linear-gradient(135deg, #44ff44 0%, #44aa44 100%)';
    } else if (type === 'error') {
        messageDiv.style.background = 'linear-gradient(135deg, #ff4444 0%, #aa4444 100%)';
    } else {
        messageDiv.style.background = 'linear-gradient(135deg, #4444ff 0%, #4444aa 100%)';
    }
    
    // Agregar al DOM
    document.body.appendChild(messageDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Navegación
function navigateTo(page) {
    console.log('Battle Arena: Navigating to:', page);
    window.location.href = `${page}.html`;
}

// Función de prueba para volverAlMenu (puede ser llamada manualmente desde la consola)
window.testVolverAlMenu = async function() {
    console.log('Battle Arena: testVolverAlMenu called manually');
    console.log('Battle Arena: currentEnfrentamiento in test:', currentEnfrentamiento);
    await volverAlMenu();
};

// Función de prueba para verificar si los botones existen
window.testButtonsExist = function() {
    console.log('Battle Arena: Testing if buttons exist');
    const volverBtn = document.getElementById('volverBtn');
    const volverFinalBtn = document.getElementById('volverFinalBtn');
    
    console.log('Battle Arena: volverBtn exists:', !!volverBtn);
    console.log('Battle Arena: volverFinalBtn exists:', !!volverFinalBtn);
    
    if (volverBtn) {
        console.log('Battle Arena: volverBtn HTML:', volverBtn.outerHTML);
    }
    if (volverFinalBtn) {
        console.log('Battle Arena: volverFinalBtn HTML:', volverFinalBtn.outerHTML);
    }
    
    return { volverBtn: !!volverBtn, volverFinalBtn: !!volverFinalBtn };
};

// Función de prueba para DELETE (puede ser llamada manualmente desde la consola)
window.testDeleteEnfrentamiento = async function() {
    console.log('Battle Arena: testDeleteEnfrentamiento called');
    console.log('Battle Arena: currentEnfrentamiento:', currentEnfrentamiento);
    
    if (!currentEnfrentamiento || !currentEnfrentamiento.id) {
        console.log('Battle Arena: No enfrentamiento to test delete');
        return;
    }
    
    try {
        console.log('Battle Arena: Testing DELETE request to:', `/enfrentamientos/${currentEnfrentamiento.id}`);
        
        const response = await apiCall(`/enfrentamientos/${currentEnfrentamiento.id}`, {
            method: 'DELETE'
        });
        
        console.log('Battle Arena: Test DELETE successful:', response);
        alert('DELETE test successful! Response: ' + JSON.stringify(response));
    } catch (error) {
        console.error('Battle Arena: Test DELETE failed:', error);
        alert('DELETE test failed: ' + error.message);
    }
};

// Eliminar enfrentamiento actual
async function deleteCurrentEnfrentamiento() {
    console.log('Battle Arena: deleteCurrentEnfrentamiento called');
    console.log('Battle Arena: currentEnfrentamiento:', currentEnfrentamiento);
    console.log('Battle Arena: currentEnfrentamiento type:', typeof currentEnfrentamiento);
    console.log('Battle Arena: currentEnfrentamiento.id:', currentEnfrentamiento?.id);
    
    if (!currentEnfrentamiento) {
        console.log('Battle Arena: currentEnfrentamiento is null/undefined');
        return;
    }
    
    if (!currentEnfrentamiento.id) {
        console.log('Battle Arena: currentEnfrentamiento.id is null/undefined');
        console.log('Battle Arena: currentEnfrentamiento keys:', Object.keys(currentEnfrentamiento));
        return;
    }
    
    try {
        console.log('Battle Arena: About to make DELETE request to:', `/enfrentamientos/${currentEnfrentamiento.id}`);
        console.log('Battle Arena: Full URL will be:', `${window.API_BASE_URL}/enfrentamientos/${currentEnfrentamiento.id}`);
        
        const response = await apiCall(`/enfrentamientos/${currentEnfrentamiento.id}`, {
            method: 'DELETE'
        });
        
        console.log('Battle Arena: DELETE request successful, response:', response);
        showMessage('Enfrentamiento eliminado correctamente', 'success');
    } catch (error) {
        console.error('Battle Arena: Error deleting enfrentamiento:', error);
        console.error('Battle Arena: Error details:', {
            message: error.message,
            stack: error.stack
        });
        showMessage('Error al eliminar enfrentamiento: ' + error.message, 'error');
    }
}

// Función para volver al menú principal (elimina enfrentamiento primero)
async function volverAlMenu() {
    console.log('Battle Arena: volverAlMenu called - START');
    console.log('Battle Arena: currentEnfrentamiento at start:', currentEnfrentamiento);
    console.log('Battle Arena: About to call deleteCurrentEnfrentamiento');
    
    try {
        await deleteCurrentEnfrentamiento();
        console.log('Battle Arena: deleteCurrentEnfrentamiento completed successfully');
    } catch (error) {
        console.error('Battle Arena: Error in volverAlMenu:', error);
        console.error('Battle Arena: Error details:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        // Siempre navegar al dashboard, incluso si hay error al eliminar
        console.log('Battle Arena: About to navigate to dashboard in 2 seconds...');
        setTimeout(() => {
            console.log('Battle Arena: Executing navigation to dashboard.html');
            window.location.href = 'dashboard.html';
        }, 2000);
    }
}

// Función para nueva batalla (elimina enfrentamiento actual y reinicia)
async function nuevaBatalla() {
    console.log('Battle Arena: nuevaBatalla called - START');
    console.log('Battle Arena: currentEnfrentamiento at start:', currentEnfrentamiento);
    console.log('Battle Arena: About to call deleteCurrentEnfrentamiento');
    
    try {
        await deleteCurrentEnfrentamiento();
        console.log('Battle Arena: deleteCurrentEnfrentamiento completed successfully');
    } catch (error) {
        console.error('Battle Arena: Error in nuevaBatalla:', error);
        console.error('Battle Arena: Error details:', {
            message: error.message,
            stack: error.stack
        });
    } finally {
        // Siempre reiniciar la batalla, incluso si hay error al eliminar
        console.log('Battle Arena: About to reset battle in 2 seconds...');
        setTimeout(() => {
            console.log('Battle Arena: Executing resetBattle');
            resetBattle();
        }, 2000);
    }
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigateTo('index');
} 