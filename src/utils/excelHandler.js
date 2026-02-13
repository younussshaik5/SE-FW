// ========================================
// Excel Handler Utility (Wrapper for SheetJS)
// ========================================

const ExcelHandler = {
    /**
     * Parse an Excel or CSV file into a JSON array of objects.
     * @param {File} file - The file object from input.
     * @returns {Promise<Array>} - Array of row objects.
     */
    parse(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    // Use first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];

                    // Convert to JSON
                    const json = XLSX.utils.sheet_to_json(worksheet);
                    resolve(json);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Generate and download an Excel file from a JSON array.
     * @param {Array} data - Array of row objects.
     * @param {string} filename - Name of the file to download.
     */
    generate(data, filename = 'export.xlsx') {
        try {
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
            XLSX.writeFile(workbook, filename);
            return true;
        } catch (error) {
            console.error("Excel generation failed:", error);
            return false;
        }
    }
};

window.ExcelHandler = ExcelHandler;
export default ExcelHandler;
