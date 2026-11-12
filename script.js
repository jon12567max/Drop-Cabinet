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
    


<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col justify-between selection:bg-sky-500">

    <!-- Header -->
    <header class="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <i data-lucide="ghost" class="w-4 h-4"></i>
            </div>
            <h1 class="font-bold text-sm tracking-wide">Shadow Chat</h1>
        </div>
        <div id="statusBadge" class="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium">
            Offline
        </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 max-w-xl w-full mx-auto p-4 flex flex-col justify-center items-center">
        
        <!-- State 1: Tombol Mulai -->
        <div id="welcomeScreen" class="text-center space-y-4">
            <div class="w-16 h-16 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto text-sky-400 shadow-xl">
                <i data-lucide="users" class="w-8 h-8"></i>
            </div>
            <div class="space-y-1">
                <h2 class="font-bold text-lg">Ngobrol Anonim 1 Lawan 1</h2>
                <p class="text-xs text-slate-400 max-w-xs mx-auto">Temukan orang asing secara acak. Tanpa daftar akun, bebas ngobrol apa saja.</p>
            </div>
            <button onclick="findPartner()" class="bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs px-6 py-3 rounded-full shadow-lg shadow-sky-500/20 transition active:scale-95">
                Cari Partner (Find Stranger)
            </button>
        </div>

        <!-- State 2: Layar Mencari -->
        <div id="searchingScreen" class="hidden text-center space-y-4">
            <div class="w-12 h-12 rounded-full border-2 border-sky-500 border-t-transparent animate-spin mx-auto"></div>
            <p class="text-xs text-slate-400">Mencari orang asing yang online...</p>
            <button onclick="cancelSearch()" class="text-xs text-rose-400 hover:underline">Batalkan</button>
        </div>

        <!-- State 3: Ruang Obrolan -->
        <div id="chatScreen" class="hidden w-full flex-1 flex flex-col h-[75vh]">
            <!-- Kotak Pesan -->
            <div id="chatContainer" class="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-900/50 border border-slate-800 rounded-2xl mb-3">
                <div class="text-center py-2 text-[10px] text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    Terhubung dengan orang asing! Katakan halo 👋
                </div>
            </div>

            <!-- Input & Tombol Next -->
            <div class="space-y-2">
                <div class="flex gap-2">
                    <input type="text" id="messageInput" placeholder="Ketik pesan..." onkeypress="handleKey(event)"
                        class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500" />
                    <button onclick="sendMessage()" class="bg-sky-500 hover:bg-sky-400 text-white px-4 rounded-xl text-xs font-medium transition">
                        Kirim
                    </button>
                </div>
                <div class="flex justify-between items-center px-1">
                    <button onclick="leaveChat()" class="text-[10px] text-rose-400 hover:underline">Keluar / Selesai</button>
                    <button onclick="nextPartner()" class="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] px-3 py-1.5 rounded-lg border border-slate-700 transition">
                        Ganti Partner (Next) ➡️
                    </button>
                </div>
            </div>
        </div>

    </main>

    <script>
        // Konfigurasi Supabase Kamu
        const SUPABASE_URL = 'https://cevofxyyfvcaookqozmf.supabase.co';
        const SUPABASE_KEY = 'sb_publishable_xCma_WLsgPLEq-NOsTuQkg_bWF7ejk7';
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

        let currentRoomId = null;
        let myId = 'user_' + Math.random().toString(36.substring(2, 9));
        let messageSubscription = null;
        let roomSubscription = null;

        // UI Switcher
        function showScreen(screenId) {
            document.getElementById('welcomeScreen').classList.add('hidden');
            document.getElementById('searchingScreen').classList.add('hidden');
            document.getElementById('chatScreen').classList.add('hidden');
            document.getElementById(screenId).classList.remove('hidden');
        }

        // 1. Cari Partner
        async function findPartner() {
            showScreen('searchingScreen');
            document.getElementById('statusBadge').innerText = 'Mencari...';
            document.getElementById('statusBadge').className = 'px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium animate-pulse';

            // Cari kamar yang statusnya masih 'waiting'
            const { data: waitingRooms, error } = await supabaseClient
                .from('omegle_rooms')
                .select('*')
                .eq('status', 'waiting')
                .limit(1);

            if (waitingRooms && waitingRooms.length > 0) {
                // Masuk ke kamar yang sudah ada
                currentRoomId = waitingRooms[0].id;
                await supabaseClient
                    .from('omegle_rooms')
                    .update({ status: 'active' })
                    .eq('id', currentRoomId);

                startChatSession();
            } else {
                // Buat kamar baru dan tunggu partner masuk
                const { data: newRoom, error: createError } = await supabaseClient
                    .from('omegle_rooms')
                    .insert([{ status: 'waiting' }])
                    .select()
                    .single();

                if (createError) {
                    alert('Gagal membuat sesi!');
                    showScreen('welcomeScreen');
                    return;
                }

                currentRoomId = newRoom.id;
                listenForPartner();
            }
        }

        // Dengar jika ada partner yang masuk ke kamar kita
        function listenForPartner() {
            roomSubscription = supabaseClient
                .channel('room_' + currentRoomId)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'omegle_rooms', filter: `id=eq.${currentRoomId}` }, (payload) => {
                    if (payload.new.status === 'active') {
                        startChatSession();
                    }
                })
                .subscribe();
        }

        function cancelSearch() {
            if (currentRoomId) {
                supabaseClient.from('omegle_rooms').delete().eq('id', currentRoomId);
            }
            showScreen('welcomeScreen');
            document.getElementById('statusBadge').innerText = 'Offline';
            document.getElementById('statusBadge').className = 'px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium';
        }

        // Mulai Sesi Chat
        function startChatSession() {
            if (roomSubscription) supabaseClient.removeChannel(roomSubscription);
            showScreen('chatScreen');
            document.getElementById('statusBadge').innerText = 'Terhubung';
            document.getElementById('statusBadge').className = 'px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium';
            
            document.getElementById('chatContainer').innerHTML = `
                <div class="text-center py-2 text-[10px] text-emerald-400 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    Terhubung dengan orang asing! Katakan halo 👋
                </div>`;

            // Dengar pesan masuk di ruangan ini
            messageSubscription = supabaseClient
                .channel('messages_' + currentRoomId)
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'omegle_messages', filter: `room_id=eq.${currentRoomId}` }, (payload) => {
                    appendMessage(payload.new.sender === myId ? 'You' : 'Stranger', payload.new.content, payload.new.sender === myId);
                })
                .subscribe();
        }

        // Kirim Pesan
        async function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            if (!text || !currentRoomId) return;

            input.value = '';
            await supabaseClient.from('omegle_messages').insert([
                { room_id: currentRoomId, sender: myId, content: text }
            ]);
        }

        function handleKey(e) {
            if (e.key === 'Enter') sendMessage();
        }

        function appendMessage(sender, text, isMe) {
            const container = document.getElementById('chatContainer');
            const alignClass = isMe ? 'text-right' : 'text-left';
            const bubbleClass = isMe ? 'bg-sky-500 text-white ml-auto' : 'bg-slate-800 text-slate-200 mr-auto';

            container.innerHTML += `
                <div class="${alignClass} space-y-0.5">
                    <span class="text-[9px] text-slate-500">${sender}</span>
                    <div class="inline-block px-3 py-2 rounded-xl text-xs max-w-[80%] break-words ${bubbleClass}">${escapeHtml(text)}</div>
                </div>
            `;
            container.scrollTop = container.scrollHeight;
        }

        async function nextPartner() {
            leaveChat();
            findPartner();
        }

        async function leaveChat() {
            if (messageSubscription) supabaseClient.removeChannel(messageSubscription);
            if (currentRoomId) {
                await supabaseClient.from('omegle_rooms').delete().eq('id', currentRoomId);
                currentRoomId = null;
            }
            showScreen('welcomeScreen');
            document.getElementById('statusBadge').innerText = 'Offline';
            document.getElementById('statusBadge').className = 'px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[10px] font-medium';
        }

        function escapeHtml(text) {
            return String(text).replace(/[&<>"']/g, function (m) {
                return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
            });
        }
Berikut adalah langkah-langkah mudah untuk menerapkannya tanpa merusak fungsi yang sudah ada:

Langkah 1: Tambahkan Kolom mood di Supabase

// Di dalam fungsi savePost() saat mengambil input:
const selectedMood = document.querySelector('input[name="postMood"]:checked')?.value || 'chill';

// Saat melakukan insert ke Supabase:
const { error } = await supabaseClient
    .from('posts')
    .insert([{ 
        sender_name: senderName || 'Anonim', 
        content: content,
        mood: selectedMood // Simpan aura mood
    }]);
Langkah 4: Berikan Warna & Glow Dinamis di Fungsi Render Pesan
Saat menampilkan pesan di linimasa, buat fungsi kecil untuk mencocokkan gaya kartu berdasarkan mood yang tersimpan:

JavaScript
function getMoodStyle(mood) {
    switch(mood) {
        case 'rant':
            return {
                bg: 'bg-rose-950/20 border-rose-500/30 shadow-rose-950/50',
                badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                icon: 'flame',
                label: 'Rant'
            };
        case 'mystery':
            return {
                bg: 'bg-purple-950/20 border-purple-500/30 shadow-purple-950/50',
                badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                icon: 'sparkles',
                label: 'Mystery'
            };
        case 'melancholy':
            return {
                bg: 'bg-blue-950/20 border-blue-500/30 shadow-blue-950/50',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                icon: 'cloud-rain',
                label: 'Melancholy'
            };
        default: // chill
            return {
                bg: 'bg-slate-900/60 border-slate-800/80 shadow-black/40',
                badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                icon: 'coffee',
                label: 'Chill'
            };
    }
}

// Di dalam fungsi renderPosts, terapkan stylenya ke elemen kartu:
// const style = getMoodStyle(post.mood);
// <div class="rounded-2xl border p-4 shadow-xl backdrop-blur-md ${style.bg}"> ... </div>

const selectedMood = document.querySelector('input[name="postMood"]:checked')?.value || 'chill';



// Saat melakukan insert ke Supabase:

const { error } = await supabaseClient

.from('posts')

.insert([{

sender_name: senderName || 'Anonim',

content: content,

mood: selectedMood // Simpan aura mood

}]);
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
function getMoodStyle(mood) {
    switch(mood) {
        case 'rant':
            return {
                bg: 'bg-rose-950/20 border-rose-500/30 shadow-rose-950/50',
                badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                icon: 'flame',
                label: 'Rant'
            };
        case 'mystery':
            return {
                bg: 'bg-purple-950/20 border-purple-500/30 shadow-purple-950/50',
                badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
                icon: 'sparkles',
                label: 'Mystery'
            };
        case 'melancholy':
            return {
                bg: 'bg-blue-950/20 border-blue-500/30 shadow-blue-950/50',
                badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                icon: 'cloud-rain',
                label: 'Melancholy'
            };
        default: // chill
            return {
                bg: 'bg-slate-900/60 border-slate-800/80 shadow-black/40',
                badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
                icon: 'coffee',
                label: 'Chill'
            };
    }
}

// Di dalam fungsi renderPosts, terapkan stylenya ke elemen kartu:
// const style = getMoodStyle(post.mood);
// <div class="rounded-2xl border p-4 shadow-xl backdrop-blur-md ${style.bg}"> ... </div>
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
