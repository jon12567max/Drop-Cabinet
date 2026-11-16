// ==========================================
// DROP CABINET - SCRIPT UTAMA (TWITTER UI)
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

function makeHandle(name) {
    if (!name) return '@anonim';
    return '@' + name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || '@user';
}

function updateProfileUI() {
    const profileCard = document.getElementById('userProfileCard');
    const headerText = document.getElementById('headerLoginText');
    const headerAvatar = document.getElementById('headerAvatarBtn');
    const composerAvatar = document.getElementById('composerAvatar');
    const posterIndicator = document.getElementById('currentPosterIndicator');
    
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileHandle = document.getElementById('profileHandle');
    const profileBioText = document.getElementById('profileBioText');

    const initial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
    if (headerAvatar) headerAvatar.innerText = initial;
    if (composerAvatar) composerAvatar.innerText = initial;

    if (currentUser.name) {
        if (profileCard) profileCard.classList.remove('hidden');
        if (headerText) headerText.innerText = currentUser.name;
        if (profileDisplayName) profileDisplayName.innerText = currentUser.name;
        if (profileHandle) profileHandle.innerText = makeHandle(currentUser.name);
        if (profileBioText) profileBioText.innerText = currentUser.bio || 'Belum ada bio...';
        if (posterIndicator) posterIndicator.innerHTML = `<i data-lucide="globe" class="w-3.5 h-3.5"></i><span>Posting sebagai ${escapeHtml(currentUser.name)}</span>`;
    } else {
        if (profileCard) profileCard.classList.add('hidden');
        if (headerText) headerText.innerText = 'Atur Profil';
        if (posterIndicator) posterIndicator.innerHTML = `<i data-lucide="globe" class="w-3.5 h-3.5"></i><span>Posting sebagai Anonim</span>`;
    }

    if (window.lucide) lucide.createIcons();
}

function openLoginModal() {
    document.getElementById('inputLoginName').value = currentUser.name;
    document.getElementById('inputLoginBio').value = currentUser.bio;
    document.getElementById('modalAvatarPreview').innerText = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'A';
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
    showAlert('Profil berhasil diperbarui.');
}

function showAlert(msg) {
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    if (alertBox && alertText) {
        alertText.innerText = msg;
        alertBox.classList.remove('hidden');
        setTimeout(() => {
            alertBox.classList.add('hidden');
        }, 3500);
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

function getMoodBadge(mood) {
    switch(mood) {
        case 'rant':
            return `<span class="text-[11px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">🔥 Rant</span>`;
        case 'mystery':
            return `<span class="text-[11px] text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">🔮 Mystery</span>`;
        case 'melancholy':
            return `<span class="text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">🌧️ Melancholy</span>`;
        default:
            return `<span class="text-[11px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">✨ Chill</span>`;
    }
}

function getAvatarColor(name) {
    const colors = [
        'bg-sky-500', 'bg-emerald-500', 'bg-violet-500', 
        'bg-rose-500', 'bg-amber-500', 'bg-indigo-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-[#71767b] text-sm">Belum ada postingan. Mulailah menulis sesuatu!</div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const timeAgo = timeSince(new Date(post.created_at));
        const sender = escapeHtml(post.sender_name || 'Anonim');
        const handle = escapeHtml(makeHandle(post.sender_name || 'Anonim'));
        const content = escapeHtml(post.content || '');
        const avatarBg = getAvatarColor(sender);
        const moodTag = getMoodBadge(post.mood);

        return `
            <article class="px-4 py-3.5 hover:bg-white/[0.02] transition flex gap-3">
                <!-- Foto Profil Bulat Kiri -->
                <div class="w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5">
                    ${sender.charAt(0).toUpperCase()}
                </div>

                <!-- Konten Tweet Kanan -->
                <div class="flex-1 min-w-0">
                    <!-- Baris Nama, @Handle & Waktu -->
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-1.5 min-w-0">
                            <span class="font-bold text-[15px] text-[#e7e9ea] truncate">${sender}</span>
                            <span class="text-xs text-[#71767b] truncate">${handle}</span>
                            <span class="text-xs text-[#71767b]">·</span>
                            <span class="text-xs text-[#71767b] shrink-0">${timeAgo}</span>
                        </div>
                    </div>

                    <!-- Teks Utama -->
                    <p class="text-[15px] text-[#e7e9ea] leading-normal whitespace-pre-wrap break-words mt-1">${content}</p>

                    <!-- Baris Bawah (Mood Tag & Ikon Interaksi Ala Twitter) -->
                    <div class="flex items-center justify-between mt-3 text-[#71767b]">
                        <div>${moodTag}</div>
                        <div class="flex items-center gap-5">
                            <span class="flex items-center gap-1 text-xs hover:text-sky-400 transition cursor-default">
                                <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                            </span>
                            <span class="flex items-center gap-1 text-xs hover:text-emerald-400 transition cursor-default">
                                <i data-lucide="repeat-2" class="w-3.5 h-3.5"></i>
                            </span>
                            <span class="flex items-center gap-1 text-xs hover:text-rose-400 transition cursor-default">
                                <i data-lucide="heart" class="w-3.5 h-3.5"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </article>
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
        showAlert('Tulis sesuatu sebelum memposting!');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerText = 'Memposting...';

    const { error } = await supabaseClient
        .from('posts')
        .insert([{
            sender_name: senderName,
            content: content,
            mood: selectedMood,
            image_url: null
        }]);

    saveBtn.disabled = false;
    saveBtn.innerText = 'Posting';

    if (error) {
        console.error('Gagal menyimpan:', error);
        showAlert('Gagal mengirim postingan, coba lagi.');
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
    if (interval > 1) return Math.floor(interval) + 'thn';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + 'bln';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + 'h';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + 'j';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + 'm';
    return 'Baru';
            }
