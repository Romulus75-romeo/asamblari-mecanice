// Google Apps Script pentru salvarea rezultatelor elevilor
// INSTRUCȚIUNI DE INSTALARE:
// 1. Mergi la https://docs.google.com/spreadsheets și creează un spreadsheet nou
// 2. Redenumește-l: "Rezultate Elevi - Asamblări Mecanice"
// 3. În spreadsheet, mergi la Extensions > Apps Script
// 4. Șterge codul existent și lipește acest cod
// 5. Salvează (Ctrl+S)
// 6. Click pe "Deploy" > "New deployment"
// 7. Selectează "Web app"
// 8. Setează "Execute as: Me" și "Who has access: Anyone"
// 9. Click "Deploy" și copiază URL-ul generat
// 10. Pune URL-ul în app.js unde scrie GOOGLE_SCRIPT_URL

function doPost(e) {
    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

        // Dacă e primul rând, adaugă header
        if (sheet.getLastRow() === 0) {
            sheet.appendRow(['Timestamp', 'Nume', 'Email', 'Clasă', 'Test', 'Scor %', 'Corecte', 'Total', 'Platformă']);
        }

        var data = JSON.parse(e.postData.contents);

        sheet.appendRow([
            new Date().toLocaleString('ro-RO'),
            data.name,
            data.email,
            data.class,
            data.test,
            data.score,
            data.correct,
            data.total,
            data.platform || 'Asamblări Mecanice'
        ]);

        return ContentService
            .createTextOutput(JSON.stringify({ success: true, message: 'Rezultat salvat!' }))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        return ContentService
            .createTextOutput(JSON.stringify({ success: false, message: error.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
    }
}

function doGet(e) {
    return ContentService
        .createTextOutput(JSON.stringify({ status: 'OK', message: 'Script funcțional!' }))
        .setMimeType(ContentService.MimeType.JSON);
}
