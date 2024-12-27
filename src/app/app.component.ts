import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  jsonData: { [key: string]: any }[] = [];
  transformedData: { GUID: string; Value: string }[] = [];

  /**
   * Handle JSON File Upload
   * @param event - File input change event
   */
  onFileUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          this.jsonData = Array.isArray(data) ? data : [data]; // Support array or object
          this.transformData();
        } catch (error) {
          alert('Invalid JSON file. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }

  /**
   * Transform JSON Data into GUID and Value format
   */
  transformData() {
    this.transformedData = [];
    this.jsonData.forEach((obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        const guid = this.generateGUIDWithoutDashes(key);
        this.transformedData.push({ GUID: guid, Value: String(value) });
      });
    });
  }

  /**
   * Export the transformed data to an Excel file
   */
  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.transformedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, 'exported_data');
  }

  /**
   * Save the generated Excel file
   * @param buffer - Excel file buffer
   * @param fileName - Name of the file
   */
  saveAsExcelFile(buffer: any, fileName: string) {
    const data = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(data, `${fileName}.xlsx`);
  }

  /**
   * Generate GUID Without Dashes
   * @param input - Input string
   * @returns GUID string
   */
  generateGUIDWithoutDashes(input: string): string {
    const hash = this.fnv1aHash(input);
    const hexHash = hash.toString(16).padStart(32, '0');
    return `${hexHash.slice(0, 8)}${hexHash.slice(8, 12)}4${hexHash.slice(
      12,
      15
    )}${hexHash
      .slice(15, 19)
      .replace(/^./, (c) =>
        ((parseInt(c, 16) & 0x3) | 0x8).toString(16)
      )}${hexHash.slice(19, 31)}`;
  }

  /**
   * FNV-1a Hashing Function
   * @param str - Input string
   * @returns Hash value
   */
  fnv1aHash(str: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = (hash * 0x1000193) >>> 0;
    }
    return hash;
  }
}
