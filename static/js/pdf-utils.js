// PDF Certificate Creator
function createCertificate(name, course, score, filename = 'certificate.pdf') {
    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF not loaded');
        return;
    }
    // Create PDF in landscape orientation
    const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
    });
    
    // Set background color
    doc.setFillColor(247, 247, 247);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Add decorative border
    doc.setDrawColor(44, 62, 80);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);
    doc.setLineWidth(0.5);
    doc.rect(12, 12, 273, 186);
    
    // Add header text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(40);
    doc.setTextColor(44, 62, 80);
    doc.text('Certificate of Completion', 148.5, 40, { align: 'center' });
    
    // Add decoration line
    doc.setLineWidth(1);
    doc.line(74, 45, 223, 45);
    
    // Add main text
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', 148.5, 70, { align: 'center' });
    
    // Add name
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(String(name), 148.5, 90, { align: 'center' });
    
    // Add course details
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    doc.text('has successfully completed the course', 148.5, 110, { align: 'center' });
    
    // Add course name
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(course), 148.5, 130, { align: 'center' });
    
    // Add score
    doc.setFontSize(20);
    doc.setFont('helvetica', 'normal');
    doc.text('with a score of', 148.5, 150, { align: 'center' });
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    doc.text(String(score) + '%', 148.5, 170, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(44, 62, 80);
    const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    doc.text(date, 148.5, 185, { align: 'center' });
    
    // Save the PDF
    doc.save(filename);
}

// Expose functions for inline onclick handlers
window.createCertificate = createCertificate;
