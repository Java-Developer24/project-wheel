import { useState, useEffect } from 'react';
import { Wheel } from 'react-custom-roulette';
import { motion, AnimatePresence } from 'framer-motion';
import Dialog from '@mui/material/Dialog';
import guidesData from './data/guides.json';
import './App.css';

function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [guideId, setGuideId] = useState('');
  const [currentPrizes, setCurrentPrizes] = useState([]);
  const [bucketPrizes, setBucketPrizes] = useState([]);
  const [showWheel, setShowWheel] = useState(false);
  const [showWinDialog, setShowWinDialog] = useState(false);
  const [winningPrize, setWinningPrize] = useState('');
  const [currentGuide, setCurrentGuide] = useState(null);

  const wheelColors = ['#118B50', '#EB5B00', '#EB5A3C', '#A6CDC6', '#FFEB00', '#16C47F', '#C30E59'];
  const wheelData = currentPrizes.map((prize, index) => ({
    option: prize,
    style: {
      backgroundColor: wheelColors[index % wheelColors.length],
      textColor: '#000000',
      fontWeight: 'bold',
      textOrientation: 'vertical',
      textPosition: 'outer'
    }
  }));

  const sendPrizeEmail = async (guide, prize) => {
    const emailTemplate = `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center;">🎉 Congratulations on Your Prize! 🎉</h2>
            
            <p>Dear ${guide.name},</p>
            
            <p>We're excited to inform you that you've won a fantastic prize in our GoDaddy Wheel of Fortune game!</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #e74c3c; text-align: center;">Your Prize: ${prize}</h3>
            </div>
            
            <p>Prize Details:</p>
            <ul>
              <li>Prize Category: ${guide.bucket.toUpperCase()}</li>
              <li>Guide ID: ${guide.id}</li>
              <li>Date Won: ${new Date().toLocaleDateString()}</li>
            </ul>
            
            <p>To claim your prize, please contact the HR department with your Guide ID.</p>
            
            <p>Best regards,<br>GoDaddy Team</p>
          </div>
        </body>
      </html>
    `;

    try {
      const response = await fetch('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: guide.email,
          cc: guide.cc,
          subject: '🎉 Congratulations on Your Prize!',
          html: emailTemplate
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('Email sent successfully');
        console.log('Email preview URL:', data.previewUrl);
      } else {
        console.error('Failed to send email:', data.message);
      }
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  const handleSpinClick = () => {
    if (!mustSpin) {
      setShowDialog(true);
    }
  };

  const PlaceholderWheel = () => {
    return (
      <div className="placeholder-wheel">
        <div className="placeholder-segments">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="segment"
              style={{ transform: `rotate(${i * 60}deg)` }}
            />
          ))}
        </div>
        <div className="wheel-center-text">Wheel OF Fortune</div>
      </div>
    );
  };
  
  const handleClaimPrize = () => {
    if (currentGuide && winningPrize) {
      sendPrizeEmail(currentGuide, winningPrize);
      console.log(`Prize claimed by ${currentGuide.name} (${currentGuide.id}): ${winningPrize}`);
    }
    
    setShowWinDialog(false);
    setMustSpin(false);
    setPrizeNumber(0);
    setBucketPrizes([]);
    setCurrentPrizes([]);
    setWinningPrize('');
    setGuideId('');
    setShowWheel(false);
    setCurrentGuide(null);
  };
  
  const handleGuideIdSubmit = () => {
    const guide = guidesData.guides.find(g => g.id === guideId);
    
    if (guide) {
      console.log(`Guide ${guide.name} (${guide.id}) started spinning the wheel`);
      setCurrentGuide(guide);
      const bucket = guide.bucket;
      const allPrizes = guidesData.allPrizes;
      const userBucketPrizes = guidesData.prizes[bucket];
      
      // Select a random prize from the user's bucket
      const winningPrizeIndex = Math.floor(Math.random() * userBucketPrizes.length);
      const selectedPrize = userBucketPrizes[winningPrizeIndex];
      
      // Set up the wheel data first
      setCurrentPrizes(allPrizes);
      setBucketPrizes(userBucketPrizes);
      setShowDialog(false);
      setShowWheel(true);
      
      // Use setTimeout to ensure wheel data is ready
      setTimeout(() => {
        const prizeIndexInWheel = allPrizes.findIndex(prize => prize === selectedPrize);
        console.log(`Selected prize: ${selectedPrize} at position ${prizeIndexInWheel}`);
        
        setPrizeNumber(prizeIndexInWheel);
        setWinningPrize(selectedPrize);
        setMustSpin(true);
      }, 100);
      
      console.log(`Selected prize bucket: ${bucket}`);
    } else {
      console.error(`Invalid Guide ID: ${guideId}`);
      alert('Invalid Guide ID');
    }
  };

  const handleSpinStop = () => {
    setMustSpin(false);
    createConfetti();
    console.log(`Wheel stopped - Prize won: ${winningPrize}`);
    setTimeout(() => {
      setShowWinDialog(true);
    }, 1000);
  };

  const createConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.className = 'confetti-container';
    document.body.appendChild(confettiContainer);

    // Premium color palette
    const colors = [
      '#FFD700', // Gold
      '#E82561', // Brand Pink
      '#4A90E2', // Royal Blue
      '#50E3C2', // Turquoise
      '#F5A623', // Amber
      '#D0021B', // Ruby
      '#7ED321', // Emerald
    ];
    
    const shapes = ['star', 'circle', 'triangle', 'diamond'];
    const totalConfetti = 150;

    for (let i = 0; i < totalConfetti; i++) {
      const confetti = document.createElement('div');
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      
      confetti.className = `confetti ${shape}`;
      
      // Calculate random angle and distance for burst effect
      const angle = (Math.random() * 360) * (Math.PI / 180); // Convert to radians
      const velocity = 100 + Math.random() * 200; // Random velocity
      
      // Calculate final position based on angle
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      // Set custom properties for the animation
      confetti.style.setProperty('--tx', `${tx}px`);
      confetti.style.setProperty('--ty', `${ty}px`);
      
      // Randomize animation properties
      const animationDuration = 1 + Math.random() * 2;
      const animationDelay = Math.random() * 0.5;
      
      confetti.style.animation = `confetti-burst ${animationDuration}s ease-out forwards`;
      confetti.style.animationDelay = `${animationDelay}s`;
      
      // Random size
      const size = 8 + Math.random() * 12;
      confetti.style.width = `${size}px`;
      confetti.style.height = `${size}px`;
      
      // Random color
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      
      confettiContainer.appendChild(confetti);
    }

    // Remove the confetti container after animations complete
    setTimeout(() => {
      confettiContainer.remove();
    }, 4000);
  };
  
  
  return (
    <div className="app-container">
      <div className="wheel-section">
        <div className="logo-container">
          <div className="logo-left-logo">
            <img src="https://download.logo.wine/logo/GoDaddy/GoDaddy-Logo.wine.png" alt="Left Logo" />
          </div>
          <h1 className="lucky-spin-text">Contest Dashboard</h1>
          <div className="logo-right-logo">
            <img src="../public/gen.png" alt="Right Logo" />
          </div>
        </div>
        
        <div className="wheel-container">
          <div className="wheel-outer">
            <div className="wheel-ring-outer"></div>
            <div className="wheel-ring-middle"></div>
            <div className="wheel-ring-inner"></div>
            {!showWheel ? (
              <PlaceholderWheel />
            ) : currentPrizes.length > 0 ? (
              <div className="wheel-content">
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleSpinStop}
                  outerBorderColor="#FFFFFF"
                  outerBorderWidth={3}
                  innerRadius={20}
                  radiusLineColor="black"
                  radiusLineWidth={1}
                  textDistance={85}
                  fontSize={15}
                  spinDuration={0.8}
                  perpendicularText={true}
                />
                <div className="wheel-center"></div>
              </div>
            ) : (
              <motion.div 
                className="mega-win"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                Wheel <br/> OF <br/> Fortune
              </motion.div>
            )}
          </div>
        </div>

        <button className="spin-button" onClick={handleSpinClick}>
          SPIN
        </button>
      </div>

      <Dialog 
        open={showDialog}
        onClose={() => setShowDialog(false)}
        PaperProps={{
          className: 'custom-dialog'
        }}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="dialog-title">Enter Your Guide ID</div>
          <input
            type="text"
            className="custom-input"
            value={guideId}
            onChange={(e) => setGuideId(e.target.value)}
            placeholder="Enter ID"
          />
          <motion.button 
            className="dialog-button"
            onClick={handleGuideIdSubmit}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Go
          </motion.button>
        </motion.div>
      </Dialog>

      <AnimatePresence>
        <Dialog 
          open={showWinDialog}
          onClose={() => setShowWinDialog(false)}
          PaperProps={{
            className: 'custom-dialog'
          }}
        >
          <div className="dialog-title">Congratulations! 🎉</div>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', marginBottom: '1rem' }}>You've Won:</h2>
            <h1 style={{ color: '#FFD700', fontSize: '2rem', marginBottom: '2rem' }}>
              {winningPrize}
            </h1>
            <button 
              className="dialog-button"
              onClick={handleClaimPrize}
            >
              Claim Prize
            </button>
          </div>
        </Dialog>
      </AnimatePresence>
    </div>
  );
}

export default App;