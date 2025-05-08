import React, { useEffect, useState, useCallback } from "react"; 
import { saveAs } from "file-saver";
import { getSalesReport } from "../api";
import { jsPDF } from "jspdf";
import "./AdminSalesReport.css";

const SalesReport = () => {
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortOrder, setSortOrder] = useState("Newest");

  const fetchReport = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();

      // Change in fetchReport callback:
      if (status !== "All") queryParams.append("status", status);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);
      // Update the sortOrder parameter value to match the new values:
      queryParams.append("sortOrder", sortOrder.toLowerCase()); // Convert "Newest" to "newest" for API

      const res = await getSalesReport(queryParams.toString());
      setReport(res);
    } catch (error) {
      console.error("Error fetching report:", error);
    }
  }, [status, startDate, endDate, sortOrder]); // Include sortOrder in dependencies

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleResetFilters = () => {
    setStatus("All");
    setStartDate("");
    setEndDate("");
    setSortOrder("Newest"); // Reset sort order to default
  };

  // Handle sorting locally if API doesn't support it
  const sortedOrders = React.useMemo(() => {
    if (!report || !report.orders) return [];
    
    return [...report.orders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      return sortOrder === "Newest" ? dateB - dateA : dateA - dateB;
    });
  }, [report, sortOrder]);

  // Format date for reports
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get current date/time formatted for filenames
  const getFormattedDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10).replace(/-/g, "");
  };

  const exportToExcel = () => {
    try {
      // Define colors to match PDF export
      const colors = {
        primary: "#1034A6",      // Deep royal blue
        secondary: "#0C2461",    // Darker blue
        accent: "#DAA520",       // Gold
        light: "#EBF0FF",        // Light blue tint
        alternate: "#F5F5FF",    // Almost white with blue tint
        white: "#FFFFFF",
        black: "#000000",
        success: "#2E7D32",      // Green for completed status
        processing: "#1565C0",   // Blue for processing status
        pending: "#EF6C00",      // Orange for pending status
        cancelled: "#C62828"     // Red for cancelled status
      };
  
      // Format date properly
      const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN');
      };
      
      // Get timestamp for filename
      const getFormattedDateTime = () => {
        const now = new Date();
        return now.toISOString().split('T')[0] + '_' + 
              now.toTimeString().split(' ')[0].replace(/:/g, '-');
      };
  
      // Create filter text for report header
      let filterText = "All Orders";
      if (typeof status !== 'undefined' && status !== "All") {
        filterText = `Status: ${status}`;
      }
      if (typeof startDate !== 'undefined' && typeof endDate !== 'undefined' && startDate && endDate) {
        filterText += ` | Period: ${formatDate(startDate)} - ${formatDate(endDate)}`;
      } else if (typeof startDate !== 'undefined' && startDate) {
        filterText += ` | From: ${formatDate(startDate)}`;
      } else if (typeof endDate !== 'undefined' && endDate) {
        filterText += ` | Until: ${formatDate(endDate)}`;
      }
      filterText += ` | Sort: ${sortOrder === "Newest" ? "Newest First" : "Oldest First"}`;
  
      // Function to get status color based on status value
      const getStatusColor = (status) => {
        switch(status) {
          case 'Completed': return colors.success;
          case 'Processing': return colors.processing;
          case 'Pending': return colors.pending;
          case 'Cancelled': return colors.cancelled;
          default: return colors.black;
        }
      };
  
      // Create HTML template with advanced styling to match PDF export
      const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" 
            xmlns:x="urn:schemas-microsoft-com:office:excel" 
            xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <meta name="ProgId" content="Excel.Sheet">
        <meta name="Generator" content="Microsoft Excel 15">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>Sales Report</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                  <x:Print>
                    <x:ValidPrinterInfo/>
                    <x:FitWidth>1</x:FitWidth>
                    <x:FitHeight>1</x:FitHeight>
                    <x:PaperSize>9</x:PaperSize>
                    <x:HorizontalResolution>600</x:HorizontalResolution>
                    <x:VerticalResolution>600</x:VerticalResolution>
                  </x:Print>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          /* Global Styles */
          body, table { font-family: 'Calibri', 'Segoe UI', sans-serif; font-size: 11pt; }
          table { border-collapse: collapse; width: 100%; }
          td { padding: 5px 7px; vertical-align: middle; }
          
          /* Company Header */
          .company-header { background-color: ${colors.primary}; color: ${colors.white}; height: 50px; }
          .company-name { font-size: 20pt; font-weight: bold; text-align: center; letter-spacing: 0.5px; }
          .gold-accent { background-color: ${colors.accent}; height: 5px; }
          
          /* Company Details */
          .company-details { background-color: ${colors.light}; height: 40px; }
          .company-address { font-size: 10pt; text-align: center; color: ${colors.black}; }
          .company-gstin { font-size: 10pt; text-align: center; color: ${colors.black}; }
          
          /* Report Header */
          .report-header { background-color: ${colors.secondary}; color: ${colors.white}; font-size: 14pt; font-weight: bold; text-align: center; height: 25px; }
          .report-filter { font-style: italic; text-align: center; font-size: 10pt; color: ${colors.black}; }
          
          /* Summary Box */
          .summary-box { background-color: ${colors.primary}; color: ${colors.white}; border-radius: 8px; }
          .summary-item { font-weight: bold; text-align: left; color: ${colors.white}; padding: 5px; }  
          .summary-accent { background-color: ${colors.accent}; height: 3px; }
          
          /* Table Header */
          .table-header { background-color: ${colors.primary}; color: ${colors.white}; font-weight: bold; text-align: center; }
          .table-header-cell { border: 1px solid ${colors.secondary}; }
          
          /* Table Rows */
          .table-row-even { background-color: ${colors.light}; }
          .table-row-odd { background-color: ${colors.alternate}; }
          .table-cell { border: 1px solid #D0D0D0; }
          
          /* Cell Alignments */
          .align-left { text-align: left; }
          .align-center { text-align: center; }
          .align-right { text-align: right; }
          
          /* Footer */
          .footer { font-size: 9pt; text-align: center; background-color: ${colors.primary}; color: ${colors.white}; }
          .footer-accent { background-color: ${colors.accent}; height: 3px; }
        </style>
      </head>
      <body>
        <!-- Company Header -->
        <table border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="company-header" colspan="6">
              <div class="company-name">JAY AGENCIES</div>
            </td>
          </tr>
          <tr>
            <td class="gold-accent" colspan="6"></td>
          </tr>
          
          <!-- Company Details -->
          <tr>
            <td class="company-details" colspan="6">
              <div class="company-address">2/1, Meenatchi Nagar, Hasthampatti, Salem 636007</div>
              <div class="company-gstin">GSTIN/UIN: 33AGAPR3442B1ZZ</div>
            </td>
          </tr>
          
          <!-- Report Header -->
          <tr>
            <td class="report-header" colspan="6">SALES REPORT</td>
          </tr>
          
          <!-- Filter Info -->
          <tr>
            <td class="report-filter" colspan="6">${filterText}</td>
          </tr>
          
          <!-- Spacer -->
          <tr><td colspan="6" height="15"></td></tr>
          
          <!-- Summary Box with Gold Accent -->
          <tr>
            <td colspan="6">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="summary-accent" colspan="6"></td>
                </tr>
                <tr>
                  <td class="summary-box" colspan="6">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td class="summary-item" width="25%">Total Sales: Rs. ${report.totalSales || 0}</td>
                        <td class="summary-item" width="25%">Total Orders: ${report.numberOfOrders || 0}</td>
                        <td class="summary-item" width="25%">Avg. Order Value: Rs. ${report.averageOrderValue ? report.averageOrderValue.toFixed(2) : "0.00"}</td>
                        <td class="summary-item" width="25%">Generated: ${formatDate(new Date())}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td colspan="6" height="15"></td></tr>
          
          <!-- Table Header with Gold Accent -->
          <tr>
            <td colspan="6">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="summary-accent" colspan="6"></td>
                </tr>
                <tr>
                  <td class="table-header table-header-cell" width="18%">Order ID</td>
                  <td class="table-header table-header-cell" width="15%">Customer</td>
                  <td class="table-header table-header-cell" width="25%">Email</td>
                  <td class="table-header table-header-cell" width="12%">Amount (Rs.)</td>
                  <td class="table-header table-header-cell" width="15%">Status</td>
                  <td class="table-header table-header-cell" width="15%">Order Date</td>
                </tr>
                
                <!-- Table Rows -->
                ${sortedOrders.map((order, index) => `
                <tr class="${index % 2 === 0 ? 'table-row-even' : 'table-row-odd'}">
                  <td class="table-cell align-left">${order._id || 'N/A'}</td>
                  <td class="table-cell align-left">${order.user?.name || 'N/A'}</td>
                  <td class="table-cell align-left">${order.user?.email || 'N/A'}</td>
                  <td class="table-cell align-right">Rs. ${order.total || 0}</td>
                  <td class="table-cell align-center" style="color: ${getStatusColor(order.status)};">${order.status || 'N/A'}</td>
                  <td class="table-cell align-center">${formatDate(order.createdAt)}</td>
                </tr>
                `).join('')}
              </table>
            </td>
          </tr>
          
          <!-- Spacer -->
          <tr><td colspan="6" height="15"></td></tr>
          
          <!-- Footer -->
          <tr>
            <td colspan="6">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td class="footer-accent" colspan="6"></td>
                </tr>
                <tr>
                  <td class="footer" colspan="6">Generated by: JAY AGENCIES ERP System</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;
      
      // Create a blob and save it with proper file extension
      const blob = new Blob([htmlContent], {type: 'application/vnd.ms-excel'});
      const filename = `JayAgencies_SalesReport_${getFormattedDateTime()}.xls`;
      saveAs(blob, filename);
      
      console.log("Styled Excel report generated successfully!");
    } catch (error) {
      console.error("Error generating styled Excel:", error);
      alert("Failed to generate styled Excel report. Check console for details.");
    }
  };

  // Improved PDF Export with proper formatting and layout
  const exportToPDF = () => {
    try {
      // Create new PDF document (landscape for better table layout)
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });
      
      // Define dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const margins = 15; // 15mm margins on each side
      const tableWidth = pageWidth - (margins * 2);
      
      // Better column width distribution
      const colWidths = [
        tableWidth * 0.25, // Order ID
        tableWidth * 0.15, // Customer
        tableWidth * 0.25, // Email
        tableWidth * 0.10, // Total
        tableWidth * 0.10, // Status
        tableWidth * 0.15  // Date
      ];
      
      // Set starting positions
      const startX = margins;
      let startY = 20;
      
      // Professional color theme - Rich deep blues and gold accents
      const colors = {
        primary: [16, 52, 166],       // Deep royal blue
        secondary: [12, 36, 97],      // Darker blue
        accent: [218, 165, 32],       // Gold
        light: [235, 240, 255],       // Light blue tint
        alternate: [245, 245, 255],   // Almost white with blue tint
        white: [255, 255, 255],
        black: [0, 0, 0]
      };
      
      // Add company header with styling
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 20, "F");
      
      // Add gold accent line
      doc.setFillColor(...colors.accent);
      doc.rect(0, 20, pageWidth, 2, "F");
      
      // Company name
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.white);
      doc.text("JAY AGENCIES", pageWidth / 2, 12, { align: "center" });
      
      // Add company details section
      doc.setFillColor(...colors.light);
      doc.rect(0, 22, pageWidth, 15, "F");
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.black);
      doc.text("2/1, Meenatchi Nagar, Hasthampatti, Salem 636007", pageWidth / 2, 28, { align: "center" });
      doc.text("GSTIN/UIN: 33AGAPR3442B1ZZ", pageWidth / 2, 33, { align: "center" });
      
      // Add report title with better styling
      doc.setFillColor(...colors.secondary);
      doc.rect(0, 37, pageWidth, 10, "F");
      
      doc.setFontSize(14);
      doc.setTextColor(...colors.white);
      doc.text("SALES REPORT", pageWidth / 2, 44, { align: "center" });
      
      startY = 55;
      
      // Add filters info if any are active
      let filterText = "All Orders";
      if (status !== "All") filterText = `Status: ${status}`;
      if (startDate && endDate) filterText += ` | Period: ${formatDate(startDate)} - ${formatDate(endDate)}`;
      else if (startDate) filterText += ` | From: ${formatDate(startDate)}`;
      else if (endDate) filterText += ` | Until: ${formatDate(endDate)}`;
      filterText += ` | Sort: ${sortOrder === "Newest" ? "Newest First" : "Oldest First"}`;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...colors.black);
      doc.text(filterText, pageWidth / 2, startY, { align: "center" });
      
      startY += 8;
      
      // Add summary box with gold accent
      doc.setFillColor(...colors.secondary);
      doc.roundedRect(startX, startY, tableWidth, 15, 3, 3, "F");
      
      // Gold accent line above summary box
      doc.setFillColor(...colors.accent);
      doc.rect(startX, startY - 1, tableWidth, 1, "F");
      
      // Summary text
      doc.setTextColor(...colors.white);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      const summaryY = startY + 10;
      
      doc.text(`Total Sales: Rs. ${report.totalSales || 0}`, startX + 10, summaryY);
      doc.text(`Total Orders: ${report.numberOfOrders || 0}`, startX + 80, summaryY);
      doc.text(`Avg. Order Value: Rs. ${report.averageOrderValue ? report.averageOrderValue.toFixed(2) : "0.00"}`, startX + 150, summaryY);
      doc.text(`Generated: ${formatDate(new Date())}`, startX + 220, summaryY);
      
      startY += 25;
      
      // Function to split text into lines based on available width
      const splitTextToLines = (text, maxWidth) => {
        const fontSize = doc.internal.getFontSize();
        const charWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
        
        if (charWidth <= maxWidth) {
          return [text];
        }
        
        // Calculate approximately how many characters we can fit
        const approxCharsPerLine = Math.floor(text.length * (maxWidth / charWidth));
        
        // Split text into words
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = doc.getStringUnitWidth(testLine) * fontSize / doc.internal.scaleFactor;
          
          if (testWidth <= maxWidth) {
            currentLine = testLine;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        });
        
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // If we still have no lines (perhaps it's a single very long word), force split
        if (lines.length === 0) {
          let i = 0;
          while (i < text.length) {
            const end = Math.min(i + approxCharsPerLine, text.length);
            lines.push(text.substring(i, end));
            i = end;
          }
        }
        
        return lines;
      };
      
      // Table header with gold accent and styling
      const headerY = startY;
      
      // Gold accent line above header
      doc.setFillColor(...colors.accent);
      doc.rect(startX, headerY - 7, tableWidth, 1, "F");
      
      // Header background
      doc.setFillColor(...colors.primary);
      doc.rect(startX, headerY - 6, tableWidth, 10, "F");
      
      // Header text
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...colors.white);
      doc.setFontSize(11);
      
      let currentX = startX + 4;
      ["Order ID", "Customer", "Email", "Amount (Rs.)", "Status", "Order Date"].forEach((header, i) => {
        doc.text(header, currentX, headerY);
        currentX += colWidths[i];
      });
      
      // Table rows with better styling
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...colors.black);
      doc.setFontSize(10);
      
      let rowY = headerY + 10;
      const baseRowHeight = 10;
      
      const addTableHeader = (yPos) => {
        // Gold accent line above header
        doc.setFillColor(...colors.accent);
        doc.rect(startX, yPos - 7, tableWidth, 1, "F");
        
        // Header background
        doc.setFillColor(...colors.primary);
        doc.rect(startX, yPos - 6, tableWidth, 10, "F");
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...colors.white);
        doc.setFontSize(11);
        
        let xPos = startX + 4;
        ["Order ID", "Customer", "Email", "Amount (Rs.)", "Status", "Order Date"].forEach((header, i) => {
          doc.text(header, xPos, yPos);
          xPos += colWidths[i];
        });
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.black);
        doc.setFontSize(10);
      };
      
      sortedOrders.forEach((order, index) => {
        // Prepare all text content and calculate row height
        const orderId = order._id || "N/A";
        const customerName = order.user?.name || "N/A";
        const email = order.user?.email || "N/A";
        const amount = `Rs. ${order.total || 0}`;
        const status = order.status || "N/A";
        const date = formatDate(order.createdAt);
        
        // Split text into lines if needed and calculate max lines
        const orderIdLines = splitTextToLines(orderId, colWidths[0] - 8);
        const customerLines = splitTextToLines(customerName, colWidths[1] - 8);
        const emailLines = splitTextToLines(email, colWidths[2] - 8);
        
        // Determine how many lines this row needs
        const maxLines = Math.max(
          orderIdLines.length,
          customerLines.length,
          emailLines.length,
          1 // Minimum 1 line
        );
        
        // Calculate row height based on content
        const rowHeight = Math.max(baseRowHeight, maxLines * 5 + 5); // 5mm per line plus padding
        
        // Check if we need a new page
        if (rowY + rowHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          
          // Add header to new page with company name
          doc.setFillColor(...colors.primary);
          doc.rect(0, 0, pageWidth, 15, "F");
          
          // Gold accent line
          doc.setFillColor(...colors.accent);
          doc.rect(0, 15, pageWidth, 1, "F");
          
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...colors.white);
          doc.setFontSize(14);
          doc.text("JAY AGENCIES - SALES REPORT (CONTINUED)", pageWidth / 2, 10, { align: "center" });
          
          // Reset position for new page
          rowY = 25;
          
          // Add table header to the new page
          addTableHeader(rowY);
          rowY += 10;
        }
        
        // Draw row background with alternating colors
        if (index % 2 === 0) {
          doc.setFillColor(...colors.light);
        } else {
          doc.setFillColor(...colors.alternate);
        }
        doc.rect(startX, rowY - 6, tableWidth, rowHeight, "F");
        
        // Draw cell content - handle multiline text
        currentX = startX + 4;
        
        // Order ID (full, with wrapping)
        let lineY = rowY;
        orderIdLines.forEach((line, i) => {
          doc.text(line, currentX, lineY);
          lineY += 5;
        });
        currentX += colWidths[0];
        
        // Customer (full, with wrapping)
        lineY = rowY;
        customerLines.forEach((line, i) => {
          doc.text(line, currentX, lineY);
          lineY += 5;
        });
        currentX += colWidths[1];
        
        // Email (full, with wrapping)
        lineY = rowY;
        emailLines.forEach((line, i) => {
          doc.text(line, currentX, lineY);
          lineY += 5;
        });
        currentX += colWidths[2];
        
        // Simple fields (typically don't need wrapping)
        doc.text(amount, currentX, rowY);
        currentX += colWidths[3];
        
        doc.text(status, currentX, rowY);
        currentX += colWidths[4];
        
        doc.text(date, currentX, rowY);
        
        // Move to next row position (accounting for variable row height)
        rowY += rowHeight;
      });
      
      // Add page footer with page numbers and company info
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        
        // Gold accent line above footer
        doc.setFillColor(...colors.accent);
        doc.rect(0, doc.internal.pageSize.getHeight() - 11, pageWidth, 1, "F");
        
        // Footer background
        doc.setFillColor(...colors.primary);
        doc.rect(0, doc.internal.pageSize.getHeight() - 10, pageWidth, 10, "F");
        
        // Page number and company info
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...colors.white);
        doc.text(`Page ${i} of ${totalPages} | Generated by: JAY AGENCIES ERP System`, pageWidth / 2, doc.internal.pageSize.getHeight() - 4, { align: "center" });
      }
      
      // Save PDF
      const filename = `JayAgencies_SalesReport_${getFormattedDateTime()}.pdf`;
      doc.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Check console for details.");
    }
  };
  if (!report) return <p>Loading sales report...</p>;

  return (
    <div className="sales-report-page">
      
      <h2>Sales Report</h2>

      <div className="filters">
        <div className="filter">
          <label>Status:</label>
          <select onChange={(e) => setStatus(e.target.value)} value={status}>
            <option value="All">All</option>
            <option value="Placed">Placed</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        <div className="filter">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        {/* New sort order filter */}
        <div className="filter">
          <label>Sort By:</label>
          <select 
            onChange={(e) => setSortOrder(e.target.value)} 
            value={sortOrder}
          >
            <option value="Newest">Newest First</option>
            <option value="Oldest">Oldest First</option>
          </select>
        </div>

        <button onClick={handleResetFilters} className="filter-btn reset">
          Reset Filters
        </button>
      </div>


      <div className="summary-cards">
        <div className="card">Total Sales: ₹{report.totalSales}</div>
        <div className="card">Orders: {report.numberOfOrders}</div>
        <div className="card">
          Avg. Order Value: ₹
          {report.averageOrderValue != null
            ? report.averageOrderValue.toFixed(2)
            : "0.00"}
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={exportToExcel} className="export-btn excel-btn">
          Export to Excel
        </button>
        <button onClick={exportToPDF} className="export-btn pdf-btn">
          Export to PDF
        </button>
      </div>

      <table className="sales-report-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Email</th>
            <th>Total</th>
            <th>Status</th>
            <th>Ordered On</th>
          </tr>
        </thead>
        <tbody>
        {sortedOrders.map((order) => (
            <tr key={order._id}>
              <td>{order._id}</td>
              <td>{order.user?.name || 'N/A'}</td>
              <td>{order.user?.email || 'N/A'}</td>
              <td>₹{order.total || 0}</td>
              <td>{order.status}</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SalesReport;