
import nodemailer from "nodemailer";
import moment from "moment";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const placeOrder = async (req, res) => {
  try {
    const { products, address } = req.body;

    const user = await User.findById(req.user._id);  // <-- move this up
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let total = 0;
    const enrichedProducts = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock.` });
      }

      product.stock -= item.quantity;
      product.sold += item.quantity;
      await product.save(); // Save product with updated stock and sold count

      total += product.price * item.quantity;
      enrichedProducts.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    const order = new Order({
      user: req.user._id,
      products: enrichedProducts,
      address,
      phone: user.phone || "",
      total,
      status: "Placed",
    });

    const savedOrder = await order.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const deliveryDate = moment().add(10, "days").format("MMMM Do YYYY");

    try {
      await transporter.sendMail({
        from: '"Jay Agencies" <orders@jayagencies.com>',
        to: user.email,
        subject: `Order Confirmed: #${savedOrder._id.toString().slice(-8)} - Jay Agencies`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Confirmation</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background-color: #232f3e;
                padding: 20px;
                text-align: center;
              }
              .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
              }
              .order-info {
                background-color: #f8f9fa;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .delivery-info {
                background-color: #eaf5ea;
                padding: 15px;
                margin: 20px 0;
                border-radius: 4px;
              }
              .products-table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              .products-table th {
                background-color: #f0f0f0;
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
              }
              .products-table td {
                padding: 10px;
                border-bottom: 1px solid #ddd;
              }
              .total-row {
                font-weight: bold;
                background-color: #f0f0f0;
              }
              .cta-button {
                display: inline-block;
                background-color: #ff9900;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 4px;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Jay Agencies</h1>
              </div>
              
              <p>Hello ${user.name},</p>
              
              <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
              
              <div class="order-info">
                <h2>Order Details</h2>
                <p><strong>Order Number:</strong> #${savedOrder._id.toString().slice(-8)}</p>
                <p><strong>Order Date:</strong> ${moment(savedOrder.createdAt).format('MMMM Do YYYY, h:mm a')}</p>
                <p><strong>Payment Method:</strong> Cash on Delivery</p>
              </div>
              
              <div class="delivery-info">
                <h2>Delivery Information</h2>
                <p><strong>Delivery Address:</strong><br>
                ${user.name}<br>
                ${address.street || address || user.address || 'Address not provided'}<br>
                ${user.phone ? `Phone: ${user.phone}` : 'Phone: Not provided'}</p>
                
                <p><strong>Expected Delivery Date:</strong> ${deliveryDate}</p>
              </div>
              
              <h2>Order Summary</h2>
              
              <table class="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${await Promise.all(enrichedProducts.map(async (item) => {
                    const product = await Product.findById(item.productId);
                    if (!product) return '';
                    return `
                      <tr>
                        <td>${product.name}</td>
                        <td>${item.quantity}</td>
                        <td>Rs.${product.price.toFixed(2)}</td>
                        <td>Rs.${(product.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    `;
                  })).then(rows => rows.join(''))}
                  
                  <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total:</td>
                    <td>Rs.${savedOrder.total.toFixed(2)}</td>
                  </tr>
                  
    
                </tbody>
              </table>
              
              <p style="margin: 20px 0; font-weight: bold; font-size: 16px; color: #232f3e;">
                Your order will be delivered by ${deliveryDate}. We'll notify you when it's out for delivery.
              </p>
              
              <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:support@jayagencies.com">support@jayagencies.com</a> or call us at +91-98765-43210.</p>
              
              <p>Thank you for shopping with us!</p>
              
              <p>Best regards,<br>
              The Jay Agencies Team</p>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Jay Agencies. All rights reserved.</p>
                <p>This email was sent to ${user.email}. Please do not reply to this email.</p>
                <p>
                  <a href="${process.env.FRONTEND_URL}/privacy-policy">Privacy Policy</a> | 
                  <a href="${process.env.FRONTEND_URL}/terms">Terms & Conditions</a> | 
                  <a href="${process.env.FRONTEND_URL}/contact">Contact Us</a>
                </p>
              </div>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email", emailError);
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to place order" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate("products.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your orders" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("products.productId");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all orders" });
  }
};


// Update the markOrderAsDelivered function to send a delivery notification email with PDF invoice
export const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = "Delivered";
    order.deliveredAt = new Date();
    const updatedOrder = await order.save();

    // Send delivery confirmation email with invoice
    try {
      await sendDeliveryConfirmationEmail(order._id);
    } catch (emailError) {
      console.error("Error sending delivery confirmation email", emailError);
      // Don't return error as order was still marked as delivered
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update order status" });
  }
};

// Function to send delivery confirmation email with PDF invoice
const sendDeliveryConfirmationEmail = async (orderId) => {
  try {
    // Fetch the order with populated data
    const order = await Order.findById(orderId)
      .populate("user")
      .populate("products.productId");

    if (!order || !order.user) {
      throw new Error("Order or user not found");
    }

    const user = order.user;
    
    // Generate PDF invoice
    const invoicePath = await generateInvoicePDF(order);
    
    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Format dates
    const orderDate = moment(order.createdAt).format('MMMM Do YYYY, h:mm a');
    const deliveryDate = moment(order.deliveredAt).format('MMMM Do YYYY, h:mm a');

    // Send email with PDF attachment
    await transporter.sendMail({
      from: '"Jay Agencies" <jayagencies_1@yahoo.com>',
      to: user.email,
      subject: `Order #${order._id.toString().slice(-8)} Delivered - Jay Agencies`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Delivery Confirmation</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #232f3e;
              padding: 20px;
              text-align: center;
            }
            .header h1 {
              color: #ffffff;
              margin: 0;
              font-size: 24px;
            }
            .order-info {
              background-color: #f8f9fa;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .delivery-info {
              background-color: #eaf5ea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #777;
              text-align: center;
            }
            .button {
              display: inline-block;
              background-color: #ff9900;
              color: #ffffff;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
              margin: 10px 0;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Jay Agencies</h1>
            </div>
            
            <p>Hello ${user.name},</p>
            
            <p><strong>Great news!</strong> Your order has been successfully delivered.</p>
            
            <div class="order-info">
              <h2>Order Details</h2>
              <p><strong>Order Number:</strong> #${order._id.toString().slice(-8)}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Delivery Date:</strong> ${deliveryDate}</p>
              <p><strong>Payment Method:</strong> Cash on Delivery</p>
            </div>
            
            <div class="delivery-info">
              <h2>Delivery Information</h2>
              <p><strong>Delivered To:</strong><br>
              ${user.name}<br>
              ${order.address || user.address || 'Address not provided'}<br>
              ${user.phone ? `Phone: ${user.phone}` : 'Phone: Not provided'}</p>
            </div>
            
            <p>We've attached a PDF copy of your invoice to this email for your records.</p>
            
            
            <p>If you have any questions about your order, please contact E. Ravi at <a href="mailto:jayagencies_1@yahoo.com">jayagencies_1@yahoo.com</a> or call us at +91 94432 62722.</p>
            
            <p>Thank you for shopping with us!</p>
            
            <p>Best regards,<br>
            The Jay Agencies Team</p>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Jay Agencies. All rights reserved.</p>
              <p>This email was sent to ${user.email}. Please do not reply to this email.</p>
              <p>
                <a href="${process.env.FRONTEND_URL}/">Home</a> | 
                <a href="${process.env.FRONTEND_URL}/products">Products</a> | 
                <a href="${process.env.FRONTEND_URL}/contact">Contact Us</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Invoice-${order._id.toString().slice(-8)}.pdf`,
          path: invoicePath,
          contentType: 'application/pdf'
        }
      ]
    });

    // Delete the temporary invoice file after sending
    fs.unlinkSync(invoicePath);

  } catch (error) {
    console.error("Error in sending delivery confirmation email:", error);
    throw error;
  }
};

// Function to generate PDF invoice
const generateInvoicePDF = async (order) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a directory for temporary PDF files if it doesn't exist
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const tempDir = path.join(__dirname, '../temp');
      
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      const invoicePath = path.join(tempDir, `invoice-${order._id}.pdf`);
      const doc = new PDFDocument({ margin: 50 });
      
      // Pipe the PDF to a file
      const writeStream = fs.createWriteStream(invoicePath);
      doc.pipe(writeStream);
      
      // Add company logo/header
      doc.fontSize(20).text('Jay Agencies', { align: 'center' });
      doc.fontSize(10).text('Your trusted destination for high-quality kitchenware & home essentials', { align: 'center' });
      doc.moveDown();
      
      // Add company address
      doc.fontSize(10).text('36 Natesan Colony, Shankar Nagar, Salem-636007', { align: 'center' });
      doc.text('Email: jayagencies_1@yahoo.com | Phone: +91 94432 62722', { align: 'center' });
      doc.text('Contact Person: E. Ravi', { align: 'center' });
      doc.text('GST: 33AGAPR3442B1ZZ', { align: 'center' });
      
      // Add a horizontal line
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Add invoice title and number
      doc.fontSize(16).text('TAX INVOICE', { align: 'center' });
      doc.moveDown();
      
      // Add invoice details in two columns
      const invoiceDetailsY = doc.y;
      
      // Left column
      doc.fontSize(10).text('Invoice Number:', 50, invoiceDetailsY);
      doc.text(`INV-${order._id.toString().slice(-8)}`, 150, invoiceDetailsY);
      
      doc.text('Order Number:', 50, invoiceDetailsY + 15);
      doc.text(`#${order._id.toString().slice(-8)}`, 150, invoiceDetailsY + 15);
      
      doc.text('Invoice Date:', 50, invoiceDetailsY + 30);
      doc.text(`${moment(order.deliveredAt || order.createdAt).format('DD/MM/YYYY')}`, 150, invoiceDetailsY + 30);
      
      doc.text('Order Date:', 50, invoiceDetailsY + 45);
      doc.text(`${moment(order.createdAt).format('DD/MM/YYYY')}`, 150, invoiceDetailsY + 45);
      
      // Right column
      doc.text('Customer Name:', 300, invoiceDetailsY);
      doc.text(`${order.user.name}`, 400, invoiceDetailsY);
      
      doc.text('Customer Email:', 300, invoiceDetailsY + 15);
      doc.text(`${order.user.email}`, 400, invoiceDetailsY + 15);
      
      doc.text('Phone Number:', 300, invoiceDetailsY + 30);
      doc.text(`${order.user.phone || 'Not provided'}`, 400, invoiceDetailsY + 30);
      
      doc.text('Payment Method:', 300, invoiceDetailsY + 45);
      doc.text('Cash on Delivery', 400, invoiceDetailsY + 45);
      
      // Add shipping address
      doc.moveDown(4);
      doc.fontSize(11).text('Shipping Address:', { underline: true });
      doc.fontSize(10).text(`${order.user.name}`);
      doc.text(`${order.address || order.user.address || 'Address not provided'}`);
      
      // Add a horizontal line
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();
      
      // Add product table header
      const tableTop = doc.y;
      const tableHeaders = ['No.', 'Product', 'Qty', 'Unit Price', 'Amount'];
      const columnWidths = [40, 230, 70, 100, 100];
      
      // Draw table header
      doc.font('Helvetica-Bold');
      tableHeaders.forEach((header, i) => {
        let x = 50;
        for (let j = 0; j < i; j++) {
          x += columnWidths[j];
        }
        doc.text(header, x, tableTop);
      });
      
      // Draw header line
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      
      // Reset to normal font
      doc.font('Helvetica');
      
      // Draw product rows
      let currentY = doc.y;
      let totalAmount = 0;
      
      order.products.forEach(async (item, index) => {
        const product = item.productId;
        if (!product) return;
        
        const price = product.price;
        const quantity = item.quantity;
        const amount = price * quantity;
        totalAmount += amount;
        
        let x = 50;
        doc.text(index + 1, x, currentY);
        
        x += columnWidths[0];
        doc.text(product.name, x, currentY);
        
        x += columnWidths[1];
        doc.text(quantity.toString(), x, currentY);
        
        x += columnWidths[2];
        doc.text(`Rs.${price.toFixed(2)}`, x, currentY);
        
        x += columnWidths[3];
        doc.text(`Rs.${amount.toFixed(2)}`, x, currentY);
        
        currentY += 20;
      });
      
      // Draw line after products
      doc.moveTo(50, currentY).lineTo(550, currentY).stroke();
      currentY += 15;
      
      // Calculate totals
      const subtotal = order.total;
      
      // Draw totals
      doc.font('Helvetica-Bold');
      doc.text('', 50, currentY);
      doc.text('Total:', 380, currentY);
      doc.text(`Rs.${subtotal.toFixed(2)}`, 490, currentY);
      currentY += 15;
      doc.font('Helvetica');

      
      // Add footer
      doc.moveDown(4);
      doc.fontSize(10).text('Thank you for your business!', { align: 'center' });
      doc.moveDown();
      doc.fontSize(9).text('This is a computer-generated invoice and does not require a signature.', { align: 'center' });
      
      // Add Terms and Conditions
      doc.moveDown(2);
      doc.fontSize(10).text('Terms & Conditions', { underline: true });
      doc.fontSize(8).text('1. All items are non-returnable once delivered unless damaged or defective.');
      doc.text('2. For any issues with your order, please contact customer support within 7 days of delivery.');
      doc.text('3. Warranty claims should be processed as per the manufacturer\'s warranty policy.');
      
      // Finalize PDF
      doc.end();
      
      // Wait for the PDF to be created
      writeStream.on('finish', () => {
        resolve(invoicePath);
      });
      
      writeStream.on('error', (error) => {
        reject(error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
};

export { sendDeliveryConfirmationEmail };

export const getSalesReport = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    const filter = {};
    if (status) filter.status = status;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter)
      .populate("user", "name email")
      .populate("products.productId")
      .sort({ createdAt: -1 });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const numberOfOrders = orders.length;
    const averageOrderValue = numberOfOrders > 0 ? totalSales / numberOfOrders : 0;

    res.json({
      totalSales,
      numberOfOrders,
      averageOrderValue,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate sales report" });
  }
};
