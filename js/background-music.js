// Música de fondo para toda la aplicación
class BackgroundMusic {
    constructor() {
        this.audio = null;
        this.toggleBtn = null;
        this.isInitialized = false;
        this.init();
    }

    init() {
        // Crear elemento de audio
        this.audio = document.createElement('audio');
        this.audio.id = 'bgMusic';
        this.audio.loop = true;
        this.audio.preload = 'auto';
        this.audio.volume = 0.3; // Volumen al 30%
        
        // Agregar fuente de audio
        const source = document.createElement('source');
        source.src = 'music/A01.mp3';
        source.type = 'audio/mpeg';
        this.audio.appendChild(source);
        
        // Agregar al body
        document.body.appendChild(this.audio);
        
        // Crear botón de toggle
        this.createToggleButton();
        
        // Configurar eventos
        this.setupEvents();
        
        this.isInitialized = true;
        console.log('BackgroundMusic: Inicializado correctamente');
    }

    createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'musicToggleBtn';
        this.toggleBtn.className = 'music-toggle-btn paused';
        this.toggleBtn.innerHTML = '🎵 Play Music';
        this.toggleBtn.title = 'Toggle Background Music';
        
        // Agregar al body
        document.body.appendChild(this.toggleBtn);
    }

    setupEvents() {
        // Evento del botón
        this.toggleBtn.addEventListener('click', () => {
            this.toggleMusic();
        });

        // Reproducir con la primera interacción del usuario
        const startMusic = () => {
            if (this.audio.paused) {
                this.playMusic();
            }
            // Remover el evento después de la primera interacción
            document.removeEventListener('click', startMusic);
            document.removeEventListener('keydown', startMusic);
        };

        document.addEventListener('click', startMusic);
        document.addEventListener('keydown', startMusic);

        // Manejar errores de audio
        this.audio.addEventListener('error', (e) => {
            console.error('BackgroundMusic: Error cargando audio:', e);
            this.toggleBtn.innerHTML = '❌ Error';
            this.toggleBtn.style.borderColor = '#FF0000';
        });

        // Manejar cuando el audio termina de cargar
        this.audio.addEventListener('canplaythrough', () => {
            console.log('BackgroundMusic: Audio cargado correctamente');
        });

        // Manejar cambios de estado
        this.audio.addEventListener('play', () => {
            this.updateButtonState('playing');
        });

        this.audio.addEventListener('pause', () => {
            this.updateButtonState('paused');
        });
    }

    toggleMusic() {
        if (this.audio.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }

    playMusic() {
        try {
            const playPromise = this.audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('BackgroundMusic: Reproduciendo música');
                }).catch(error => {
                    console.error('BackgroundMusic: Error reproduciendo:', error);
                });
            }
        } catch (error) {
            console.error('BackgroundMusic: Error al reproducir:', error);
        }
    }

    pauseMusic() {
        try {
            this.audio.pause();
            console.log('BackgroundMusic: Música pausada');
        } catch (error) {
            console.error('BackgroundMusic: Error al pausar:', error);
        }
    }

    updateButtonState(state) {
        this.toggleBtn.className = `music-toggle-btn ${state}`;
        
        if (state === 'playing') {
            this.toggleBtn.innerHTML = '🔇 Pause Music';
        } else {
            this.toggleBtn.innerHTML = '🎵 Play Music';
        }
    }

    setVolume(volume) {
        if (volume >= 0 && volume <= 1) {
            this.audio.volume = volume;
            console.log(`BackgroundMusic: Volumen ajustado a ${volume * 100}%`);
        }
    }
}

// Inicializar música de fondo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.backgroundMusic = new BackgroundMusic();
});

// También inicializar si el DOM ya está cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.backgroundMusic = new BackgroundMusic();
    });
} else {
    window.backgroundMusic = new BackgroundMusic();
} 