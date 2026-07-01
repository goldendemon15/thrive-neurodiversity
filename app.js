// Thrive App Simulator - Interactive JavaScript
// Handles all app interactions, animations, and state management

// ============================================
// State Management
// ============================================

let currentMode = 'student'; // 'student' or 'educator'
let currentTab = 'home';
let tasksCompleted = 0;
const maxTasks = 2;

// Sample text for decoder demo
const sampleText = `You are expected to submit a comprehensive research proposal by 5 PM on Friday that includes: (1) a literature review covering at least 15 peer-reviewed sources from the last 5 years, synthesizing key themes and debates; (2) a clearly articulated research question and three testable hypotheses; (3) a detailed methodology section describing your data collection and analysis approach; (4) a preliminary timeline for your research project over the next 8 weeks; and (5) an appendix with your data collection instruments. Please format using APA 7th edition and ensure all citations are correct. Late submissions will lose 10% per day.`;

// ============================================
// Tab Navigation
// ============================================

function switchTab(tab) {
  // Hide all screens
  document.querySelectorAll('.scr').forEach(scr => scr.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('on'));
  
  // Show selected screen
  const screen = document.getElementById(`scr-${tab}`);
  const tabBtn = document.getElementById(`tab-${tab}`);
  
  if (screen && tabBtn) {
    screen.classList.remove('hidden');
    tabBtn.classList.add('on');
    
    // Update ARIA attributes
    tabBtn.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.tab').forEach(t => {
      if (t !== tabBtn) t.setAttribute('aria-selected', 'false');
    });
    
    currentTab = tab;
    announceToScreenReader(`Switched to ${tab} tab`);
  }
}

// ============================================
// Overlay/Modal Management
// ============================================

function showOv(ovId) {
  // Hide all overlays
  document.querySelectorAll('.ov').forEach(ov => ov.classList.add('hidden'));
  
  // Show selected overlay
  const overlay = document.getElementById(ovId);
  if (overlay) {
    overlay.classList.remove('hidden');
    
    // Focus management for accessibility
    const closeBtn = overlay.querySelector('button');
    if (closeBtn) closeBtn.focus();
    
    announceToScreenReader(`Opened ${ovId}`);
  }
}

function hideAllOv() {
  document.querySelectorAll('.ov').forEach(ov => ov.classList.add('hidden'));
  announceToScreenReader('Dialog closed');
}

// Close overlay when clicking outside (on the backdrop)
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('ov')) {
    hideAllOv();
  }
});

// Close overlay with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const openOv = document.querySelector('.ov:not(.hidden)');
    if (openOv) hideAllOv();
  }
});

// ============================================
// AI Decoder Simulation
// ============================================

function runSimulatedDecode() {
  const input = document.getElementById('decoder-input');
  const text = input.value.trim();
  
  if (!text) {
    announceToScreenReader('Please paste text to decode');
    input.focus();
    return;
  }
  
  // Show loading state
  const btn = event.target;
  const originalText = btn.textContent;
  btn.textContent = 'Decoding...';
  btn.disabled = true;
  
  // Simulate AI processing (1.5 seconds)
  setTimeout(() => {
    const decoded = simulateAIDecode(text);
    showDecodedResult(decoded);
    
    // Reset button
    btn.textContent = originalText;
    btn.disabled = false;
    
    announceToScreenReader('Text decoded successfully');
  }, 1500);
}

function simulateAIDecode(text) {
  // Simple breakdown algorithm (in production, this would call an actual AI API)
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  const steps = sentences.map((sentence, index) => ({
    number: index + 1,
    text: sentence.trim()
  })).slice(0, 5); // Limit to 5 steps for clarity
  
  return {
    original: text,
    steps: steps,
    keyDeadlines: extractDeadlines(text),
    actionItems: extractActions(text)
  };
}

function extractDeadlines(text) {
  const deadlinePatterns = [/by\s+(\d+\s+(?:am|pm|[A-Za-z]+)?)/gi, /deadline[:\s]+([^\n.]+)/gi];
  const matches = [];
  deadlinePatterns.forEach(pattern => {
    const found = text.match(pattern);
    if (found) matches.push(...found);
  });
  return [...new Set(matches)].slice(0, 3);
}

function extractActions(text) {
  const actionWords = ['submit', 'include', 'write', 'prepare', 'complete', 'create', 'develop'];
  const actions = [];
  actionWords.forEach(word => {
    const regex = new RegExp(`${word}[^.]*`, 'gi');
    const found = text.match(regex);
    if (found) actions.push(...found);
  });
  return [...new Set(actions)].slice(0, 5);
}

function showDecodedResult(decoded) {
  // Replace input with decoded results view
  const container = document.querySelector('.ovc');
  
  let html = `
    <h3 style="font-size:15px;margin-bottom:12px;color:#1C1B2E;display:flex;align-items:center;gap:8px">
      <i class="ti ti-check" style="color:#10B981;font-size:18px"></i>
      Decoded Breakdown
    </h3>
    
    <p style="font-size:11px;font-weight:700;color:#A8A4C8;margin-bottom:8px;text-transform:uppercase">Key Steps</p>
  `;
  
  decoded.steps.forEach(step => {
    html += `
      <div style="background:#F8F6FF;border-left:3px solid #6B5FF7;padding:10px;border-radius:8px;margin-bottom:8px">
        <div style="font-size:12px;font-weight:700;color:#6B5FF7">Step ${step.number}</div>
        <div style="font-size:12px;color:#6B7280;margin-top:3px">${step.text}</div>
      </div>
    `;
  });
  
  if (decoded.keyDeadlines.length > 0) {
    html += `<p style="font-size:11px;font-weight:700;color:#A8A4C8;margin-top:14px;margin-bottom:8px;text-transform:uppercase">Key Deadlines</p>`;
    decoded.keyDeadlines.forEach(deadline => {
      html += `<div style="display:flex;align-items:center;gap:8px;padding:6px 0"><i class="ti ti-clock" style="color:#EF4444;font-size:14px"></i><span style="font-size:12px;color:#6B7280">${deadline}</span></div>`;
    });
  }
  
  html += `
    <button class="btn-p" style="margin-top:12px" onclick="resetDecoder()">Back to Decoder</button>
    <button class="btn-s" style="width:100%;margin-top:8px" onclick="hideAllOv()">Close</button>
  `;
  
  container.innerHTML = html;
}

function resetDecoder() {
  const container = document.querySelector('.ovc');
  container.innerHTML = `
    <h3 style="font-size:15px;margin-bottom:6px;color:#1C1B2E;display:flex;align-items:center;gap:8px">
      <i class="ti ti-language" style="color:#6B5FF7;font-size:18px"></i>
      AI Executive Decoder
    </h3>
    <p style="font-size:12px;color:#6B7280;margin-bottom:12px">Breaks dense prose into manageable checkpoints instantly.</p>
    <label for="decoder-input" class="sr-only">Paste text to decode</label>
    <textarea id="decoder-input" style="width:100%;height:80px;border-radius:10px;border:1.5px solid #E4E0FF;padding:10px;font-family:inherit;font-size:12px;margin-bottom:12px;resize:none;transition:border-color 0.2s" placeholder="Paste an overwhelming project brief or email here..." aria-describedby="decoder-hint"></textarea>
    <p id="decoder-hint" class="sr-only">This tool will break down your text into clear, actionable steps.</p>
    <button class="btn-p" onclick="runSimulatedDecode()">Deconstruct Context</button>
    <button class="btn-s" style="width:100%;margin-top:8px" onclick="hideAllOv()">Close</button>
  `;
  announceToScreenReader('Decoder reset');
}

// ============================================
// Crisis Mode / Overwhelm Helper
// ============================================

function activateCrisisMode() {
  // Reduce visual complexity
  document.querySelector('.sw').style.opacity = '0.95';
  document.querySelector('.phone').style.boxShadow = 'none';
  document.querySelectorAll('.card').forEach(card => {
    card.style.borderColor = 'transparent';
    card.style.boxShadow = 'none';
  });
  
  // Simplify UI
  document.querySelectorAll('.tab i').forEach(icon => {
    icon.style.display = 'none';
  });
  
  announceToScreenReader('Crisis mode activated. Visual complexity reduced.');
  
  // Show success message after a short delay
  setTimeout(() => {
    showOv('ov-success');
    document.getElementById('success-message').textContent = 'Crisis mode activated. Workspace simplified.';
  }, 300);
  
  // Reset after 10 seconds (for demo)
  setTimeout(resetCrisisMode, 10000);
}

function resetCrisisMode() {
  document.querySelector('.sw').style.opacity = '1';
  document.querySelector('.phone').style.boxShadow = '';
  document.querySelectorAll('.card').forEach(card => {
    card.style.borderColor = '';
    card.style.boxShadow = '';
  });
  document.querySelectorAll('.tab i').forEach(icon => {
    icon.style.display = '';
  });
  announceToScreenReader('Crisis mode ended');
}

// ============================================
// Task Completion
// ============================================

function markStepComplete(element) {
  if (element.classList.contains('completed')) {
    element.classList.remove('completed');
    element.style.opacity = '1';
    tasksCompleted--;
  } else {
    element.classList.add('completed');
    element.style.opacity = '0.6';
    element.style.textDecoration = 'line-through';
    tasksCompleted++;
    
    announceToScreenReader('Task marked complete');
    
    // Show success modal
    if (tasksCompleted === maxTasks) {
      setTimeout(() => {
        showOv('ov-success');
        document.getElementById('success-message').textContent = `🎉 All tasks complete today! Great work!`;
      }, 300);
    } else {
      showSuccessNotification(`Task ${tasksCompleted}/${maxTasks} complete!`);
    }
  }
}

function showSuccessNotification(message) {
  // Create and show a temporary toast notification
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ============================================
// Settings Toggle
// ============================================

function toggleSetting(button) {
  button.classList.toggle('on');
  const settingName = button.parentElement.querySelector('span').textContent;
  announceToScreenReader(`${settingName} ${button.classList.contains('on') ? 'enabled' : 'disabled'}`);
}

// ============================================
// Context / Mode Toggle
// ============================================

function toggleContext() {
  const indicator = document.getElementById('ctx-indicator');
  const homeText = document.getElementById('home-subtext');
  
  if (currentMode === 'student') {
    currentMode = 'educator';
    indicator.textContent = 'Educator Mode';
    indicator.style.background = '#DDD7FF';
    homeText.textContent = 'Your students\' active tasks and accommodation needs.';
    announceToScreenReader('Switched to educator mode');
  } else {
    currentMode = 'student';
    indicator.textContent = 'Student Mode';
    indicator.style.background = '#EDE9FF';
    homeText.textContent = 'Here are your active academic tasks and accommodations.';
    announceToScreenReader('Switched to student mode');
  }
}

// ============================================
// Keyboard Navigation & Accessibility
// ============================================

// Allow Escape to close modals and Enter on buttons
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideAllOv();
  
  // Allow Enter/Space on role="button" elements
  if (e.key === 'Enter' && event.target.getAttribute('role') === 'button') {
    event.target.click();
  }
});

// Context indicator keyboard access
document.getElementById('ctx-indicator').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    toggleContext();
    e.preventDefault();
  }
});

// ============================================
// Screen Reader Announcements
// ============================================

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => announcement.remove(), 1000);
}

// ============================================
// Smooth Scroll to Demo
// ============================================

function scrollToDemo() {
  const previewSide = document.querySelector('.preview-side');
  previewSide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  announceToScreenReader('Scrolled to simulator');
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Set initial tab
  switchTab('home');
  
  // Add CSS animations if not already in stylesheet
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(400px); opacity: 0; }
    }
    .completed {
      opacity: 0.6 !important;
      text-decoration: line-through !important;
    }
  `;
  document.head.appendChild(style);
  
  announceToScreenReader('Thrive app loaded. Use the simulator on the left to explore.');
});

// ============================================
// Debug Mode (optional)
// ============================================

// Uncomment to enable debug mode via console
window.thriveDebug = {
  reset: () => location.reload(),
  setMode: (mode) => { currentMode = mode; },
  getState: () => ({ currentMode, currentTab, tasksCompleted })
};