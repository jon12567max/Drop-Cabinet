// ==========================================
// DROP CABINET - SCRIPT UTAMA (BERSIH & AMAN)
// ==========================================

const SUPABASE_URL = 'https://cevofxyyfvcaookqozmf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xCma_WLsgPLEq-NOsTuQkg_bWF7ejk7';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = {
    name: localStorage.getItem('dc_username') || '',
    bio: localStorage.getItem('dc_userbio') || ''
};

document.addEventListener('DOMContentLoaded', () => {
    updateProfileUI();
    fetchPosts();

    supabaseClient
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
            fetchPosts();
        })
        .subscribe();
});

function updateProfileUI() {
    const profileCard = document.getElementById('userProfileCard');
    const headerText = document.getElementById('headerLoginText');
    const posterIndicator = document.getElementById('currentPosterIndicator');
    
    const profileAvatar = document.getElementById('profileAvatar');
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileBioText = document.getElementById('profileBioText');

    if (currentUser.name) {
        if (profileCard) profileCard.classList.remove('hidden');
        if (headerText) headerText.innerText = currentUser.name;
        if (posterIndicator) posterIndicator.innerHTML = `Sebagai: <b>${escapeHtml(currentUser.name)}</b>`;
        
        if (profileAvatar) profileAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
        if (profileDisplayName) profileDisplayName.innerText = currentUser.name;
        if (profileBioText) profileBioText.innerText = currentUser.bio || 'Belum ada status bio...';
    } else {
        if (profileCard) profileCard.classList.add('hidden');
        if (headerText) headerText.innerText = 'Profil';
        if (posterIndicator) posterIndicator.innerHTML = `Sebagai: <b>Anonim</b>`;
    }
}

function openLoginModal() {
    document.getElementById('inputLoginName').value = currentUser.name;
    document.getElementById('inputLoginBio').value = currentUser.bio;
    document.getElementById('loginModal').classList.remove('hidden');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.add('hidden');
}

function saveLoginProfile() {
    const nameInput = document.getElementById('inputLoginName').value.trim();
    const bioInput = document.getElementById('inputLoginBio').value.trim();

    currentUser.name = nameInput;
    currentUser.bio = bioInput;

    localStorage.setItem('dc_username', currentUser.name);
    localStorage.setItem('dc_userbio', currentUser.bio);

    closeLoginModal();
    updateProfileUI();
    showAlert('Profil berhasil disimpan!');
}

function showAlert(msg) {
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    if (alertBox && alertText) {
        alertText.innerText = msg;
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 4000);
    }
}

async function fetchPosts() {
    const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        console.error('Gagal memuat pesan:', error);
        return;
    }

    renderPosts(data || []);
}

function getMoodStyle(mood) {
    switch(mood) {
        case 'rant':
            return { bg: 'bg-rose-950/25 border-rose-500/30', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: '🔥 Rant' };
        case 'mystery':
            return { bg: 'bg-purple-950/25 border-purple-500/30', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20', label: '🔮 Mystery' };
        case 'melancholy':
            return { bg: 'bg-blue-950/25 border-blue-500/30', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: '🌧️ Melancholy' };
        default:
            return { bg: 'bg-slate-900/60 border-slate-800/80', badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', label: '✨ Chill' };
    }
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-slate-500 text-xs">Belum ada pesan. Jadilah yang pertama menulis!</div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const style = getMoodStyle(post.mood);
        const timeAgo = timeSince(new Date(post.created_at));
        const sender = escapeHtml(post.sender_name || 'Anonim');
        const content = escapeHtml(post.content || '');

        return `
            <div class="rounded-2xl border p-3.5 shadow-xl backdrop-blur-md transition ${style.bg} space-y-2">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-[11px]">
                            ${sender.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-semibold text-xs text-slate-200">${sender}</span>
                    </div>
                    <div class="flex items-center gap-1.5">
                        <span class="text-[9px] px-2 py-0.5 rounded-full border ${style.badge} font-medium">
                            ${style.label}
                        </span>
                        <span class="text-[9px] text-slate-500">${timeAgo}</span>
                    </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words pl-1">${content}</p>
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

async function savePost() {
    const contentInput = document.getElementById('postContent');
    const saveBtn = document.getElementById('saveBtn');

    const content = contentInput.value.trim();
    const selectedMood = document.querySelector('input[name="postMood"]:checked')?.value || 'chill';
    const senderName = currentUser.name || 'Anonim';

    if (!content) {
        showAlert('Tulis pesan terlebih dahulu!');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Memposting...</span>';

    const { error } = await supabaseClient
        .from('posts')
        .insert([{
            sender_name: senderName,
            content: content,
            mood: selectedMood,
            image_url: null
        }]);

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>Posting</span><i data-lucide="send" class="w-3 h-3"></i>';
    if (window.lucide) lucide.createIcons();

    if (error) {
        console.error('Gagal menyimpan:', error);
        showAlert('Gagal mengirim pesan, silakan coba lagi.');
    } else {
        contentInput.value = '';
        fetchPosts();
    }
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' th lalu';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' bln lalu';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' hr lalu';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' jam lalu';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' mnt lalu';
    return 'Baru saja';
}
