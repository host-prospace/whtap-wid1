(function () {
  function createWhatsAppWidget({
    agents = [],
    popupDelay = 5000,
    soundUrl = "",
    onlineHours = { start: 9, end: 18 }
  }) {
    const currentHour = new Date().getHours();
    const isOnline = currentHour >= onlineHours.start && currentHour < onlineHours.end;

    const css = `
    #whatsapp-widget {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 1000;
      cursor: pointer;
    }
    #whatsapp-icon {
      width: 60px;
      height: 60px;
      transition: transform 0.3s ease;
    }
    #whatsapp-icon:hover {
      transform: scale(1.1);
    }
    #whatsapp-popup {
      position: fixed;
      bottom: 100px;
      right: 30px;
      width: 300px;
      background: var(--popup-bg);
      color: var(--popup-text);
      border-radius: 12px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      z-index: 1001;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      overflow: hidden;
      opacity: 0;
      transform: translateY(20px);
      pointer-events: none;
      transition: opacity 0.3s ease, transform 0.3s ease;
    }
    #whatsapp-popup.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    .popup-header {
      background: var(--header-bg);
      color: var(--header-text);
      padding: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .popup-header .profile {
      display: flex;
      align-items: center;
    }
    .popup-header img {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      margin-right: 10px;
    }
    .popup-header .info {
      display: flex;
      flex-direction: column;
      font-size: 14px;
    }
    .popup-header .info span {
      font-size: 12px;
    }
    #close-popup {
      font-size: 20px;
      cursor: pointer;
    }
    .popup-body {
      padding: 15px;
      background: var(--body-bg);
      min-height: 100px;
    }
    .message-bubble {
      background: var(--message-bg);
      padding: 10px 14px;
      border-radius: 8px 8px 0 8px;
      box-shadow: 0 2px 3px rgba(0,0,0,0.1);
      display: inline-block;
      max-width: 80%;
      color: var(--popup-text);
    }
    .popup-footer {
      padding: 10px;
      background: var(--footer-bg);
      display: flex;
      justify-content: center;
    }
    .popup-footer select, .popup-footer button {
      margin: 5px 0;
      width: 90%;
    }
    .popup-footer button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background-color: #25D366;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 30px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      transition: background-color 0.3s ease;
    }
    .popup-footer button:hover {
      background-color: #1ebe5d;
    }
    #small-popup {
      position: fixed;
      bottom: 100px;
      right: 100px;
      background: #25D366;
      color: white;
      padding: 10px 15px;
      border-radius: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      font-size: 14px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
      z-index: 1002;
    }
    #small-popup.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    @media (max-width: 600px) {
      #whatsapp-widget {
        bottom: 20px;
        right: 20px;
      }
      #whatsapp-popup {
        left: 10px;
        right: 10px;
        width: auto;
        bottom: 90px;
        max-width: 95%;
      }
      #small-popup {
        bottom: 90px;
        right: 50px;
      }
    }
    `;

    const darkModeCSSVars = `
    :root {
      --popup-bg: #1e1e1e;
      --popup-text: #fff;
      --header-bg: #075e54;
      --header-text: #fff;
      --body-bg: #2b2b2b;
      --message-bg: #333;
      --footer-bg: #222;
    }
    `;

    const lightModeCSSVars = `
    :root {
      --popup-bg: #fff;
      --popup-text: #000;
      --header-bg: #075e54;
      --header-text: #fff;
      --body-bg: #ece5dd;
      --message-bg: #fff;
      --footer-bg: #f0f0f0;
    }
    `;

    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const style = document.createElement('style');
    style.innerHTML = css + (systemPrefersDark ? darkModeCSSVars : lightModeCSSVars);
    document.head.appendChild(style);

    const html = `
      <div id="whatsapp-widget">
        <img src="https://img.icons8.com/color/48/000000/whatsapp--v1.png" alt="WhatsApp" id="whatsapp-icon">
      </div>
      <div id="whatsapp-popup">
        <div class="popup-header">
          <div class="profile">
            <img id="agent-pic" src="" alt="Profile">
            <div class="info">
              <strong id="agent-name"></strong>
              <span id="agent-status"></span>
            </div>
          </div>
          <span id="close-popup">&times;</span>
        </div>
        <div class="popup-body">
          <div class="message-bubble" id="agent-welcome"></div>
        </div>
        <div class="popup-footer">
          <select id="agent-select"></select>
          <button id="start-chat">
            <img src="https://img.icons8.com/ios-filled/20/ffffff/whatsapp.png" alt="WA" />
            Start Chat
          </button>
        </div>
      </div>
      <div id="small-popup">Hello! 👋 How can I assist you?</div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);

    const widget = document.getElementById('whatsapp-widget');
    const popup = document.getElementById('whatsapp-popup');
    const closeBtn = document.getElementById('close-popup');
    const startChat = document.getElementById('start-chat');
    const agentSelect = document.getElementById('agent-select');
    const agentPic = document.getElementById('agent-pic');
    const agentName = document.getElementById('agent-name');
    const agentStatus = document.getElementById('agent-status');
    const agentWelcome = document.getElementById('agent-welcome');
    const smallPopup = document.getElementById('small-popup');

    function updateAgent(index) {
      const agent = agents[index];
      agentPic.src = agent.profilePic;
      agentName.textContent = agent.name;
      agentStatus.textContent = isOnline ? "Online" : "Offline";
      agentWelcome.textContent = agent.welcomeMessage;
      startChat.onclick = () => {
        const whatsappURL = `https://wa.me/${agent.number}?text=${encodeURIComponent("Hi! I would like to chat with you.")}`;
        window.open(whatsappURL, '_blank');
      };
    }

    agents.forEach((agent, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = agent.name;
      agentSelect.appendChild(option);
    });

    agentSelect.addEventListener('change', (e) => {
      updateAgent(e.target.value);
    });

    widget.addEventListener('click', () => {
      popup.classList.toggle('show');
      smallPopup.classList.remove('show');
    });

    closeBtn.addEventListener('click', () => {
      popup.classList.remove('show');
    });

    // Show small popup
    setTimeout(() => {
      smallPopup.classList.add('show');
      if (soundUrl) {
        const audio = new Audio(soundUrl);
        audio.play();
      }
    }, popupDelay);

    updateAgent(0); // initialize first agent
  }

  window.createPremiumWhatsAppWidget = createWhatsAppWidget;
})();