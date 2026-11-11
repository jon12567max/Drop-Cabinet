// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://cevofxyyfvcaookqozmf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xCma_WLsgPLEq-NOsTuQkg_bWF7ejk7';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    realtime: { params: { eventsPerSecond: 10 } }
});

// --- FILTER SPAM & LINK ---
const BAD_WORDS = ['judol', 'slot', 'gacor', 'zeus', 'maxwin', 'pragmatic'];
const LINK_REGEX = /(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i;

function validateContent(text) {
    if (LINK_REGEX.test(text)) return "Dilarang menyertakan link atau URL!";
    const containsBadWord = BAD_WORDS.some(word => text.toLowerCase().includes(word));
    if (containsBadWord) return "Pesan mengandung kata terlarang!";
    return null;
}

// --- AKSI POSTING PESAN ---
async function savePost() {
    const nameInput = document.getElementById('senderName');
    const contentInput = document.getElementById('postContent');
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    const saveBtn = document.getElementById('saveBtn');

    const sender = nameInput.value.trim() || 'Anonim';
    const content = contentInput.value.trim();

    if (!content) return;

    const errorMsg = validateContent(content);
    if (errorMsg) {
        alertText.innerText = errorMsg;
        alertBox.classList.remove('hidden');
        return;
    } else {
        alertBox.classList.add('hidden');
    }

    saveBtn.disabled = true;
    saveBtn.innerText = 'Sending...';

    const { error } = await supabaseClient
        .from('posts')
        .insert([{ sender_name: sender, content: content }]);

    saveBtn.disabled = false;
    saveBtn.innerHTML = `<span>Posting</span><i data-lucide="send" class="w-3.5 h-3.5"></i>`;

    if (error) {
        alertText.innerText = 'Gagal mengirim pesan!';
        alertBox.classList.remove('hidden');
        console.error(error);
    } else {
        contentInput.value = '';
        fetchPosts(); // Langsung tarik data setelah kirim
    }
}

// Variabel untuk menyimpan cache postingan terakhir agar tidak mereset posisi scroll
let lastPostCount = 0;

// --- AMBIL DATA DARI SUPABASE ---
async function fetchPosts(isBackgroundCheck = false) {
    const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    // Jika dipanggil secara background (auto-polling) dan jumlah datanya sama, tidak perlu render ulang agar layar tidak berkedip
    if (isBackgroundCheck && data && data.length === lastPostCount) {
        return;
    }

    if (data) {
        lastPostCount = data.length;
    }

    renderPosts(data);
}

// --- RENDER LINIMASA ---
function renderPosts(posts) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    if (!posts || posts.length === 0) {
        container.innerHTML = `
            <div class="text-center py-10 text-slate-500 text-xs">
                Belum ada pesan. Jadi yang pertama mengirim pesan!
            </div>`;
        return;
    }

    container.innerHTML = posts.map(post => {
        const date = new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const avatarSeed = encodeURIComponent(post.sender_name || 'Anonim');
        const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}`;

        return `
            <div class="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-2 transition hover:border-slate-700/80">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <img src="${avatarUrl}" alt="Avatar" class="w-6 h-6 rounded-full bg-slate-800 border border-slate-700" />
                        <span class="font-semibold text-xs text-sky-400">${escapeHtml(post.sender_name || 'Anonim')}</span>
                    </div>
                    <span class="text-[10px] text-slate-500">${date}</span>
                </div>
                <p class="text-xs text-slate-200 leading-relaxed break-words">${escapeHtml(post.content)}</p>
            </div>
        `;
    }).join('');

    if (window.lucide) {
        lucide.createIcons();
    }
}

function escapeHtml(text) {
    return String(text).replace(/[&<>"']/g, function (m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
}

// --- INISIALISASI REALTIME & AUTO-POLLING CADANGAN ---
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();

    // Jalur 1: Supabase Realtime WebSocket
    supabaseClient
        .channel('public:posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
            fetchPosts();
        })
        .subscribe();

    // Jalur 2: Auto-Polling cadangan tiap 3 detik (Menjamin 100% pesan muncul otomatis tanpa reload)
    setInterval(() => {
        fetchPosts(true);
    }, 3000);
});
