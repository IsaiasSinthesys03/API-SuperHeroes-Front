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
document.addEventListener('DOMContentLoaded', function() {
    console.log('Battle Arena: DOM Content Loaded');
    checkAuth();
    loadTeams();
    loadAllCharacters();
    setupEventListeners();
});

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
        renderTeamCards();
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
        
        allHeroes = heroes;
        allVillains = villains;
        
        console.log('Battle Arena: Heroes loaded:', allHeroes.length);
        console.log('Battle Arena: Villains loaded:', allVillains.length);
    } catch (error) {
        console.error('Error cargando personajes:', error);
        showMessage('Error cargando personajes', 'error');
    }
}

// Renderizar tarjetas de equipos
function renderTeamCards() {
    const team1Cards = document.getElementById('team1Cards');
    const team2Cards = document.getElementById('team2Cards');
    
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
}

// Crear tarjeta de equipo
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
    
    // Obtener datos de cada personaje
    const personajesConStats = personajes.map(char => {
        const charData = getCharacterData(char.alias, char.type);
        return {
            ...char,
            stats: charData || { poder: 0, defensa: 0, probCrit: 0, danoCrit: 0 }
        };
    });
    
    card.innerHTML = `
        <div class="team-title">
            <h3>Equipo ${teamIndex}</h3>
        </div>
        <div class="team-characters">
            ${personajesConStats.map(char => `
                <div class="character-stats-card ${char.type}">
                    <div class="character-header">
                        <span class="character-name">${char.alias}</span>
                        <span class="character-type-tag ${char.type}">${char.type === 'hero' ? 'HÉROE' : 'VILLANO'}</span>
                    </div>
                    <div class="character-stats-grid">
                        <div class="stat-item">
                            <div class="stat-label">PODER</div>
                            <div class="stat-value">Nvl. ${char.stats.poder}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">DEFENSA</div>
                            <div class="stat-value">Nvl. ${char.stats.defensa}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">PROB. CRÍTICA</div>
                            <div class="stat-value">${char.stats.probCrit}%</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">DAÑO CRÍTICO</div>
                            <div class="stat-value">${char.stats.danoCrit}%</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="team-type-info">
            <span class="team-type-label">${getTeamTypeLabel(teamType)}</span>
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
        const player1Alias = response.TuPersonaje;
        const player2Alias = response.TuEnemigo;
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
        
        document.getElementById('player1Name').textContent = player1Alias;
        document.getElementById('player2Name').textContent = player2Alias;
        
        // Actualizar títulos de jugadores con nombres de personajes
        document.getElementById('player1Title').textContent = `Jugador 1 - ${player1Alias}`;
        document.getElementById('player2Title').textContent = `Jugador 2 - ${player2Alias}`;
        
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
        }
    }
}

// Actualizar avatares de personajes
function updateCharacterAvatars() {
    const player1Type = getCharacterType(selectedTeam1, currentRound, 1);
    const player2Type = getCharacterType(selectedTeam2, currentRound, 2);
    
    const player1Avatar = document.getElementById('player1Avatar');
    const player2Avatar = document.getElementById('player2Avatar');
    
    player1Avatar.className = `character-avatar ${player1Type}-avatar`;
    player2Avatar.className = `character-avatar ${player2Type}-avatar`;
    
    const player1Shape = player1Avatar.querySelector('.avatar-shape');
    const player2Shape = player2Avatar.querySelector('.avatar-shape');
    
    player1Shape.className = `avatar-shape ${player1Type}-shape`;
    player2Shape.className = `avatar-shape ${player2Type}-shape`;
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
    
    // Cambiar color según la vida
    if (player1Percentage < 30) {
        player1Health.style.background = 'linear-gradient(90deg, #ff4444 0%, #ff8844 100%)';
    }
    if (player2Percentage < 30) {
        player2Health.style.background = 'linear-gradient(90deg, #ff4444 0%, #ff8844 100%)';
    }
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
function showRoundResults(winner, loser) {
    hideAllScreens();
    document.getElementById('roundResults').classList.add('active');
    
    // Actualizar información
    document.getElementById('roundResultTitle').textContent = `ROUND ${currentRound} COMPLETADO`;
    
    // Obtener los nombres actuales de los personajes que están combatiendo
    const player1CurrentName = document.getElementById('player1Name').textContent;
    const player2CurrentName = document.getElementById('player2Name').textContent;
    
    console.log('Battle Arena: Current character names - Player 1:', player1CurrentName, 'Player 2:', player2CurrentName);
    
    const winnerName = winner === 1 ? player1CurrentName : player2CurrentName;
    const loserName = loser === 1 ? player1CurrentName : player2CurrentName;
    
    console.log('Battle Arena: showRoundResults - Winner:', winner, 'Winner Name:', winnerName, 'Loser:', loser, 'Loser Name:', loserName);
    
    // Obtener los elementos de resultado
    const winnerSide = document.getElementById('winnerSide');
    const loserSide = document.getElementById('loserSide');
    
    // Verificar que los elementos existen antes de intentar acceder a ellos
    if (!winnerSide || !loserSide) {
        console.error('Battle Arena: winnerSide or loserSide elements not found');
        return;
    }
    
    // Actualizar nombres primero - usar getElementById en lugar de querySelector
    const winnerNameElement = document.getElementById('winnerName');
    const loserNameElement = document.getElementById('loserName');
    
    if (winnerNameElement && loserNameElement) {
        winnerNameElement.textContent = winnerName;
        loserNameElement.textContent = loserName;
        console.log('Battle Arena: Names updated successfully - Winner:', winnerName, 'Loser:', loserName);
    } else {
        console.error('Battle Arena: winnerName or loserName elements not found');
        return;
    }
    
    // Actualizar avatares - usar getElementById en lugar de querySelector
    const winnerAvatar = document.querySelector('#winnerSide .avatar-shape');
    const loserAvatar = document.querySelector('#loserSide .avatar-shape');
    
    if (winnerAvatar && loserAvatar) {
        winnerAvatar.className = `avatar-shape winner-shape`;
        loserAvatar.className = `avatar-shape loser-shape`;
        console.log('Battle Arena: Initial avatars updated successfully');
    } else {
        console.error('Battle Arena: Avatar elements not found');
        return;
    }
    
    // Aplicar estilos según quién ganó
    if (winner === 2) {
        // Si el Jugador 2 ganó, el ganador va a la derecha
        console.log('Battle Arena: Player 2 won, winner goes to the right');
        
        // Configurar el lado derecho como ganador
        loserSide.className = 'winner-side';  // El lado derecho se convierte en ganador
        winnerSide.className = 'loser-side';  // El lado izquierdo se convierte en perdedor
        
        // Actualizar nombres: ganador en la derecha, perdedor en la izquierda
        const winnerNameElement = document.getElementById('winnerName');
        const loserNameElement = document.getElementById('loserName');
        
        if (winnerNameElement && loserNameElement) {
            winnerNameElement.textContent = loserName;  // Nombre del perdedor en el lado izquierdo
            loserNameElement.textContent = winnerName;  // Nombre del ganador en el lado derecho
        }
        
        // Actualizar mensajes: victoria en la derecha, derrota en la izquierda
        const winnerMessage = document.getElementById('winnerMessage');
        const loserMessage = document.getElementById('loserMessage');
        
        if (winnerMessage && loserMessage) {
            winnerMessage.textContent = 'DERROTA';      // Derrota en el lado izquierdo
            loserMessage.textContent = '¡VICTORIA!';    // Victoria en el lado derecho
            
            // Aplicar clases CSS para los colores correctos
            winnerMessage.className = 'loser-message';  // Texto gris para derrota
            loserMessage.className = 'winner-message';  // Texto dorado para victoria
        }
        
        // Actualizar avatares después del intercambio de clases CSS
        const newWinnerAvatar = document.querySelector('#loserSide .avatar-shape'); // Ahora el ganador está en loserSide
        const newLoserAvatar = document.querySelector('#winnerSide .avatar-shape'); // Ahora el perdedor está en winnerSide
        
        if (newWinnerAvatar && newLoserAvatar) {
            newWinnerAvatar.className = `avatar-shape winner-shape`; // Ganador (derecha) = amarillo
            newLoserAvatar.className = `avatar-shape loser-shape`;   // Perdedor (izquierda) = gris
            console.log('Battle Arena: Avatars updated after position swap');
        }
        
        console.log('Battle Arena: Player 2 winner - Winner on right, Loser on left');
        
    } else {
        // Si el Jugador 1 ganó, el ganador va a la izquierda
        console.log('Battle Arena: Player 1 won, winner goes to the left');
        
        // Mantener las clases CSS originales
        winnerSide.className = 'winner-side';  // El lado izquierdo es ganador
        loserSide.className = 'loser-side';    // El lado derecho es perdedor
        
        // Los nombres ya están correctos: ganador en la izquierda, perdedor en la derecha
        // Solo actualizar los mensajes
        const winnerMessage = document.getElementById('winnerMessage');
        const loserMessage = document.getElementById('loserMessage');
        
        if (winnerMessage && loserMessage) {
            winnerMessage.textContent = '¡VICTORIA!';   // Victoria en el lado izquierdo
            loserMessage.textContent = 'DERROTA';        // Derrota en el lado derecho
            
            // Aplicar clases CSS para los colores correctos
            winnerMessage.className = 'winner-message';  // Texto dorado para victoria
            loserMessage.className = 'loser-message';    // Texto gris para derrota
        }
        
        // Actualizar avatares para Player 1 ganador (posiciones originales)
        const winnerAvatar = document.querySelector('#winnerSide .avatar-shape'); // Ganador (izquierda)
        const loserAvatar = document.querySelector('#loserSide .avatar-shape');   // Perdedor (derecha)
        
        if (winnerAvatar && loserAvatar) {
            winnerAvatar.className = `avatar-shape winner-shape`; // Ganador (izquierda) = amarillo
            loserAvatar.className = `avatar-shape loser-shape`;   // Perdedor (derecha) = gris
            console.log('Battle Arena: Avatars updated for Player 1 winner');
        }
        
        console.log('Battle Arena: Player 1 winner - Winner on left, Loser on right');
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
            
            console.log('Battle Arena: Estadísticas finales actualizadas correctamente');
        } else {
            console.error('Battle Arena: No se encontraron estadísticas');
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