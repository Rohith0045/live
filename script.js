// Initial Data Structure
const defaultData = {
    profile: {
        name: "New Player",
        role: "All-Rounder",
        team: "",
        bio: "Ready to make my mark on the field.",
        photo: null
    },
    stats: {
        runs: 0,
        wickets: 0,
        matches: 0,
        highScore: 0,
        catches: 0,
        runOuts: 0
    },
    matches: [],
    achievements: [],
    media: []
};

// State management
let appData = JSON.parse(localStorage.getItem('cricketAppData_v2')) || defaultData;

// Migration for existing data
if (appData.profile.team === undefined) appData.profile.team = "";
if (appData.stats.catches === undefined) appData.stats.catches = 0;
if (appData.stats.runOuts === undefined) appData.stats.runOuts = 0;
if (appData.media === undefined) appData.media = [];
appData.matches.forEach(m => {
    if (m.catches === undefined) m.catches = 0;
    if (m.runOuts === undefined) m.runOuts = 0;
});

// Save to localStorage
function saveData() {
    localStorage.setItem('cricketAppData_v2', JSON.stringify(appData));
    renderApp();
}

// Modal Functions
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
    
    // Pre-fill profile form if opening profile modal
    if(modalId === 'profile-modal') {
        document.getElementById('input-name').value = appData.profile.name;
        document.getElementById('input-role').value = appData.profile.role;
        document.getElementById('input-team').value = appData.profile.team;
        document.getElementById('input-bio').value = appData.profile.bio;
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Close modal on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        event.target.classList.remove('active');
    }
}

// Format Numbers (e.g. 2450 -> 2,450)
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Render Functions
function renderApp() {
    renderProfile();
    renderStats();
    renderMatches();
    renderAchievements();
    renderMedia();
}

function renderProfile() {
    document.getElementById('display-name').innerText = appData.profile.name;
    document.getElementById('display-role').innerText = appData.profile.role;
    document.getElementById('display-team').innerHTML = `<i class="fas fa-shield-alt"></i> ${appData.profile.team || "No Team"}`;
    document.getElementById('display-bio').innerText = appData.profile.bio;
    
    const imgEl = document.getElementById('profile-img');
    if (appData.profile.photo) {
        imgEl.src = appData.profile.photo;
    } else {
        const encodedName = encodeURIComponent(appData.profile.name);
        imgEl.src = `https://ui-avatars.com/api/?name=${encodedName}&background=random&size=150`;
    }
    
    // Change theme slightly based on role
    const root = document.documentElement;
    if(appData.profile.role === 'Batsman') {
        root.style.setProperty('--primary', '#3b82f6');
        root.style.setProperty('--secondary', '#8b5cf6');
    } else if(appData.profile.role === 'Bowler') {
        root.style.setProperty('--primary', '#ef4444');
        root.style.setProperty('--secondary', '#f97316');
    } else {
        root.style.setProperty('--primary', '#6366f1');
        root.style.setProperty('--secondary', '#ec4899');
    }
}

function renderStats() {
    document.getElementById('stat-runs').innerText = formatNumber(appData.stats.runs);
    document.getElementById('stat-wickets').innerText = formatNumber(appData.stats.wickets);
    document.getElementById('stat-matches').innerText = formatNumber(appData.stats.matches);
    document.getElementById('stat-hs').innerText = appData.stats.highScore + (appData.stats.highScore >= 100 ? "*" : "");
    document.getElementById('stat-catches').innerText = formatNumber(appData.stats.catches);
    document.getElementById('stat-runouts').innerText = formatNumber(appData.stats.runOuts);
}

function renderMatches() {
    const list = document.getElementById('match-list');
    list.innerHTML = '';
    
    // Sort matches by date descending
    const sortedMatches = [...appData.matches].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if(sortedMatches.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No matches logged yet.</p>';
        return;
    }

    sortedMatches.forEach(match => {
        const item = document.createElement('div');
        item.className = 'match-item';
        
        // Format date
        const dateObj = new Date(match.date);
        const dateStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        item.innerHTML = `
            <div class="match-info">
                <h4>vs ${match.opponent}</h4>
                <p><i class="far fa-calendar-alt"></i> ${dateStr}</p>
            </div>
            <div class="match-stats">
                <div><span class="highlight">${match.runs}</span> Runs</div>
                <div style="font-size: 0.9rem; color: var(--text-muted);">${match.wickets} Wickets &bull; ${match.catches} Catches &bull; ${match.runOuts} Run Outs</div>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderAchievements() {
    const list = document.getElementById('achievement-list');
    list.innerHTML = '';
    
    if(appData.achievements.length === 0) {
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No achievements added yet.</p>';
        return;
    }

    appData.achievements.forEach(ach => {
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.innerHTML = `
            <div class="achievement-icon">
                <i class="fas ${ach.icon}"></i>
            </div>
            <div class="achievement-content">
                <h4>${ach.title}</h4>
                <p>${ach.desc}</p>
            </div>
        `;
        list.appendChild(item);
    });
}

function renderMedia() {
    const list = document.getElementById('media-list');
    if(!list) return; // safety
    
    list.innerHTML = '';
    
    if(appData.media.length === 0) {
        list.style.display = 'block';
        list.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 1rem;">No media uploaded yet.</p>';
        return;
    }
    
    list.style.display = 'grid'; // Restore grid if it was hidden
    appData.media.forEach(m => {
        const item = document.createElement('div');
        item.className = 'media-item';
        
        let mediaContent = '';
        if (m.type.startsWith('video/')) {
            mediaContent = `<video src="${m.data}" class="media-content" controls></video>`;
        } else {
            mediaContent = `<img src="${m.data}" class="media-content" alt="Media">`;
        }
        
        item.innerHTML = `
            ${mediaContent}
            <div class="media-caption">${m.caption}</div>
        `;
        list.appendChild(item);
    });
}

// Handlers
function handleProfileUpdate(e) {
    e.preventDefault();
    appData.profile.name = document.getElementById('input-name').value;
    appData.profile.role = document.getElementById('input-role').value;
    appData.profile.team = document.getElementById('input-team').value;
    appData.profile.bio = document.getElementById('input-bio').value;
    
    const photoInput = document.getElementById('input-photo');
    if (photoInput && photoInput.files && photoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(event) {
            appData.profile.photo = event.target.result;
            saveData();
            closeModal('profile-modal');
        };
        reader.readAsDataURL(photoInput.files[0]);
    } else {
        saveData();
        closeModal('profile-modal');
    }
}

function handleAddMatch(e) {
    e.preventDefault();
    
    const opponent = document.getElementById('match-opponent').value;
    const runs = parseInt(document.getElementById('match-runs').value) || 0;
    const wickets = parseInt(document.getElementById('match-wickets').value) || 0;
    const catches = parseInt(document.getElementById('match-catches').value) || 0;
    const runOuts = parseInt(document.getElementById('match-runouts').value) || 0;
    const date = document.getElementById('match-date').value;
    
    const newMatch = {
        id: Date.now(),
        opponent,
        runs,
        wickets,
        catches,
        runOuts,
        date
    };
    
    appData.matches.push(newMatch);
    
    // Update Stats
    appData.stats.matches += 1;
    appData.stats.runs += runs;
    appData.stats.wickets += wickets;
    appData.stats.catches += catches;
    appData.stats.runOuts += runOuts;
    if(runs > appData.stats.highScore) {
        appData.stats.highScore = runs;
    }
    
    saveData();
    closeModal('match-modal');
    e.target.reset(); // Clear form
}

function handleAddAchievement(e) {
    e.preventDefault();
    
    const title = document.getElementById('ach-title').value;
    const desc = document.getElementById('ach-desc').value;
    const icon = document.getElementById('ach-icon').value;
    
    const newAchievement = {
        id: Date.now(),
        title,
        desc,
        icon
    };
    
    appData.achievements.unshift(newAchievement); // Add to beginning
    
    saveData();
    closeModal('achievement-modal');
    e.target.reset(); // Clear form
}

function handleAddMedia(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('media-file');
    const caption = document.getElementById('media-caption').value;
    
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const newMedia = {
                id: Date.now(),
                type: file.type,
                caption: caption,
                data: event.target.result
            };
            
            appData.media.unshift(newMedia);
            saveData();
            closeModal('media-modal');
            e.target.reset();
        };
        
        reader.readAsDataURL(file);
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', renderApp);
