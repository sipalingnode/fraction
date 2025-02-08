#!/bin/bash

curl -s https://data.zamzasalim.xyz/file/uploads/asclogo.sh | bash
sleep 5
# 1. Pengecekan apakah Node.js sudah terinstal
if ! command -v node &> /dev/null
then
    echo "Node.js belum terinstal. Menginstal Node.js versi 20.x..."
    # Menginstal Node.js versi 20.x dari NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js sudah terinstal."
fi

# 2. Pengecekan apakah pm2 sudah terinstal
if ! command -v pm2 &> /dev/null
then
    echo "pm2 belum terinstal. Menginstal pm2..."
    sudo apt-get install -y pm2
else
    echo "pm2 sudah terinstal."
fi

# 3. Pengecekan apakah repositori 'fraction' sudah ada dan hapus jika ada
if [ -d "fraction" ]; then
    echo "Repositori 'fraction' sudah ada. Menghapus repositori yang lama..."
    rm -rf fraction
else
    echo "Repositori 'fraction' tidak ditemukan."
fi

# 4. Mengkloning repositori fraction
echo "Mengkloning repositori fraction..."
git clone https://github.com/sipalingnode/fraction.git

# 5. Pindah ke direktori fraction dan instal dependensi
cd fraction
echo "Menginstal dependensi..."
npm install

# 6. Meminta pengguna memasukkan private key
echo "Masukkan private key Anda: "
read privatekey

# 7. Menyimpan private key ke dalam file wallet.txt di dalam folder fraction
echo "$privatekey" > wallet.txt
echo "Private key telah disimpan dalam file wallet.txt di dalam folder 'fraction'."

# 8. Jalankan bot menggunakan pm2
echo "Menjalankan bot menggunakan pm2..."
pm2 start bot.js --name "fraction-bot"

echo "Bot sekarang berjalan menggunakan pm2 dengan nama 'fraction-bot'."
echo "Untuk melihat log, gunakan: pm2 logs fraction-bot"
echo "Untuk menghentikan bot, gunakan: pm2 stop fraction-bot"
