import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { useDrag, useDrop } from "react-dnd";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./styles.css";

// A custom hook for drag-and-drop
const DraggableFile = ({ file, index, moveFile }) => {
  const [, drag] = useDrag(() => ({
    type: "FILE",
    item: { index },
  }));

  const [, drop] = useDrop(() => ({
    accept: "FILE",
    hover: (item) => {
      if (item.index !== index) {
        moveFile(item.index, index);
        item.index = index; // Update the dragged item's index
      }
    },
  }));

  return (
    <li ref={(node) => drag(drop(node))} className="file-item">
      {file.name}
    </li>
  );
};

const App = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdf, setMergedPdf] = useState(null);

  // Handle file uploads
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setPdfFiles([...pdfFiles, ...files]);
  };

  // Reorder files after drag-and-drop
  const moveFile = (fromIndex, toIndex) => {
    const updatedFiles = [...pdfFiles];
    const [movedFile] = updatedFiles.splice(fromIndex, 1);
    updatedFiles.splice(toIndex, 0, movedFile);
    setPdfFiles(updatedFiles);
  };

  // Merge PDFs
  const mergePdfs = async () => {
    const mergedPdfDoc = await PDFDocument.create();

    for (const file of pdfFiles) {
      const fileData = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileData);
      const copiedPages = await mergedPdfDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => mergedPdfDoc.addPage(page));
    }

    const mergedPdfBytes = await mergedPdfDoc.save();
    const blob = new Blob([mergedPdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setMergedPdf(url);
  };

  // Download merged PDF
  const downloadMergedPdf = () => {
    const link = document.createElement("a");
    link.href = mergedPdf;
    link.download = "merged.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="container">
        <h1 className="title">PDF Merger</h1>

        {/* Main section for file upload and buttons */}
        <div className="main-section">
          <div className="upload-section">
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileUpload}
              className="file-input"
            />
          </div>

          <div className="action-buttons">
            <button
              onClick={mergePdfs}
              className="merge-button"
              disabled={pdfFiles.length < 2}
            >
              Merge PDFs
            </button>

            {/* Show download button only after PDFs are merged */}
            {mergedPdf && (
              <button onClick={downloadMergedPdf} className="download-button">
                Download Merged PDF
              </button>
            )}
          </div>
        </div>

        {/* Show selected files below the main section */}
        {pdfFiles.length > 0 && (
          <div className="file-list">
            <h2>Uploaded Files</h2>
            <ul>
              {pdfFiles.map((file, index) => (
                <DraggableFile
                  key={index}
                  index={index}
                  file={file}
                  moveFile={moveFile}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default App;
