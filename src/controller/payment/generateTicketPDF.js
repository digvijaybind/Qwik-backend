const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const generateTicketPDF = (ticketDetails) => {
  try {
    // Define the directory and file path
    const ticketsDir = path.join(__dirname, 'tickets');
    const fileName = `Air_Ambulance_Booking_Ticket_${ticketDetails.id}.pdf`;
    const filePath = path.join(ticketsDir, fileName);

    // Ensure the tickets directory exists
    if (!fs.existsSync(ticketsDir)) {
      fs.mkdirSync(ticketsDir, { recursive: true });
    }

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filePath));

    // Add Qwiklif logo
    const logoPath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'public',
      'images',
      'qwikliflogo.png',
    );
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 30, { width: 80 });
    }

    // Add title
    doc
      .font('Helvetica-Bold')
      .fontSize(18) // Reduced font size for a better layout
      .fillColor('#004080')
      .text('Air Ambulance Ticket Confirmation', { align: 'center' })
      .moveDown(1.5); // Increased spacing below the title

    // Add introductory text
    doc
      .fontSize(16)
      .fillColor('#333333')
      .text('Thank you for booking with Qwiklif!', { align: 'center' })
      .moveDown(2);

    // Add ticket details
    doc
      .fontSize(14)
      .fillColor('#000000')
      .text(
        `Ticket ID: ${ticketDetails.id} | Name: ahmed | Event: Booking Air ambulance`,
        { align: 'center' },
      )
      .moveDown(2);

    // Add Estimated Cost of Transfer
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Estimated Cost of Transfer:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(`Currency: AED`)
      .text(`Amount: 50000`)
      .moveDown(2);

    // Add Medical Team
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Medical Team:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(`Paramedics: ${ticketDetails.paramedics.join(', ') || 'N/A'}`)
      .text(`Doctors: ${ticketDetails.doctors.join(', ') || 'N/A'}`)
      .moveDown(2);

    // Add Patient Care and Comfort
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Patient Care and Comfort:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(
        'Specialized Stretchers: Designed for patient comfort and safety during transfer.',
      )
      .text(
        'Medical Supplies: Dressings, bandages, catheters, and other necessary supplies.',
      )
      .text(
        "Personal Items: Space for patient's personal belongings, if needed.",
      )
      .moveDown(2);

    // Add Logistics and Coordination
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Logistics and Coordination:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(
        'Ground Transportation: Coordination of ground ambulance services to and from the aircraft.',
      )
      .text(
        'Flight Coordination: Planning and arranging the flight path, permissions, and clearances.',
      )
      .text(
        'Communication Systems: For constant contact between the air crew and ground medical team.',
      )
      .moveDown(2);

    // Add Support Services
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Support Services:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(
        'Medical Escort Services: For non-critical patients who may not require a full medical team.',
      )
      .text(
        'Family Support: Arrangements for family members to accompany the patient, if feasible.',
      )
      .text(
        'Post-Flight Care: Coordination with receiving medical facilities for continued care upon arrival.',
      )
      .moveDown(2);

    // Add Safety and Compliance
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Safety and Compliance:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(
        'Insurance Handling: Coordination with insurance providers for coverage and claims processing.',
      )
      .text(
        'Legal and Regulatory Compliance: Ensuring all operations comply with aviation and healthcare regulations.',
      )
      .text(
        'Infection Control: Protocols to prevent cross-contamination and infection.',
      )
      .moveDown(2);

    // Add Additional Services
    doc
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor('#004080')
      .text('Additional Services:', { underline: true })
      .moveDown(1)
      .font('Helvetica')
      .fontSize(14)
      .fillColor('#333333')
      .text(
        'Language Support: Multilingual staff or translation services to assist with communication.',
      )
      .text(
        'Catering: Provision of meals and refreshments for long-distance transfers.',
      )
      .moveDown(2);

    // Add footer text
    doc
      .fontSize(12)
      .fillColor('#999999')
      .text('Generated by Qwiklif', { align: 'center' })
      .moveDown(0.5)
      .text('For more information, visit: https://www.qwiklif.com', {
        align: 'center',
      });

    // Add footer line
    doc
      .moveTo(50, doc.page.height - 50)
      .lineTo(doc.page.width - 50, doc.page.height - 50)
      .stroke('#CCCCCC');

    // Finish PDF creation
    doc.end();

    // Log the path for debugging
    console.log('PDF generated at:', filePath);

    return filePath;
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

module.exports = { generateTicketPDF };
