import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
const port = 3000;

app.use(cors());
app.use(
  cors({
    origin: ["https://project-wheel.vercel.app"], // Allow this specific origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies and authentication headers
  })
);
app.use(express.json());

// Create a test account using Ethereal Email
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any email service provider
  
  auth: {
    user: 'polagounibalakrishna@gmail.com',
    pass: 'qydc uyyx rrdq kzdr'
  }
});

app.post('/api/send-email', async (req, res) => {
  const { to, cc, subject, html } = req.body;

  try {
    const info = await transporter.sendMail({
      from: 'polagounibalakrishna@gmail.com',
      to,
      cc,
      subject,
      html
    });

    console.log('Email sent successfully');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    res.json({ 
      success: true, 
      message: 'Email sent successfully',
      previewUrl: nodemailer.getTestMessageUrl(info)
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email',
      error: error.message 
    });
  }
});

app.listen(port, () => {
  console.log(`Email server running on port ${port}`);
});