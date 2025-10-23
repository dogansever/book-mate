import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserBooks } from '../contexts/UserBooksContext';
import { GoogleBooksService } from '../services/googleBooksService';
import { Book, ReadingStatus } from '../types/book';
import './BookImport.css';

interface ImportRow {
  isbn: string;
  status: ReadingStatus;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ isbn: string; error: string }>;
}

const BookImport: React.FC = () => {
  const { user } = useAuth();
  const { addBook } = useUserBooks();
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<ImportRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.csv')) {
      alert('Lütfen CSV veya Excel (.xls, .xlsx) dosyası seçin');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = async (file: File) => {
    setIsLoading(true);
    try {
      const text = await file.text();
      const rows = text.split('\n').filter(row => row.trim());
      
      if (rows.length === 0) {
        alert('Dosya boş görünüyor');
        return;
      }

      // Skip header row if exists
      const dataRows = rows[0].toLowerCase().includes('isbn') ? rows.slice(1) : rows;
      
      const parsedData: ImportRow[] = [];
      
      for (const row of dataRows) {
        const columns = row.split(/[,;\t]/).map(col => col.trim().replace(/"/g, ''));
        
        if (columns.length < 2) continue;
        
        const isbn = columns[0];
        const statusText = columns[1].toLowerCase();
        
        let status: ReadingStatus = 'want-to-read';
        if (statusText.includes('okudum') || statusText.includes('read') || statusText === '1') {
          status = 'read';
        } else if (statusText.includes('okuyorum') || statusText.includes('reading')) {
          status = 'currently-reading';
        }
        
        if (isbn) {
          parsedData.push({ isbn, status });
        }
      }
      
      setImportData(parsedData);
    } catch (error) {
      console.error('File parsing error:', error);
      alert('Dosya okunurken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!user || importData.length === 0) return;

    setIsLoading(true);
    const importResult: ImportResult = {
      success: 0,
      failed: 0,
      errors: []
    };

    for (const row of importData) {
      try {
        // Clean and validate ISBN
        const cleanIsbn = row.isbn.replace(/[-\s]/g, '');
        if (!/^\d{10}(\d{3})?$/.test(cleanIsbn)) {
          importResult.failed++;
          importResult.errors.push({ isbn: row.isbn, error: 'Geçersiz ISBN formatı' });
          continue;
        }

        // Search book by ISBN
        const searchResult = await GoogleBooksService.searchBooks({ 
          query: '', 
          isbn: cleanIsbn 
        });
        
        if (searchResult.books.length === 0) {
          importResult.failed++;
          importResult.errors.push({ isbn: row.isbn, error: 'Kitap bulunamadı' });
          continue;
        }

        const googleBook = searchResult.books[0];
        
        // Convert to our Book format
        const book: Book = {
          id: googleBook.id,
          googleBooksId: googleBook.id,
          title: googleBook.title,
          authors: googleBook.authors,
          isbn: cleanIsbn,
          publishedDate: googleBook.publishedDate,
          imageLinks: googleBook.imageLinks,
          description: googleBook.description,
          pageCount: googleBook.pageCount,
          categories: googleBook.categories,
          publisher: googleBook.publisher
        };

        await addBook(book, row.status);
        importResult.success++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Error importing ${row.isbn}:`, error);
        importResult.failed++;
        importResult.errors.push({ 
          isbn: row.isbn, 
          error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
        });
      }
    }

    setImportResult(importResult);
    setIsLoading(false);
  };

  const resetImport = () => {
    setFile(null);
    setImportData([]);
    setImportResult(null);
  };

  const downloadSampleCSV = (format: 'text' | 'numeric' = 'text') => {
    const sampleData = format === 'text' ? [
      ['ISBN', 'Durum'],
      ['9789750719387', 'okudum'],
      ['9789754705246', 'okuyorum'],
      ['9789753638029', 'okuyacağım'],
      ['9789754706840', 'okudum'],
      ['9789750718601', 'okuyacağım'],
      ['9789754378929', 'okuyorum'],
      ['9789750412356', 'okudum'],
      ['9789754378912', 'okuyacağım'],
      ['9789750410234', 'okudum'],
      ['9789754705123', 'okuyacağım']
    ] : [
      ['ISBN', 'Durum'],
      ['9789750719387', '1'],
      ['9789754705246', '0'],
      ['9789753638029', '0'],
      ['9789754706840', '1'],
      ['9789750718601', '0'],
      ['9789754378929', '0'],
      ['9789750412356', '1'],
      ['9789754378912', '0'],
      ['9789750410234', '1'],
      ['9789754705123', '0']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kitap-listesi-ornek-${format === 'text' ? 'metin' : 'sayi'}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="book-import">
      <div className="import-header">
        <h2>📚 Excel/CSV ile Kitap İçe Aktarma</h2>
        <p>ISBN listesi ve okuma durumlarını toplu olarak kütüphanenize ekleyin</p>
      </div>

      <div className="import-instructions">
        <h3>📋 Dosya Formatı</h3>
        <ul>
          <li><strong>1. Kolon:</strong> ISBN (10 veya 13 haneli)</li>
          <li><strong>2. Kolon:</strong> Okuma Durumu</li>
          <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
            <li><strong>Metin Format:</strong> okudum, okuyorum, okuyacağım</li>
            <li><strong>Sayı Format:</strong> 1 (okudum), 0 (okuyacağım)</li>
          </ul>
        </ul>
        <div className="example-section">
          <p><strong>Örnek:</strong></p>
          <code>
            9789750719387,okudum<br/>
            9789754705246,okuyorum<br/>
            9789753638029,okuyacağım
          </code>
          <div className="sample-download-buttons">
            <button 
              onClick={() => downloadSampleCSV('text')}
              className="download-sample-button"
            >
              📥 Örnek CSV İndir (Metin)
            </button>
            <button 
              onClick={() => downloadSampleCSV('numeric')}
              className="download-sample-button secondary"
            >
              📥 Örnek CSV İndir (Sayısal)
            </button>
          </div>
        </div>
      </div>

      {!file && !importResult && (
        <div 
          className={`file-drop-zone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="drop-content">
            <span className="drop-icon">📁</span>
            <p>Excel/CSV dosyanızı buraya sürükleyin</p>
            <p>veya</p>
            <input
              type="file"
              id="file-input"
              accept=".csv,.xls,.xlsx"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              style={{ display: 'none' }}
            />
            <label htmlFor="file-input" className="file-select-button">
              Dosya Seç
            </label>
          </div>
        </div>
      )}

      {file && importData.length > 0 && !importResult && (
        <div className="import-preview">
          <div className="preview-header">
            <h3>📖 İçe Aktarılacak Kitaplar ({importData.length})</h3>
            <button onClick={resetImport} className="reset-button">
              Yeniden Başla
            </button>
          </div>
          
          <div className="preview-table">
            <div className="table-header">
              <span>ISBN</span>
              <span>Durum</span>
            </div>
            {importData.slice(0, 10).map((row, index) => (
              <div key={index} className="table-row">
                <span>{row.isbn}</span>
                <span className={`status-badge ${row.status}`}>
                  {row.status === 'read' ? '✅ Okudum' : 
                   row.status === 'currently-reading' ? '📖 Okuyorum' : 
                   '📚 Okuyacağım'}
                </span>
              </div>
            ))}
            {importData.length > 10 && (
              <div className="more-indicator">
                ... ve {importData.length - 10} kitap daha
              </div>
            )}
          </div>

          <div className="import-actions">
            <button 
              onClick={handleImport} 
              disabled={isLoading}
              className="import-button"
            >
              {isLoading ? 'İçe Aktarılıyor... 📥' : `${importData.length} Kitabı İçe Aktar 🚀`}
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="import-result">
          <div className="result-header">
            <h3>🎉 İçe Aktarma Tamamlandı!</h3>
          </div>
          
          <div className="result-stats">
            <div className="stat-card success">
              <span className="stat-number">{importResult.success}</span>
              <span className="stat-label">Başarılı</span>
            </div>
            <div className="stat-card failed">
              <span className="stat-number">{importResult.failed}</span>
              <span className="stat-label">Başarısız</span>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div className="error-details">
              <h4>❌ Başarısız Olan Kitaplar</h4>
              <div className="error-list">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="error-item">
                    <span className="error-isbn">{error.isbn}</span>
                    <span className="error-message">{error.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button onClick={resetImport} className="new-import-button">
              Yeni İçe Aktarma 🔄
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">📚</div>
          <p>Kitaplar içe aktarılıyor...</p>
        </div>
      )}
    </div>
  );
};

export default BookImport;