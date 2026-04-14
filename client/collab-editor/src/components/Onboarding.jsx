import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to CollabEditor! 🎉',
    description: 'Create, edit, and collaborate on documents in real time. Let\'s show you around.',
    visual: '📝',
    primaryAction: 'Get started',
    skipLabel: 'Skip tour',
  },
  {
    id: 'create',
    title: 'Create your first document',
    description: 'Click "+ New Document" to start. Choose a template or start from scratch. Your document auto-saves every 2 seconds.',
    visual: '📄',
    primaryAction: 'Create a document',
    skipLabel: 'Skip',
  },
  {
    id: 'collaborate',
    title: 'Invite collaborators',
    description: 'Open any document and click "Share" to invite others by email. They\'ll see your changes in real time as you type.',
    visual: '👥',
    primaryAction: 'Go to dashboard',
    skipLabel: 'Skip',
  },
];

function Onboarding({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;

  const handlePrimary = () => {
    if (currentStep === 1) {
      onComplete();
      navigate('/dashboard?new=1');
      return;
    }

    if (isLast) {
      onComplete();
      navigate('/dashboard');
      return;
    }

    setCurrentStep(prev => prev + 1);
  };

  const handleSkip = () => {
    onComplete();
    navigate('/dashboard');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease-out',
      }}>

        <div style={{
          fontSize: '64px',
          marginBottom: '24px',
          animation: 'bounce 0.6s ease-out',
        }}>
          {step.visual}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '24px',
        }}>
          {STEPS.map((_, index) => (
            <div
              key={index}
              style={{
                width: index === currentStep ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: index === currentStep ? '#4F46E5' : '#E5E7EB',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>

        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          color: '#111827',
          marginBottom: '12px',
          lineHeight: '1.3',
        }}>
          {step.title}
        </h2>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          lineHeight: '1.6',
          marginBottom: '36px',
        }}>
          {step.description}
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <button
            onClick={handlePrimary}
            style={{
              padding: '14px 28px',
              background: '#4F46E5',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'transform 0.1s, background 0.2s',
            }}
            onMouseEnter={e => e.target.style.background = '#4338CA'}
            onMouseLeave={e => e.target.style.background = '#4F46E5'}
            onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.target.style.transform = 'scale(1)'}
          >
            {step.primaryAction}
          </button>

          <button
            onClick={handleSkip}
            style={{
              padding: '12px',
              background: 'none',
              border: 'none',
              fontSize: '14px',
              color: '#9CA3AF',
              cursor: 'pointer',
            }}
            onMouseEnter={e => e.target.style.color = '#6B7280'}
            onMouseLeave={e => e.target.style.color = '#9CA3AF'}
          >
            {step.skipLabel}
          </button>
        </div>

        <p style={{
          marginTop: '16px',
          fontSize: '12px',
          color: '#D1D5DB',
        }}>
          {currentStep + 1} of {STEPS.length}
        </p>

        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
      </div>
    </div>
  );
}

export default Onboarding;
