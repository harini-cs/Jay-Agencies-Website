import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../middleware/authMiddleware.js'; 
import nodemailer from 'nodemailer';

const router = express.Router();

// POST - Save message
router.post('/', async (req, res) => {
  try {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.status(201).json({ message: 'Message saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Fetch all messages (admin only)
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put("/reply/:id", async (req, res) => {
    try {
        const { reply } = req.body;

        // Update the message with the reply and change the status to 'replied'
        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { reply, repliedAt: new Date(), status: 'replied' },  // Add 'status' field
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        // Format date for email
        const formattedDate = new Date(message.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        // Create HTML email with better formatting
        const htmlEmail = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333333;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header {
                    background-color: #3468c0;
                    padding: 20px;
                    text-align: center;
                    color: white;
                }
                .content {
                    padding: 20px;
                    background-color: #f9f9f9;
                    border: 1px solid #dddddd;
                }
                .message-info {
                    background-color: #f0f6ff;
                    padding: 15px;
                    margin-bottom: 20px;
                    border-left: 4px solid #3468c0;
                }
                .reply {
                    background-color: white;
                    padding: 15px;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                }
                .footer {
                    font-size: 12px;
                    text-align: center;
                    margin-top: 20px;
                    color: #666666;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Jay Agencies</h2>
            </div>
            
            <div class="content">
                <p>Dear ${message.name},</p>
                
                <p>Thank you for reaching out to Jay Agencies. We have received your message and are pleased to provide you with a response.</p>
                
                <div class="message-info">
                    <strong>Your original message (${formattedDate}):</strong><br>
                    <strong>Subject:</strong> ${message.subject}<br>
                    <p>${message.message}</p>
                </div>
                
                <p><strong>Our response:</strong></p>
                <div class="reply">
                    ${reply.replace(/\n/g, '<br>')}
                </div>
                
                <p>If you have any further questions or need additional assistance, please don't hesitate to contact us again.</p>
                
                <p>Best regards,<br>
                Jay Agencies Support Team</p>
            </div>
            
            <div class="footer">
                <p>This email was sent in response to your inquiry at Jay Agencies.</p>
                <p>© ${new Date().getFullYear()} Jay Agencies. All rights reserved.</p>
            </div>
        </body>
        </html>
        `;

        // Create plain text version for email clients that don't support HTML
        const textEmail = `
    Dear ${message.name},

    Thank you for reaching out to Jay Agencies. We have received your message and are pleased to provide you with a response.

    YOUR ORIGINAL MESSAGE (${formattedDate}):
    Subject: ${message.subject}
    ${message.message}

    OUR RESPONSE:
    ${reply}

    If you have any further questions or need additional assistance, please don't hesitate to contact us again.

    Best regards,
    Jay Agencies Support Team

    © ${new Date().getFullYear()} Jay Agencies. All rights reserved.
        `;

        // Send reply email with both HTML and plain text versions
        await transporter.sendMail({
            from: '"Jay Agencies Support" <support@jayagencies.com>',
            to: message.email,
            subject: `Re: ${message.subject} - Jay Agencies Response`,
            text: textEmail,
            html: htmlEmail
        });

        res.json({ message: "Reply sent and email delivered", data: message });
    } catch (err) {
        console.error("Reply error:", err);
        res.status(500).json({ error: "Failed to reply and send email" });
    }
});


router.delete("/:id", async (req, res) => {
  try {
    const deletedMsg = await Message.findByIdAndDelete(req.params.id);
    if (!deletedMsg) {
      return res.status(404).json({ error: "Message not found" });
    }
    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
});



export default router;