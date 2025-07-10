const http = require('http');
const fs = require('fs');
const url = require('url');
const { exec } = require('child_process');

const { minify } = require('html-minifier-terser');
const JavaScriptObfuscator = require('javascript-obfuscator');
const path = require('path');

const port = 3000;

// const getFormPage = () => `
// <!DOCTYPE html>
// <html lang="id">
// <head>
// <meta charset="UTF-8" />
// <meta name="viewport" content="width=device-width, initial-scale=1" />
// <title>Input Data</title>
// <!-- Bootstrap CSS -->
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
// </head>
// <body class="container mt-5">
//   <h1 class="mb-4">Masukkan Data</h1>
//   <form method="POST" action="/generate">
//      <div class="mb-3">
//       <label for="prompt" class="form-label">Prompt Andalan</label>
//       <pre class="form-control" name="prompt" rows="5">
// Aku ingin kamu di chat ini membuatkan soal pilihan ganda dari text yang akan aku berikan
// Aku ingin jenis soalnya adalah ma‘lumatiyyah
// Contoh:  

// ➡️Buah yang kaya akan vitamin C adalah...?
// Pisang
// Semangka
// Jeruk ✅
// Apel

// Jangan menggunakan simbol selain yang disebutkan.
// Gunakan Bahasa Arab.
// 	  </pre>
//     </div>
	
//     <div class="mb-3">
//       <label for="namaFile" class="form-label">Nama File</label>
//       <input type="text" class="form-control" id="namaFile" name="namaFile" placeholder="Nama File (contoh: index.html)" value="index.html" required />
//     </div>
//     <div class="mb-3">
//       <label for="soal" class="form-label">Input Data Soal</label>
//       <textarea class="form-control" id="soal" name="soal" rows="5">▪️▪️▪️▪️▪️\n➡️Buah yang kaya akan vitamin C adalah...?\nPisang\nSemangka\nJeruk ✅\nApel</textarea>
//     </div>
//     <div class="mb-3">
//       <label for="chatId" class="form-label">Chat ID Telegram</label>
//       <input type="text" class="form-control" id="chatId" name="chatId" value="5432124045" />
//     </div>
//     <div class="mb-3">
//       <label for="tokenTele" class="form-label">Token Telegram</label>
//       <input type="text" class="form-control" id="tokenTele" name="tokenTele" value="5990360046:AAH6-VOZsWG39YRtmMuIx9YvJVN5T18ZpZE" />
//     </div>
//     <div class="mb-3">
//       <label for="linkGrup" class="form-label">Link Grup Telegram</label>
//       <input type="text" class="form-control" id="linkGrup" name="linkGrup" value="https://t.me/+qmnvnJxqXC1mZDc9" />
//     </div>
//     <div class="mb-3">
//       <label for="domData" class="form-label">Data DOM untuk HTML</label>
//       <textarea class="form-control" id="domData" name="domData" rows="3"><h1>Quiz Interaktif</h1>Jawablah setiap pertanyaan dengan benar.</textarea>
//     </div>
//     <div class="mb-3">
//       <label for="creditStatement" class="form-label">Credit Statement</label>
//       <textarea class="form-control" id="creditStatement" name="creditStatement" rows="2">This quiz was created by Abu Ardlin Salman.</textarea>
//     </div>
//     <button type="submit" class="btn btn-primary w-100">Generate File</button>
//   </form>

//   <!-- Bootstrap JS Bundle with Popper -->
//   <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
// </body>
// </html>
// `;
async function processHtmlString(htmlContent, obfuscateOptions = {}, minifyOptions = {}) {
  // Step 1: Ambil semua <script> dan obfuscate JS
  let scripts = [];
  let htmlWithPlaceholders = htmlContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (match, jsCode) => {
    scripts.push(jsCode);
    return `__OBFUSCATED_SCRIPT_${scripts.length - 1}__`;
  });

  // Obfuscate JS
  scripts = scripts.map(code =>
    `<script>${JavaScriptObfuscator.obfuscate(code, obfuscateOptions).getObfuscatedCode()}</script>`
  );

  // Replace kembali
  let finalHtml = htmlWithPlaceholders.replace(/__OBFUSCATED_SCRIPT_(\d+)__/g, (_, idx) => scripts[parseInt(idx)]);

  // Minify HTML
  const minified = await minify(finalHtml, minifyOptions);

  return minified; // Mengembalikan hasil sebagai string
}

function convertToJSON(inputText) {
  const lines = inputText.trim().split('\n');
  const result = [];

  let currentQuestion = '';
  let options = [];
  let answer = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line === '') continue;

    if (line.startsWith('➡️')) {
      if (currentQuestion) {
        result.push({ question: currentQuestion, options, answer });
      }

      currentQuestion = line.replace(/^➡️\s*/, '');
      options = [];
      answer = '';

    } else {
      if (!line.includes('▪️')) {
        if (line.includes('✅')) {
          answer = line.replace('✅', '').trim();
          options.push(answer);
        } else {
          options.push(line);
        }
      }
    }
  }

  // Push the last question after loop ends
  if (currentQuestion) {
    result.push({ question: currentQuestion, options, answer });
  }

  // Kembalikan hasil sebagai string JSON
  return JSON.stringify(result, null, 2);
}

  const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/generate') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      var namaFile = params.get('namaFile') || 'index.html';
      function sanitizeFileNameExcludeArabic(filename) {
		// Menghapus:
		// - Semua karakter Arab (Unicode \u0600-\u06FF)
		// - Semua karakter selain huruf Latin, angka, spasi, titik, underscore, dan strip
		return filename.replace(/[^a-zA-Z0-9.\-_ ]|[\u0600-\u06FF]/g, '_');
	  }

	  namaFile = sanitizeFileNameExcludeArabic(namaFile);

      var soal = params.get('soal') || '';
      soal = convertToJSON(soal);
      const chatId = params.get('chatId') || '';
      const tokenTele = params.get('tokenTele') || '';
      const linkGrup = params.get('linkGrup') || '';
      const domData = params.get('domData') || '';
      const creditStatement = params.get('creditStatement') || '';

      const htmlPath = path.join(__dirname, '📃 template1_quiz_V2.html');
      fs.readFile(htmlPath, 'utf-8', async (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/html' });
          res.end('<h1>Gagal membaca file template.html</h1>');
          return;
        }
 

        //apabila namaFile tidak diakhiri dengan .html meka ditambahkan
        namaFile = (namaFile || 'index.html').endsWith('.html') 
        ? namaFile 
        : (namaFile + '.html');
 

        var htmlContent = data;

        function replaceLines(htmlData, keyword, replacement) {
            return htmlData
                .split('\n') // Memisahkan data menjadi array per baris
                .map(line => {
                    line = line.trim();
                    // console.log(`Sebelum: ${line}`);
                    const replacedLine = line.startsWith(keyword) ? line = replacement : line;
                    // console.log(`Sesudah: ${replacedLine}`);
                    return replacedLine;
                })
                .join('\n'); // Menggabungkan kembali menjadi teks HTML
        }

        htmlContent = replaceLines(htmlContent, "let questions = [", "let questions = " + soal + ";")
        htmlContent = replaceLines(htmlContent, "const chatId = '", "const chatId = \"" + chatId + "\";")
        htmlContent = replaceLines(htmlContent, "href=\"https://t.me/", "href=" + "\""+linkGrup + "\"" )
        htmlContent = replaceLines(htmlContent, '<div id="description"><h1>', "<div id=\"description\">" + domData + "</div>")
        htmlContent = replaceLines(htmlContent,
          '<p style=" font-size: 0.5em; ">',
          '<p style=" font-size: 0.5em; ">' + creditStatement + '</p>'
        );

        function encodeBase64(input) {
            return Buffer.from(input, 'utf-8').toString('base64');
        }
        htmlContent = replaceLines(htmlContent, 'const bbbbbbb = ', "const bbbbbbb = \"" + encodeBase64(tokenTele) + "\";")
        htmlContent = replaceLines(htmlContent, 'const fileName =', "const fileName = \"" + namaFile + "\";")


        htmlContent = await processHtmlString(
          htmlContent,
          { compact: true, controlFlowFlattening: true },
          { collapseWhitespace: true, removeComments: true, minifyCSS: true, minifyJS: false }
        );

        res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${namaFile}"`,
        });
        res.end(htmlContent);

      });
    });
  } 
  else if (req.method === 'GET') {
    const parsedUrl = url.parse(req.url, true);
    let filePath = '';
    
    if (parsedUrl.pathname === '/') {
      filePath = path.join(__dirname, '🏘 main.html');
    } else if (parsedUrl.pathname === '/questionsGenerator') {
      filePath = path.join(__dirname, '🖥 questionsGenerator.html');
    }

    if (filePath) {
      fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Terjadi kesalahan saat membaca file HTML.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
  }
});

server.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
  exec(`start http://localhost:${port}`); // Untuk Windows

});
