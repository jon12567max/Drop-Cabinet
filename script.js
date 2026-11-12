// ==========================================
// DROP CABINET - SCRIPT UTAMA (OPTIMIZED)
// ==========================================

const SUPABASE_URL = 'https://cevofxyyfvcaookqozmf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xCma_WLsgPLEq-NOsTuQkg_bWF7ejk7';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Filter sederhana keamanan teks/link
const bannedWords = ['http://', 'https://', 'www.']; 

function containsBannedContent(text) {
    const lower = text.toLowerCase();
    return bannedWords.some(word => lower.includes(word));
}

// Menampilkan Kotak Peringatan / Error
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

// 1. Ambil Data Pesan dari Supabase
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

// 2. Pemetaan Gaya Berdasarkan Mood Aura
function getMoodStyle(mood) {
    switch(mood) {
        case 'rant':
            return {
                bg: 'bg-rose-950/20 border-rose-500/30 shadow-rose-950/50',
                badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                label: '🔥 Rant'
            };
        case 'mystery':
            return {
                bg: 'bg-purple-950/20 border-purple-500/30 shadow-purple-950/50',
                badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                label: '🔮 Mystery'
            };
        case 'melancholy':
            return {
                bg: 'bg-blue-950/20 border-blue-500/30 shadow-blue-950/50',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                label: '🌧️ Melancholy'
            };
        default: // chill
            return {
                bg: 'bg-slate-900/60 border-slate-800/80 shadow-black/40',
                badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                label: '✨ Chill'
            };
    }
}

// 3. Render Kartu Pesan ke Linimasa
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-slate-500 text-xs">
                Belum ada pesan di Drop Cabinet. Jadilah yang pertama menulis!
            </div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const style = getMoodStyle(post.mood);
        const timeAgo = timeSince(new Date(post.created_at));
        const sender = escapeHtml(post.sender_name || 'Anonim');
        const content = escapeHtml(post.content || '');
        const imageUrl = post.image_url ? escapeHtml(post.image_url) : '';

        const gifElement = imageUrl ? `
            <div class="mt-2.5 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-950/50">
                <img src="${imageUrl}" alt="GIF" class="w-full max-h-60 object-cover rounded-lg" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
        ` : '';

        return `
            <div class="rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-200 ${style.bg} space-y-2.5">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 font-bold text-xs">
                            ${sender.charAt(0).toUpperCase()}
                        </div>
                        <span class="font-semibold text-xs text-slate-200">${sender}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] px-2 py-0.5 rounded-full border ${style.badge} font-medium">
                            ${style.label}
                        </span>
                        <span class="text-[10px] text-slate-500">${timeAgo}</span>
                    </div>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap break-words pl-1">${content}</p>
                ${gifElement}
            </div>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// 4. Simpan Pesan Baru ke Database
async function savePost() {
    const senderNameInput = document.getElementById('senderName');
    const contentInput = document.getElementById('postContent');
    const gifInput = document.getElementById('postGif');
    const saveBtn = document.getElementById('saveBtn');

    const senderName = senderNameInput.value.trim();
    const content = contentInput.value.trim();
    const gifUrl = gifInput.value.trim();
    const selectedMood = document.querySelector('input[name="postMood"]:checked')?.value || 'chill';

    if (!content) {
        showAlert('Pesan tidak boleh kosong!');
        return;
    }

    if (containsBannedContent(content)) {
        showAlert('Pesan ditolak sistem karena mengandung tautan atau kata terlarang!');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span>Memposting...</span>';

    const { error } = await supabaseClient
        .from('posts')
        .insert([{
            sender_name: senderName || 'Anonim',
            content: content,
            mood: selectedMood,
            image_url: gifUrl
        }]);

    saveBtn.disabled = false;
    saveBtn.innerHTML = '<span>Posting</span><i data-lucide="send" class="w-3.5 h-3.5"></i>';
    if (window.lucide) lucide.createIcons();

    if (error) {
        console.error('Gagal menyimpan:', error);
        showAlert('Gagal mengirim pesan, silakan coba lagi.');
    } else {
        contentInput.value = '';
        gifInput.value = '';
        fetchPosts();
    }
}

// 5. Fungsi Utilitas Pendukung
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

// 6. Inisialisasi Saat Halaman Dimuat & Real-time Auto-Sync
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();

    supabaseClient
        .channel('public:posts')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, payload => {
            fetchPosts();
        })
        .subscribe();
});
