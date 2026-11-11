function showTime() {
	document.getElementById('currentTime').innerHTML = new Date().toUTCString();
}
showTime();
setInterval(function () {
	showTime();
}, 1000);

// --- 1. FUNGSI REAL-TIME SUPABASE ---
function initRealtimeSubscription() {
    // Memantau tabel 'posts' secara live jika ada data baru (INSERT)
    supabaseClient
        .channel('public:posts')
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'posts' 
        }, payload => {
            console.log('Pesan baru diterima:', payload.new);
            // Langsung muat ulang atau masukkan pesan baru ke tampilan
            fetchPosts(); 
        })
        .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                console.log('Berhasil terhubung ke Supabase Realtime!');
            }
        });
}

// Panggil fungsi ini di bagian bawah script.js atau saat halaman pertama kali dimuat
document.addEventListener('DOMContentLoaded', () => {
    // Fungsi awal yang sudah ada (misal: fetchPosts())
    if (typeof fetchPosts === 'function') {
        fetchPosts();
    }
    // Aktifkan pendengar real-time
    initRealtimeSubscription();
});
