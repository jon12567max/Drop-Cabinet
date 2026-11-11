// --- KONFIGURASI SUPABASE ---
const SUPABASE_URL = 'https://cevofxyyfvcaookqozmf.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xCma_WLsgPLEq-NOsTuQkg_bWF7ejk7';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        fetchPosts(); // Tarik data langsung setelah kirim
    }
}

// --- AMBIL DATA DARI SUPABASE ---
let lastDataLength = 0;

async function fetchPosts() {
    const { data, error } = await supabaseClient
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching posts:', error);
        return;
    }

    // Jika jumlah data bertambah, render ulang tampilan
    if (data && data.length !== lastDataLength) {
        lastDataLength = data.length;
        renderPosts(data);
    } else if (lastDataLength === 0 && data) {
        lastDataLength = data.length;
        renderPosts(data);
    }
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

// --- INISIALISASI OTOMATIS ---
document.addEventListener('DOMContentLoaded', () => {
    fetchPosts();

    // Cek pesan baru setiap 2 detik secara otomatis dan senyap
    setInterval(() => {
        fetchPosts();
    }, 2000);
});
