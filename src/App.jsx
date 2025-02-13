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
      <div className="wheel-container">
        {/* Main Wheel */}
        
        <div className="placeholder-wheel-outer">
          
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
        </div>
        </div>
  
        
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
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaqVGwXfboLlsa3uQAI8Yim-rx9MrsRYED-w&s" alt="Left Logo" />
          </div>
          <h1 className="lucky-spin-text">Wheel OF Fortune</h1>
          <div className="logo-right-logo">
            <img src="data:image/png;base64,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" alt="Right Logo" />
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